import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);
    if (!token) throw new WsException('Unauthorized');

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      client.data.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      };
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private extractToken(client: Socket): string | null {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) return null;

    const parsed = parse(cookieHeader);
    return parsed.access_token ?? null;
  }
}
