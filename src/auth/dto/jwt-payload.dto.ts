import type { JwtPayload } from '../types/jwt-payload.type';

export class JwtPayloadDto implements JwtPayload {
  /**
   * User id (cuid)
   * @example 'cms7m9fdn0000bkijgwldevf6'
   */
  readonly sub: string;

  /**
   * @example 'shaked'
   */
  readonly username: string;

  readonly iat: number;

  readonly exp: number;
}
