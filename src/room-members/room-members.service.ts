import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberRole, RoomType } from '../generated/prisma/enums';

@Injectable()
export class RoomMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async requireMembership(roomId: string, userId: string) {
    const membership = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
      select: { role: true, room: { select: { type: true } } },
    });
    if (!membership) throw new NotFoundException('Room not found');
    return membership;
  }

  async requireGroupMembership(roomId: string, userId: string) {
    const membership = await this.requireMembership(roomId, userId);
    if (membership.room.type !== RoomType.GROUP) {
      throw new BadRequestException('Room is not a group');
    }
    return membership;
  }

  async requireGroupAdmin(roomId: string, userId: string) {
    const membership = await this.requireGroupMembership(roomId, userId);
    if (membership.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Only group admins can manage members');
    }
    return membership;
  }
}
