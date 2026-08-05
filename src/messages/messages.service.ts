import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageType } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  createTextMessage(roomId: string, senderId: string, body: string) {
    return this.prisma.message.create({
      data: { type: MessageType.TEXT, body, roomId, senderId },
      select: { id: true, createdAt: true },
    });
  }

  getLastMessages(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
  }

  private createSystemMessage(
    roomId: string,
    type: MessageType,
    actorId: string,
    targetId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    return (tx ?? this.prisma).message.create({
      data: {
        type,
        actorId,
        roomId,
        ...(type !== MessageType.SYSTEM_MEMBER_LEAVE && { targetId }),
      },
      select: { id: true, createdAt: true },
    });
  }

  createAddMemberMessage(
    roomId: string,
    actorId: string,
    targetId: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.createSystemMessage(
      roomId,
      MessageType.SYSTEM_ADD_MEMBER,
      actorId,
      targetId,
      tx,
    );
  }

  createRemoveMemberMessage(
    roomId: string,
    actorId: string,
    targetId: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.createSystemMessage(
      roomId,
      MessageType.SYSTEM_REMOVE_MEMBER,
      actorId,
      targetId,
      tx,
    );
  }

  createMemberLeaveMessage(
    roomId: string,
    actorId: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.createSystemMessage(
      roomId,
      MessageType.SYSTEM_MEMBER_LEAVE,
      actorId,
      undefined,
      tx,
    );
  }
}
