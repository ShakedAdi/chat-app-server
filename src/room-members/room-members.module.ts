import { Module } from '@nestjs/common';
import { RoomMembersService } from './room-members.service';

@Module({
  providers: [RoomMembersService],
  exports: [RoomMembersService],
})
export class RoomMembersModule {}
