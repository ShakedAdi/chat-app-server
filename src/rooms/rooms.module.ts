import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { RoomMembersModule } from '../room-members/room-members.module';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [UsersModule, MessagesModule, RoomMembersModule],
  providers: [RoomsService],
  controllers: [RoomsController],
})
export class RoomsModule {}
