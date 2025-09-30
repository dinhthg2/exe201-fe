'use client';

import { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import SiteFooter from '../SiteFooter.jsx';
import ModalMatchSuccess from '../buddies/ModalMatchSuccess';
import { useEffect } from 'react';
import { getSocket, registerUser } from '../../lib/socket';

interface StudentDashboardLayoutProps {
  children: ReactNode;
}

export default function StudentDashboardLayout({ children }: StudentDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [matchModal, setMatchModal] = useState<{ open: boolean; user?: any; matchId?: number; conversationId?: string }>({ open: false });

  useEffect(() => {
    // Initialize socket and listen for match events
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000').replace(/\/api$/, '');
      const socket = getSocket(base);
      // attempt to register current user for room mapping
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && payload.id) {
              registerUser(payload.id);
            }
          }
        }
      } catch (e) { /* ignore */ }
      const handler = (payload: any) => {
        // payload: { matchId, conversationId, user }
        setMatchModal({ open: true, user: payload.user, matchId: payload.matchId, conversationId: String(payload.conversationId) });
      };
      socket.on('match', handler);
      return () => { socket.off('match', handler); };
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <Header setSidebarOpen={setSidebarOpen} />
      
      {/* Body container - no gaps */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64">
          <Sidebar />
        </div>
        
        {/* Mobile Sidebar */}
        <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main content - no padding, seamless connection */}
        <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          {children}
        </main>
      </div>
      
        {/* Match modal (global) */}
        {matchModal.open && matchModal.user && (
          <ModalMatchSuccess
            matchUser={matchModal.user}
            matchId={matchModal.matchId as number}
            conversationId={matchModal.conversationId as string}
            onClose={() => setMatchModal({ open: false })}
          />
        )}

        {/* Footer - no gap */}
        <SiteFooter />
    </div>
  );
}