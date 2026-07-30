import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const { user } = ctx.switchToHttp().getRequest<Request>();
    if (!user) {
      throw new InternalServerErrorException();
    }
    return user;
  },
);
