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

  /** Issued-at, seconds since epoch */
  readonly iat: number;

  /** Expiry, seconds since epoch */
  readonly exp: number;
}
