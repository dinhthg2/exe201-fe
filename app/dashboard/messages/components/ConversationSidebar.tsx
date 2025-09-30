'use client';

import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  participants: Array<{
    id: number;
    name: string;
    avatarUrl?: string;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    senderId: number;
    createdAt: string;
    isRead: boolean;
  };
  updatedAt: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: number;
}

export default function ConversationSidebar({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId
}: ConversationSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    
    return conversations.filter(conv => {
      const otherUser = conv.participants[0];
      return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [conversations, searchTerm]);

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}${avatarUrl}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>
        
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.participants[0];
              const isSelected = selectedConversation === conversation.id;
              const isUnread = conversation.lastMessage && 
                              conversation.lastMessage.senderId !== currentUserId && 
                              !conversation.lastMessage.isRead;

              return (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {otherUser?.avatarUrl ? (
                        <img
                          src={getAvatarUrl(otherUser.avatarUrl) || undefined}
                          alt={otherUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium text-lg">
                            {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium truncate ${
                          isUnread ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {otherUser?.name || 'Unknown User'}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatMessageTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      {conversation.lastMessage ? (
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm truncate ${
                            isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                          }`}>
                            {conversation.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                            {truncateMessage(conversation.lastMessage.content)}
                          </p>
                          {isUnread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1">No messages yet</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}