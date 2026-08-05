import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberRole, RoomType } from '../generated/prisma/enums';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { RoomMembersService } from '../room-members/room-members.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
    private readonly roomMembersService: RoomMembersService,
  ) {}

  async roomExists(roomId: string) {
    const count = await this.prisma.room.count({ where: { id: roomId } });
    return count !== 0;
  }

  async createDirect(meId: string, otherId: string) {
    if (!(await this.usersService.usersExist([meId, otherId]))) {
      throw new BadRequestException('One of the users does not exist');
    }

    const dmKey = [meId, otherId].sort().join(':');

    const existing = await this.prisma.room.findUnique({ where: { dmKey } });
    if (existing) return existing;

    return await this.prisma.room.create({
      data: {
        type: RoomType.DIRECT,
        dmKey,
        members: { create: [{ userId: meId }, { userId: otherId }] },
      },
      select: { id: true, createdAt: true },
    });
  }

  async deleteDirect(meId: string, otherId: string) {
    const dmKey = [meId, otherId].sort().join(':');

    const { count } = await this.prisma.room.deleteMany({ where: { dmKey } });
    if (count === 0) throw new NotFoundException('Direct room not found');
  }

  async createGroup(creatorId: string, memberIds: string[], name: string) {
    if (!(await this.usersService.usersExist([creatorId, ...memberIds]))) {
      throw new BadRequestException('One of the users does not exist');
    }
    const others = [...new Set(memberIds)].filter((id) => id !== creatorId);

    return this.prisma.room.create({
      data: {
        type: RoomType.GROUP,
        name,
        members: {
          create: [
            { userId: creatorId, role: MemberRole.ADMIN },
            ...others.map((userId) => ({ userId })),
          ],
        },
      },
      select: { id: true, createdAt: true },
    });
  }

  async deleteGroup(roomId: string, userId: string) {
    await this.roomMembersService.requireGroupAdmin(roomId, userId);

    const { count } = await this.prisma.room.deleteMany({
      where: { id: roomId },
    });
    if (count === 0) throw new NotFoundException('Group not found');
  }

  async addMember(actorId: string, roomId: string, targetId: string) {
    await this.roomMembersService.requireGroupAdmin(roomId, actorId);

    if (!(await this.usersService.userExists(targetId))) {
      throw new BadRequestException('Unknown user');
    }

    const already = await this.prisma.roomMember.count({
      where: { roomId, userId: targetId },
    });
    if (already !== 0) {
      throw new ConflictException('User is already a member');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.roomMember.create({
        data: { roomId, userId: targetId, role: MemberRole.MEMBER },
      });
      return this.messagesService.createAddMemberMessage(
        roomId,
        actorId,
        targetId,
        tx,
      );
    });
  }

  async removeMember(actorId: string, roomId: string, targetId: string) {
    await this.roomMembersService.requireGroupAdmin(roomId, actorId);

    if (targetId === actorId) {
      throw new BadRequestException('Use leave group');
    }

    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.roomMember.deleteMany({
        where: { roomId, userId: targetId },
      });

      if (count === 0) throw new NotFoundException('User is not a member');

      return this.messagesService.createRemoveMemberMessage(
        roomId,
        actorId,
        targetId,
        tx,
      );
    });
  }

  async leaveGroup(meId: string, roomId: string) {
    const { role } = await this.roomMembersService.requireGroupMembership(
      roomId,
      meId,
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.roomMember.delete({
        where: { roomId_userId: { roomId, userId: meId } },
      });

      const remaining = await tx.roomMember.findMany({
        where: { roomId },
        select: { id: true, role: true },
        orderBy: { joinedAt: 'asc' },
      });

      if (remaining.length === 0) {
        await tx.room.delete({ where: { id: roomId } });
        return { roomDeleted: true };
      }

      if (
        role === MemberRole.ADMIN &&
        !remaining.some((m) => m.role === MemberRole.ADMIN)
      ) {
        await tx.roomMember.update({
          where: { id: remaining[0].id },
          data: { role: MemberRole.ADMIN },
        });
      }

      await this.messagesService.createMemberLeaveMessage(roomId, meId, tx);
      return { roomDeleted: false };
    });
  }

  getMembers(roomId: string) {
    return this.prisma.roomMember.findMany({ where: { roomId } });
  }
}
