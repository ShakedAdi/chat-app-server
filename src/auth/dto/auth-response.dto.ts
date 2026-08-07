export class AuthResponseDto {
  /**
   * Signed JWT to send as `Authorization: Bearer <token>`
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   */
  readonly accessToken: string;
}
