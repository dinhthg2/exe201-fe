'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Send, User, Search, Phone, Video, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Contact {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  type: 'friend' | 'tutor';
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  read?: boolean;
}

interface MessagesProps {
  selectedContactId?: number;
}

const Messages: React.FC<MessagesProps> = ({ selectedContactId }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContacts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/dashboard/messages', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const result = await response.json();
      if (result.success) {
        setContacts(result.data);
        
        // Select first contact or provided contact ID
        const contactToSelect = selectedContactId 
          ? result.data.find((c: Contact) => c.id === selectedContactId)
          : result.data[0];
          
        if (contactToSelect) {
          setSelectedContact(contactToSelect);
        }
      } else {
        throw new Error(result.message || 'Failed to load contacts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [router, selectedContactId]);

  const fetchMessages = useCallback(async (contactId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/dashboard/messages?friend_id=${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const result = await response.json();
      if (result.success) {
        setMessages(result.data);
      } else {
        throw new Error(result.message || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id);
    }
  }, [selectedContact, fetchMessages]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || sendingMessage) return;

    try {
      setSendingMessage(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: selectedContact.id,
          content: newMessage.trim(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setNewMessage('');
        // Refresh messages
        await fetchMessages(selectedContact.id);
        // Refresh contacts to update last message
        fetchContacts();
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex">
        <div className="w-1/3 border-r animate-pulse">
          <div className="h-16 bg-gray-200 border-b"></div>
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 animate-pulse">
          <div className="h-16 bg-gray-200 border-b"></div>
          <div className="flex-1 bg-gray-100"></div>
          <div className="h-16 bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Sidebar - Contacts */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Tin nhắn</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left ${
                    selectedContact?.id === contact.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="relative">
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      {contact.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {formatTime(contact.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {contact.lastMessage || 'Chưa có tin nhắn'}
                      </p>
                      {contact.unreadCount && contact.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        contact.type === 'tutor' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {contact.type === 'tutor' ? 'Gia sư' : 'Bạn học'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <User className="h-12 w-12 mb-2 text-gray-300" />
              <p className="text-sm">Không tìm thấy liên hệ</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {selectedContact.avatar ? (
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {selectedContact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedContact.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === parseInt(localStorage.getItem('userId') || '0');
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={sendingMessage}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <User className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chọn một cuộc trò chuyện
            </h3>
            <p className="text-sm text-center">
              Chọn một liên hệ từ danh sách bên trái để bắt đầu trò chuyện
            </p>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-1 right-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Messages;