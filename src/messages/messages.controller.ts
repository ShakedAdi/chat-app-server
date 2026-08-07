import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { NewMessageDto } from './dto/new-message.dto';

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
}
