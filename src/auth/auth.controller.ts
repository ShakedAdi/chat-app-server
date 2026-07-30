import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import type { JwtPayload } from './types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto.username, dto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto.username, dto.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
