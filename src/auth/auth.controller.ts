import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
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
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookie(res: Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });
  }

  @Public()
  @Post('signup')
  @ApiCreatedResponse({ type: AuthResponseDto, description: 'Account created' })
  @ApiConflictResponse({ description: 'Username already taken' })
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.signUp(
      dto.username,
      dto.password,
    );
    this.setAuthCookie(res, accessToken);
    return { username: dto.username };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @ApiOkResponse({ type: AuthResponseDto, description: 'Authenticated' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.signIn(
      dto.username,
      dto.password,
    );
    this.setAuthCookie(res, accessToken);
    return { username: dto.username };
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/', sameSite: 'lax' });
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOkResponse({ type: JwtPayloadDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
