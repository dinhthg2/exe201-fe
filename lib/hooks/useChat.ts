import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../socket';

interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  file_url?: string; // Add this line
  file_type?: string; // Add this line
  file_name?: string; // Add this line
}

interface OnlineUser {
  id: number;
  name: string;
  avatarUrl?: string;
}

interface UseChatResult {
  messages: Message[];
  isTyping: boolean;
  typingUser: string | null;
  onlineUsers: OnlineUser[];
  sendMessage: (content: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  markAsRead: () => Promise<void>;
  isConnected: boolean;
  error: string | null;
}

const useChat = (conversationId: string | null, userId: number | null): UseChatResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentConversationRef = useRef<string | null>(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Compute API base that always includes /api
  const getApiBase = () => {
    const raw = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000').replace(/\/$/, '');
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  };

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const token = getAuthToken();
    if (!token) {
      setError('No authentication token found');
      return;
    }

    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000').replace(/\/api$/, '');
      const socket = getSocket(base) as Socket;
      socketRef.current = socket;

      // Connection events
      const onConnect = () => { console.log('[useChat] Socket connected'); setIsConnected(true); setError(null); };
      const onDisconnect = (reason: string) => { console.log('[useChat] Socket disconnected', reason); setIsConnected(false); setError('Connection lost'); };
      const onConnectError = (err: any) => { console.error('[useChat] Socket connection error:', err); setIsConnected(false); setError('Connection failed'); };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onConnectError);

      // Chat events
      // server currently emits 'messageReceived' on room broadcast
      socket.on('messageReceived', (msg: any) => {
        try {
          const receivedMessage: Message = {
            id: msg.id || String(Date.now()),
            conversationId: msg.conversationId || msg.conversation_id || '',
            senderId: msg.senderId || msg.sender_id || 0,
            content: msg.content || msg.message || '',
            createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
            isRead: msg.isRead || false,
            sender: msg.sender || { id: msg.senderId || msg.sender_id || 0, name: msg.senderName || 'Unknown' },
            file_url: msg.file_url || null,
            file_type: msg.file_type || null,
            file_name: msg.file_name || null,
          };

          setMessages(prev => {
            // Check if this is an optimistic message sent by the current user
            const existingIndex = prev.findIndex(
              (m) => m.senderId === userId && m.content === receivedMessage.content && !m.id // Optimistic messages might not have an ID yet
            );

            if (existingIndex > -1) {
              // Replace the optimistic message with the server-confirmed message
              const newMessages = [...prev];
              newMessages[existingIndex] = receivedMessage;
              return newMessages;
            } else if (!prev.some(m => m.id === receivedMessage.id)) {
              // Add new message if it doesn't already exist (to avoid duplicates from optimistic update and socket)
              return [...prev, receivedMessage];
            }
            return prev;
          });
        } catch (e) {
          console.error('[useChat] Error processing received message:', e);
          // fallback: push raw
          setMessages(prev => [...prev, msg]);
        }
      });

      // also listen for server 'match' event (so chat UI can react if desired)
      socket.on('match', (payload: any) => {
        // noop here (global layout handles modal). Keep for future use.
        console.debug('[useChat] match event received', payload);
      });

      socket.on('typing', ({ userId: typingUserId, userName, isTyping: typing }) => {
        if (typingUserId !== userId) {
          setIsTyping(typing);
          setTypingUser(typing ? userName : null);
        }
      });

      // Online status events
      socket.on('userOnline', (user: OnlineUser) => {
        setOnlineUsers(prev => {
          const exists = prev.find(u => u.id === user.id);
          if (exists) return prev;
          return [...prev, user];
        });
      });

      socket.on('userOffline', ({ userId: offlineUserId }) => {
        setOnlineUsers(prev => prev.filter(user => user.id !== offlineUserId));
      });

      socket.on('onlineUsers', (users: OnlineUser[]) => {
        setOnlineUsers(users);
      });

