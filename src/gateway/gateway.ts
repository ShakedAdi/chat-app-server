import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { DefaultEventsMap, Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { RoomMembersService } from '../room-members/room-members.service';
import { JwtService } from '@nestjs/jwt';

const ACCESS_TOKEN_COOKIE = 'access_token=';

type AuthedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { user: JwtPayload }
>;

@WebSocketGateway({
  cors: {
    origin: (_origin, callback) =>
      callback(null, process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173'),
    credentials: true,
  },
})
export class MyGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly roomMembersService: RoomMembersService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthedSocket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      client.data.user = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      client.disconnect();
      return;
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: AuthedSocket,
  ) {
    await this.roomMembersService.requireMembership(
      roomId,
      client.data.user.sub,
    );
    await client.join(roomId);
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: AuthedSocket,
  ) {
    await client.leave(roomId);
  }

  private extractToken(client: AuthedSocket): string | undefined {
    const fromCookie = client.handshake.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(ACCESS_TOKEN_COOKIE))
      ?.slice(ACCESS_TOKEN_COOKIE.length);
    if (fromCookie) return decodeURIComponent(fromCookie);

    const [type, token] =
      client.handshake.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
