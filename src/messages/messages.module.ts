import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
