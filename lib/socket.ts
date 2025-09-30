import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(baseUrl: string) {
  if (!socket) {
    // read token from localStorage if available
    let token: string | null = null;
    try {
      if (typeof window !== 'undefined') token = localStorage.getItem('token');
    } catch (e) { token = null; }

    console.log('[socket] Initializing with token:', token);

    socket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: token ? { token } : undefined
    });

    // helpful debug log for connection issues
    socket.on('connect', () => { console.log('[socket] connected'); });
    socket.on('disconnect', (reason) => { console.log('[socket] disconnected', reason); });
    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.warn('[socket] connect_error', err && err.message ? err.message : err);
    });
  }
  return socket;
}

export function registerUser(userId: number) {
  if (socket && userId) {
    try {
      socket.emit('register', userId);
      socket.off('connect');
      socket.on('connect', () => {
        // re-register after reconnect to continue receiving events
        socket!.emit('register', userId);
      });
    } catch (e) {
      // ignore
    }
  }
}
