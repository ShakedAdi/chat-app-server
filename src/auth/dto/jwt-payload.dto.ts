import type { JwtPayload } from '../types/jwt-payload.type';

export class JwtPayloadDto implements JwtPayload {
  readonly sub: string;
  readonly username: string;
  readonly iat: number;
  readonly exp: number;
}
