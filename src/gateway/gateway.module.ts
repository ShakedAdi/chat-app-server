import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { RoomMembersModule } from '../room-members/room-members.module';

@Module({
  imports: [RoomMembersModule],
  providers: [MyGateway],
})
export class GatewayModule {}
