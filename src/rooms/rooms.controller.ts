import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateGroupDto } from './dto/create-group.dto';
import { UsersService } from '../users/users.service';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';

@Controller('rooms')
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('dm/:username')
  async createDirect(
    @CurrentUser() me: JwtPayload,
    @Param('username') otherUsername: string,
  ) {
    const otherId = await this.usersService.idByUsername(otherUsername);
    if (typeof otherId !== 'string') {
      throw new BadRequestException('User not found');
    }

    return this.roomsService.createDirect(me.sub, otherId);
  }

  @Delete('dm/:username')
  async deleteDirect(
    @CurrentUser() me: JwtPayload,
    @Param('username') otherUsername: string,
  ) {
    const otherId = await this.usersService.idByUsername(otherUsername);
    if (typeof otherId !== 'string') {
      throw new BadRequestException('User not found');
    }

    return this.roomsService.deleteDirect(me.sub, otherId);
  }

  @Post('group')
  async createGroup(
    @CurrentUser() creatorId: JwtPayload,
    @Body() dto: CreateGroupDto,
  ) {
    return this.roomsService.createGroup(
      creatorId.sub,
      await this.usersService.idsByUsernames(dto.members),
      dto.name,
    );
  }

  @Delete('group/:roomId')
  deleteGroup(
    @CurrentUser() userId: JwtPayload,
    @Param('roomId') roomId: string,
  ) {
    return this.roomsService.deleteGroup(roomId, userId.sub);
  }

  @Post('group/add-member/:roomId')
  async addMember(
    @CurrentUser() userId: JwtPayload,
    @Param('roomId') roomId: string,
    @Body() dto: AddMemberDto,
  ) {
    const targetId = await this.usersService.idByUsername(dto.username);
    if (typeof targetId !== 'string') {
      throw new BadRequestException('User not found');
    }
    return this.roomsService.addMember(userId.sub, roomId, targetId);
  }

  @Post('group/remove-member/:roomId')
  async removeMember(
    @CurrentUser() userId: JwtPayload,
    @Param('roomId') roomId: string,
    @Body() dto: RemoveMemberDto,
  ) {
    const targetId = await this.usersService.idByUsername(dto.username);
    if (typeof targetId !== 'string') {
      throw new BadRequestException('User not found');
    }
    return this.roomsService.removeMember(userId.sub, roomId, targetId);
  }

  @Post('group/leave/:roomId')
  async leaveGroup(
    @CurrentUser() userId: JwtPayload,
    @Param('roomId') roomId: string,
  ) {
    return this.roomsService.leaveGroup(userId.sub, roomId);
  }
}
