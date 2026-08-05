import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async userExists(userId: string) {
    const count = await this.prisma.user.count({ where: { id: userId } });
    return count !== 0;
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
