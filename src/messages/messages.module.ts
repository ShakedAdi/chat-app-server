import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { RoomMembersModule } from '../room-members/room-members.module';

@Module({
  imports: [RoomMembersModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
