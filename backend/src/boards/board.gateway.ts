import { UseGuards } from '@nestjs/common';
import {
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from 'src/auth/ws-jwt.guard';

interface PresenceUser {
  userId: number;
  name: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/board',
})
export class BoardGateway implements OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private presence = new Map<number, Map<string, PresenceUser>>();

  emitToProject(projectId: number, event: string, data: unknown) {
    this.server.to(`project:${projectId}`).emit(event, data);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinBoard')
  handleJoin(client: Socket, payload: { projectId: number }) {
    void client.join(`project:${payload.projectId}`);

    if (!this.presence.has(payload.projectId)) {
      this.presence.set(payload.projectId, new Map());
    }
    this.presence.get(payload.projectId)?.set(client.id, {
      userId: client.data.user.id,
      name: client.data.user.name,
    });
    this.broadcastPresence(payload.projectId);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveBoard')
  handleLeave(client: Socket, payload: { projectId: number }) {
    void client.leave(`project:${payload.projectId}`);
    this.presence.get(payload.projectId)?.delete(client.id);
    this.broadcastPresence(payload.projectId);
  }

  handleDisconnect(client: Socket) {
    for (const [projectId, users] of this.presence.entries()) {
      users.forEach((user, socketId) => {
        if (socketId === client.id) {
          users.delete(socketId);
          this.broadcastPresence(projectId);
        }
      });
    }
  }

  private broadcastPresence(projectId: number) {
    const users = [...(this.presence.get(projectId)?.values() ?? [])];
    this.emitToProject(projectId, 'board.presence', { projectId, users });
  }
}
