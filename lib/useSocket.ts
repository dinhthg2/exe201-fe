import { useEffect, useRef } from 'react';
import { getSocket, registerUser } from './socket';

export function useSocket(userId?: number) {
  const sockRef = useRef<any>(null);
  useEffect(() => {
    if (!userId) return;
    const base = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/api$/, '') || 'http://localhost:5000';
    const s = getSocket(base);
    registerUser(userId);
    sockRef.current = s;
  }, [userId]);
  return sockRef.current;
}
