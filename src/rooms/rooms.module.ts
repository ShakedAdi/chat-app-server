import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [UsersModule, MessagesModule],
  providers: [RoomsService],
})
export class RoomsModule {}
