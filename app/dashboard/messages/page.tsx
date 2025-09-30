'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConversationSidebar from './components/ConversationSidebar';
import ChatWindow from './components/ChatWindow';

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

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Check if user is authenticated and get user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Decode token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser(payload);
    } catch (err) {
      console.error('Invalid token:', err);
      localStorage.removeItem('token');
      router.push('/login');
      return;
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setShowSidebar(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  // Load conversations
  useEffect(() => {
    if (!currentUser) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}/api/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setConversations(data.data || []);
        } else {
          throw new Error('Failed to load conversations');
        }
      } catch (err) {
        console.error('Load conversations error:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUser]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {(!isMobile || showSidebar) && (
        <div className={`${isMobile ? 'w-full' : 'w-80'} bg-white border-r border-gray-200 flex flex-col`}>
          <ConversationSidebar
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentUserId={currentUser?.id}
          />
        </div>
      )}

      {/* Chat Window */}
      {(!isMobile || !showSidebar) && (
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              conversationId={selectedConversation}
              currentUserId={currentUser?.id}
              onBack={isMobile ? handleBackToSidebar : undefined}
              conversations={conversations}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="text-lg font-medium mb-1">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
