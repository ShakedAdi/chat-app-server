import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async usersExist(userIds: string[]) {
    const unique = [...new Set(userIds)];
    const count = await this.prisma.user.count({
      where: { id: { in: unique } },
    });
    return count === unique.length;
  }

  userExists(userId: string) {
    return this.usersExist([userId]);
  }

  findByName(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(username: string, passwordHash: string) {
    return this.prisma.user.create({
      data: { username, displayName: username, passwordHash },
      select: { id: true, username: true },
    });
  }
}
