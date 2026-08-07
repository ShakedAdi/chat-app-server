import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { RoomMembersModule } from '../room-members/room-members.module';
import { MessagesController } from './messages.controller';

@Module({
  imports: [RoomMembersModule],
  providers: [MessagesService],
  exports: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
