import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { SearchUsersDto } from './dto/search-users.dto';
import { UserSummaryDto } from './dto/user-summary.dto';

@Controller('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: [UserSummaryDto] })
  search(@CurrentUser() me: JwtPayload, @Query() dto: SearchUsersDto) {
    return this.usersService.findUsers(dto.search, me.sub);
  }
}
