import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(`${import.meta.env.VITE_API_URL}/board`, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};
