import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [MessagesService],
})
export class MessagesModule {}
