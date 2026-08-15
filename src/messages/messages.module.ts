import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { RoomMembersModule } from '../room-members/room-members.module';
import { MessagesController } from './messages.controller';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [RoomMembersModule, GatewayModule],
  providers: [MessagesService],
  exports: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
