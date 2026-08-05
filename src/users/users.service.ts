import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async idsByUsernames(usernames: string[]) {
    const unique = [...new Set(usernames)];
    const users = await this.prisma.user.findMany({
      where: { username: { in: unique } },
      select: { id: true, username: true },
    });

    if (users.length !== unique.length) {
      const found = new Set(users.map((u) => u.username));
      const missing = unique.filter((username) => !found.has(username));
      throw new BadRequestException(`Unknown users: ${missing.join(', ')}`);
    }

    return users.map((u) => u.id);
  }

  async idByUsername(username: string) {
    return (await this.idsByUsernames([username])).at(0);
  }

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
