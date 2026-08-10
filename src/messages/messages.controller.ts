import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { NewMessageDto } from './dto/new-message.dto';
import {
  DEFAULT_MESSAGE_PAGE_SIZE,
  MAX_MESSAGE_PAGE_SIZE,
} from './messages.constants';

@Controller('messages')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('new-message/:roomId')
  newMessage(
    @CurrentUser() senderId: JwtPayload,
    @Param('roomId') roomId: string,
    @Body() dto: NewMessageDto,
  ) {
    return this.messagesService.createTextMessage(
      roomId,
      senderId.sub,
      dto.text,
    );
  }

  @Get(':roomId')
  getLastMessages(
    @CurrentUser() me: JwtPayload,
    @Param('roomId') roomId: string,
    @Query(
      'amount',
      new DefaultValuePipe(DEFAULT_MESSAGE_PAGE_SIZE),
      ParseIntPipe,
    )
    amount: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.messagesService.getLastMessages(
      roomId,
      me.sub,
      Math.min(Math.max(amount, 1), MAX_MESSAGE_PAGE_SIZE),
      Math.max(offset, 0),
    );
  }
}
