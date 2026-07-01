import { io, Socket } from 'socket.io-client';

import { env } from '@/core/config/env';

let socket: Socket | null = null;

export function conectarSocket(ruc: string, email: string): Socket {
  if (!socket) {
    socket = io(env.socketUrl, { transports: ['polling'], autoConnect: false });
  }
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('subscribe', `ruc_${ruc}`);
  socket.emit('data-company', { ruc, user: email });
  return socket;
}

export function desconectarSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function emitirMesaAbierta(mesaId: number, ruc: string): void {
  socket?.emit('open-table', { table_id: mesaId, ruc });
}
