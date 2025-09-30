'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ConversationSidebar from '../components/ConversationSidebar';
import ChatWindow from '../components/ChatWindow';
import { useRouter } from 'next/navigation';

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

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Get router instance
  const router = useRouter();

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
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleSelectConversation = (newConversationId: string) => {
    router.push(`/dashboard/messages/${newConversationId}`);
  };

  const handleBackToSidebar = () => {
    router.push('/dashboard/messages');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading conversation...</div>
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

  // Check if conversation exists
  const currentConversation = conversations.find(c => c.id === conversationId);
  if (!loading && !currentConversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Conversation not found</h2>
          <p className="text-gray-600 mb-4">This conversation does not exist or you do not have access to it.</p>
          <button
            onClick={() => router.push('/dashboard/messages')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {!isMobile && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <ConversationSidebar
            conversations={conversations}
            selectedConversation={conversationId}
            onSelectConversation={handleSelectConversation}
            currentUserId={currentUser?.id}
          />
        </div>
      )}

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          conversationId={conversationId}
          currentUserId={currentUser?.id}
          onBack={isMobile ? handleBackToSidebar : undefined}
          conversations={conversations}
        />
      </div>
    </div>
  );
}