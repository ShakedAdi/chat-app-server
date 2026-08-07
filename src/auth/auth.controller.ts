import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import type { JwtPayload } from './types/jwt-payload.type';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiCreatedResponse({ type: AuthResponseDto, description: 'Account created' })
  @ApiConflictResponse({ description: 'Username already taken' })
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto.username, dto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiOkResponse({ type: AuthResponseDto, description: 'Authenticated' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto.username, dto.password);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOkResponse({ type: JwtPayloadDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
