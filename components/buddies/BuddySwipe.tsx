"use client";
import React from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import MatchModal from './MatchModal';
import { io, Socket } from 'socket.io-client';

const fetcher = (url: string) => fetch(url, { headers: { 'Content-Type': 'application/json', Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '' } }).then(r=>r.json());

interface BuddySwipeProps {
  filters?: {
    semester?: string;
    major?: string;
    courseCode?: string;
  };
}

export default function BuddySwipe({ filters = {} }: BuddySwipeProps) {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [matchState, setMatchState] = React.useState<{ open: boolean; data?: any }>({ open: false });
  // drag state for top card
  const [drag, setDrag] = React.useState({ x: 0, y: 0, rot: 0, dragging: false });
  const dragRef = React.useRef({ startX: 0, startY: 0, pointerId: null as any });

  // Build API URL with filters
  const buildApiUrl = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const params = new URLSearchParams();
    if (filters.semester) params.append('semester', filters.semester);
    if (filters.major) params.append('major', filters.major);
    if (filters.courseCode) params.append('course_code', filters.courseCode);
    return `${apiBase}/api/buddies/suggestions?${params.toString()}`;
  };

  const { data, error, mutate } = useSWR(buildApiUrl(), fetcher);
  const list = data && data.data ? data.data : [];

  React.useEffect(() => {
    // init socket
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const socketUrl = process.env.NEXT_PUBLIC_API_BASE || '';
    const s = io(socketUrl, { auth: { token } });
    setSocket(s);
    s.on('connect', () => {
      // register user id if available
      try { const uid = (window as any).__currentUserId || localStorage.getItem('userId'); if (uid) s.emit('register', uid); } catch(e){}
    });
    s.on('buddy:match', (payload:any) => {
      setMatchState({ open: true, data: payload });
    });

    // Fetch new matches on mount (if user reloaded)
    (async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
        const resp = await fetch(`${apiBase}/api/buddies/new-matches`, { headers: { Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '' } });
        if (!resp.ok) return;
        const j = await resp.json();
        if (j && j.data && j.data.length) {
          // open modal for the most recent. Use conversationId when available, fall back to matchId.
          const first = j.data[0];
          const conversationId = first.conversationId || first.matchId || first.id || null;
          setMatchState({ open: true, data: { conversationId, buddy: first.buddy } });
        }
      } catch (e) { /* ignore */ }
    })();
    return () => { s.disconnect(); };
  }, []);

  const doSwipe = async (targetId:number, action:'LIKE'|'PASS') => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
      await fetch(`${apiBase}/api/buddies/swipe`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '' }, body: JSON.stringify({ targetId, action }) });
      setCurrentIndex(i => i + 1);
      // optimistic: if match arrived via socket it will open modal
      mutate();
    } catch (e) {
      console.error(e);
    }
  };

  // drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    const p = e.nativeEvent;
    (e.target as Element).setPointerCapture(p.pointerId);
    dragRef.current.pointerId = p.pointerId;
    dragRef.current.startX = p.clientX;
    dragRef.current.startY = p.clientY;
    setDrag(d => ({ ...d, dragging: true }));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.pointerId) return;
    const p = e.nativeEvent;
    const dx = p.clientX - dragRef.current.startX;
    const dy = p.clientY - dragRef.current.startY;
    const rot = Math.max(Math.min(dx / 15, 25), -25);
    setDrag({ x: dx, y: dy, rot, dragging: true });
  };

  const onPointerUp = (e: React.PointerEvent, id?: number) => {
    const threshold = 120; // px to consider swipe
    const dx = drag.x;
    const abs = Math.abs(dx);
    setDrag(d => ({ ...d, dragging: false }));
    dragRef.current.pointerId = null;
    if (!id) id = current && current.id;
    if (abs > threshold && id) {
      const action = dx > 0 ? 'LIKE' : 'PASS';
      // animate out by setting large translate then move to next after short timeout
      setDrag(d => ({ ...d, x: dx > 0 ? 1000 : -1000, rot: dx > 0 ? 45 : -45 }));
      setTimeout(() => { doSwipe(id as number, action as any); setDrag({ x: 0, y: 0, rot: 0, dragging: false }); }, 200);
    } else {
      // reset position
      setDrag({ x: 0, y: 0, rot: 0, dragging: false });
    }
  };

  if (error) return <div className="p-6">Có lỗi, thử lại sau</div>;
  if (!data) return <div className="p-6">Đang tải gợi ý...</div>;

  const current = list[currentIndex];
  if (!current) return <div className="p-6">Hết gợi ý</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6">
      {/* Single card display */}
      <div className="relative w-full max-w-sm">
        <div 
          className="bg-white rounded-2xl shadow-lg p-6 border"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.rot}deg)`,
            transition: drag.dragging ? 'none' : 'transform 260ms ease'
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => onPointerUp(e, current.id)}
          onPointerCancel={(e) => onPointerUp(e, current.id)}
        >
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden relative">
              {current.avatar ? (
                <Image src={current.avatar} alt={current.name} fill sizes="128px" className="object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-4xl text-gray-400">?</div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="text-center mb-2">
            <h3 className="text-2xl font-bold text-gray-800">{current.name}</h3>
          </div>

          {/* Semester and Major */}
          <div className="text-center mb-6 space-y-1">
            <div className="text-lg text-gray-600">Kỳ {current.semester}</div>
            <div className="text-base text-gray-500">{current.specialization}</div>
          </div>

          {/* Action buttons - X and Heart */}
          <div className="flex justify-center gap-8">
            <button 
              onClick={(e) => { e.stopPropagation(); doSwipe(current.id, 'PASS'); }}
              className="w-16 h-16 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors shadow-md"
            >
              <span className="text-2xl">❌</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); doSwipe(current.id, 'LIKE'); }}
              className="w-16 h-16 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors shadow-md"
            >
              <span className="text-2xl">💚</span>
            </button>
          </div>
        </div>
      </div>

      <MatchModal open={matchState.open} data={matchState.data} onClose={() => setMatchState({ open: false })} />
    </div>
  );
}
