import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateGroupDto } from './dto/create-group.dto';
import { UsersService } from '../users/users.service';
import { AddMemberDto } from './dto/add-member.dto';
import { RemoveMemberDto } from './dto/remove-member.dto';

@Controller('rooms')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  /** Open (or reuse) the direct room between the caller and another user. */
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
  @ApiNotFoundResponse({ description: 'Direct room not found' })
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

  /** Delete a group room the caller owns. */
  @Delete('group/:roomId')
  @ApiNotFoundResponse({ description: 'Group not found' })
  deleteGroup(
    @CurrentUser() userId: JwtPayload,
    @Param('roomId') roomId: string,
  ) {
    return this.roomsService.deleteGroup(roomId, userId.sub);
  }

  @Post('group/add-member/:roomId')
  @ApiNotFoundResponse({ description: 'Group not found' })
  @ApiConflictResponse({ description: 'User is already a member' })
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

  /** Remove another user from a group room. Use `leave` to remove yourself. */
  @Post('group/remove-member/:roomId')
  @ApiNotFoundResponse({ description: 'Group or member not found' })
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
  @ApiNotFoundResponse({ description: 'Group not found' })
  async leaveGroup(
    @CurrentUser() userId: JwtPayload,
    @Param('roomId') roomId: string,
  ) {
    return this.roomsService.leaveGroup(userId.sub, roomId);
  }
}