      // Listen for message read events from backend via Socket.IO
      socket.on('messagesRead', ({ conversationId: readConvId, senderId: readerId }) => {
        // Only update messages for the current conversation and not sent by the reader
        if (readConvId === conversationId && readerId !== userId) {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.conversationId === readConvId && msg.senderId !== readerId && !msg.isRead
                ? { ...msg, isRead: true }
                : msg
            )
          );
        }
      });

      return () => {
        // remove listeners added by this hook but do not disconnect shared socket
        socket.off('connect', onConnect);
        socket.off('disconnect', onDisconnect);
        socket.off('connect_error', onConnectError);
        socket.off('messageReceived');
        socket.off('typing');
        socket.off('userOnline');
        socket.off('userOffline');
        socket.off('onlineUsers');
        socket.off('match');
        socket.off('messagesRead'); // Add this line to remove the new listener
      };
    } catch (err) {
      console.error('Socket initialization error:', err);
      setError('Failed to initialize connection');
    }
  }, [userId]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (!socketRef.current || !conversationId) return;

    // Leave previous conversation
    if (currentConversationRef.current) {
      socketRef.current.emit('leaveConversation', {
        conversationId: currentConversationRef.current
      });
    }

    // Join new conversation
    socketRef.current.emit('joinConversation', {
      conversationId
    });

    currentConversationRef.current = conversationId;

    return () => {
      if (socketRef.current && conversationId) {
        socketRef.current.emit('leaveConversation', {
          conversationId
        });
      }
    };
  }, [conversationId]);

  // Send message function
  const sendMessage = useCallback(async (content: string, file?: File) => {
    if (!conversationId || !userId || (!content.trim() && !file)) return; // Allow sending empty message with file

    try {
      const token = getAuthToken();
      const formData = new FormData();

      if (content.trim()) {
        formData.append('content', content.trim());
      }
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(`${getApiBase()}/messages/${conversationId}`, {
        method: 'POST',
        headers: {
          // Do NOT set Content-Type header manually for FormData
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });


      // Parse response and show server error if any
      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // ignore parse error
      }

      if (!response.ok) {
        const serverMsg = responseData && responseData.message ? responseData.message : 'Failed to send message';
        setError(serverMsg);
        throw new Error(serverMsg);
      }

      // Only append message if it doesn't already exist (socket might have added it first)
      const newMsgId = responseData && responseData.data && responseData.data.id ? responseData.data.id : String(Date.now());
      const messageObj: Message = {
        id: newMsgId,
        conversationId: conversationId,
        senderId: userId as number,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
        sender: { id: userId as number, name: 'You' },
        file_url: responseData && responseData.data ? responseData.data.file_url || null : null,
        file_type: responseData && responseData.data ? responseData.data.file_type || null : null,
        file_name: responseData && responseData.data ? responseData.data.file_name || null : null,
      };

      setMessages(prev => {
        // Deduplicate by server id if present
        if (prev.some(m => m.id === messageObj.id)) return prev;

        // Also dedupe by same sender + content + file_name (in case server id hasn't propagated yet)
        if (prev.some(m => m.senderId === messageObj.senderId && m.content === messageObj.content && m.file_name === messageObj.file_name)) {
          return prev;
        }

        return prev.concat(messageObj);
      });

      // Clear previous error on success
      setError(null);

      // Message will also be added via socket event, but optimistic update is faster
    } catch (err) {
      console.error('Send message error:', err);
      // if err has message, set it; otherwise keep generic
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [conversationId, userId]);

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;

    socketRef.current.emit('typing', {
      conversationId,
      isTyping: true
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds by emitting directly (avoid referencing stopTyping in deps)
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && conversationId) {
        socketRef.current.emit('typing', { conversationId, isTyping: false });
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setIsTyping(false);
      setTypingUser(null);
    }, 3000);
  }, [conversationId]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;

    socketRef.current.emit('typing', {
      conversationId,
      isTyping: false
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setIsTyping(false);
    setTypingUser(null);
  }, [conversationId]);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || !userId) return; // Ensure userId is available for marking read

    try {
      const token = getAuthToken();
  const response = await fetch(`${getApiBase()}/messages/${conversationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // No body needed for this PATCH request as conversationId is in params
      });

      if (response.ok) {
        // Optimistically update messages as read on frontend
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.conversationId === conversationId && msg.senderId !== userId && !msg.isRead
              ? { ...msg, isRead: true }
              : msg
          )
        );
        // Emit a socket event to inform other users in the conversation
        socketRef.current?.emit('markMessagesRead', { conversationId, readerId: userId });
      } else {
        throw new Error('Failed to mark messages as read');
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  }, [conversationId, userId]); // Add userId to dependencies

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(
    `${getApiBase()}/messages/${conversationId}?limit=50&offset=0`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Normalize backend message shape to the Message interface used in frontend.
          const normalized: Message[] = (data.data || []).map((m: any) => ({
            id: m.id || String(Date.now()),
            conversationId: m.conversation_id || m.conversationId || '',
            senderId: m.sender_id || m.senderId || (m.sender && m.sender.id) || 0,
            content: m.content || m.message || '',
            createdAt: m.created_at || m.createdAt || new Date().toISOString(),
            isRead: m.is_read || m.isRead || false,
            sender: m.sender || (m.sender_id ? { id: m.sender_id, name: m.sender_name || 'Unknown' } : null),
            file_url: m.file_url || null,
            file_type: m.file_type || null,
            file_name: m.file_name || null,
          }));

          setMessages(normalized);
        } else {
          throw new Error('Failed to load messages');
        }
      } catch (err) {
        console.error('Load messages error:', err);
        setError('Failed to load messages');
      }
    };

    loadMessages();
  }, [conversationId]);

  return {
    messages,
    isTyping,
    typingUser,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    isConnected,
    error
  };
};

export default useChat;