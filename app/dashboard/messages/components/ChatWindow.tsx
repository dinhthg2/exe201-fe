'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import useChat from '../../../../lib/hooks/useChat';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'; // Import EmojiPicker

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

interface Conversation {
  id: string;
  participants: Array<{
    id: number;
    name: string;
    avatarUrl?: string;
  }>;
  lastMessage?: any;
  updatedAt: string;
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: number;
  onBack?: () => void;
  conversations: Conversation[];
}

export default function ChatWindow({
  conversationId,
  currentUserId,
  onBack,
  conversations
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // New state for selected file
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // New state for emoji picker
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden file input
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
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
  } = useChat(conversationId, currentUserId);

  // Temporary wrapper to allow sending file until types propagate everywhere
  const sendMessageWithFile = (content: string, file?: File) =>
    (sendMessage as unknown as (c: string, f?: File) => Promise<void>)(content, file);

  // Get current conversation info
  const currentConversation = conversations.find(c => c.id === conversationId);
  const otherUser = currentConversation?.participants[0];
  const isOtherUserOnline = otherUser ? onlineUsers.some(u => u.id === otherUser.id) : false;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    const timer = setTimeout(() => {
      markAsRead();
    }, 1000);

    return () => clearTimeout(timer);
  }, [conversationId, markAsRead]);

  // Handle input changes for typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);

    // Start typing indicator
    startTyping();

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return; // Allow sending message with only file

    const messageContent = inputMessage.trim();
    // Capture current selected file so we can pass it to the API before clearing UI state
    const fileToSend = selectedFile;
    // Clear input UI immediately for responsiveness but DO NOT clear the file reference used for sending
    setInputMessage('');
    stopTyping();

    try {
      console.log('Attempting to send message:', messageContent, 'file:', fileToSend);
      await sendMessageWithFile(messageContent, fileToSend || undefined); // Pass captured file

      // Clear file input only after successful send to avoid dropping the file prematurely
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }

      // Focus back to input
      inputRef.current?.focus();
    } catch (err) {
      console.error('Send message error:', err);
      // Restore message if failed
      setInputMessage(messageContent);
      // Restore file if failed (we still have fileToSend reference)
      if (fileToSend) setSelectedFile(fileToSend);
    }
  };

  // Handle emoji click
  const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    setInputMessage((prevInput) => prevInput + emojiData.emoji);
    setShowEmojiPicker(false); // Close picker after selecting emoji
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message time
  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isToday(date)) {
        return format(date, 'HH:mm');
      } else if (isYesterday(date)) {
        return `Yesterday ${format(date, 'HH:mm')}`;
      } else {
        return format(date, 'MMM dd, HH:mm');
      }
    } catch {
      return '';
    }
  };

  // Get avatar URL
  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    // Ensure we don't accidentally include a trailing /api in the origin
    const raw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const origin = raw.replace(/\/api$/, '').replace(/\/$/, '');
    return `${origin}${avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`}`;
  };

  // API origin for serving static files (ensure no '/api' suffix)
  const apiOrigin = (() => {
    const raw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    return raw.replace(/\/api$/, '').replace(/\/$/, '');
  })();

  // Do not block the UI when connection errors occur. Show inline message instead.

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
          )}
          
            <div className="relative">
            {otherUser?.avatarUrl ? (
              <img
                src={getAvatarUrl(otherUser.avatarUrl) || undefined}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium">
                  {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            
            {isOtherUserOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="font-medium text-gray-900">{otherUser?.name || 'Unknown User'}</h2>
            <p className="text-sm text-gray-500">
              {isOtherUserOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">💬</div>
              <p>Start your conversation with {otherUser?.name}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUserId;
              console.log(`Message ID: ${message.id}, Sender ID: ${message.senderId}, Current User ID: ${currentUserId}, Is Own Message: ${isOwnMessage}`);
              const showAvatar = !isOwnMessage && 
                (index === 0 || messages[index - 1].senderId !== message.senderId);

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                    showAvatar ? 'items-end' : 'items-center'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="w-8 h-8 mr-2 flex-shrink-0">
                      {showAvatar ? (
                        otherUser?.avatarUrl ? (
                          <img
                            src={getAvatarUrl(otherUser.avatarUrl) || undefined}
                            alt={otherUser.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                        )
                      ) : null}
                    </div>
                  )}

                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.file_url && (
                      <div className="mb-2">
                        {message.file_type?.startsWith('image/') ? (
                          // Image preview
                          <img
                            src={`${apiOrigin}${message.file_url?.startsWith('/') ? message.file_url : `/${message.file_url || ''}`}`}
                            alt={message.file_name || 'Attached image'}
                            className="max-w-full h-auto rounded-lg mb-2"
                          />
                        ) : (
                          // File icon and name
                          <a
                            href={`${apiOrigin}${message.file_url?.startsWith('/') ? message.file_url : `/${message.file_url || ''}`}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-blue-600 hover:underline"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 21l-5.25-5.25v-4.992c0-.821.503-1.576 1.25-1.868s1.751-.23 2.37.161L18.75 12l-1.5 1.5M4.5 18.75L7.5 21h9m-9-3.75h.008v.008H7.5v-.008zm-2.25 0H3.75a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V18h-.008z" />
                            </svg>
                            <span>{message.file_name || 'File'}</span>
                          </a>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {/* Message status */}
                    {isOwnMessage && (
                      <div className={`flex justify-end mt-1 text-xs ${
                        message.isRead ? 'text-blue-200' : 'text-blue-100'
                      }`}>
                        {message.isRead ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.01-.118 1.98-.313 2.9-.145.64-.324 1.255-.559 1.838-.25.64-.572 1.2-.957 1.685A.75.75 0 0117.25 21h-5.493c-1.867 0-3.679-.766-4.993-2.007a6.657 6.657 0 01-1.988-4.143 6.664 6.664 0 014.143-1.988l.807-.032a6.134 6.134 0 014.143 1.988c1.314 1.241 2.073 3.054 2.074 4.991h.75z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && typingUser && (
              <div className="flex items-end">
                <div className="w-8 h-8 mr-2 flex-shrink-0">
                  {otherUser?.avatarUrl ? (
                    <img
                      src={getAvatarUrl(otherUser.avatarUrl) || undefined}
                      alt={otherUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{typingUser} is typing...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
        {selectedFile && (
          <div className="flex items-center space-x-2 p-2 mb-2 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-700">Selected file: {selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700 text-sm">
              X
            </button>
          </div>
        )}
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => { setSelectedFile(e.target.files ? e.target.files[0] : null); }}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Attach file"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12h7.5m-7.5 3H12M10.5 21l-5.25-5.25v-4.992c0-.821.503-1.576 1.25-1.868s1.751-.23 2.37.161L18.75 12l-1.5 1.5M4.5 18.75L7.5 21h9m-9-3.75h.008v.008H7.5v-.008zm-2.25 0H3.75a.75.75 0 00-.75.75v2.25c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V18h-.008z" />
            </svg>
          </button>
          {/* Emoji Button */}
          <button
            onClick={(e) => { e.preventDefault(); setShowEmojiPicker((prev) => !prev); }}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Insert emoji"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm4.5 0c0 .414-.168.75-.375.75S13.5 10.164 13.5 9.75 13.668 9 13.875 9s.375.336.375.75z" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onBlur={() => stopTyping()}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{
                minHeight: '40px',
                maxHeight: '120px'
              }}
            />

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-10">
                <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width="100%" />
              </div>
            )}
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() && !selectedFile}
            className={`p-2 rounded-lg transition-colors ${
              (inputMessage.trim() || selectedFile)
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}