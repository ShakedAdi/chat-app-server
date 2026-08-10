import { RoomType } from '../../generated/prisma/enums';

export class RoomSummaryDto {
  /** @example 'clx8f2k0000008l3h1a2b3c4d' */
  readonly id: string;

  /** @example 'GROUP' */
  readonly type: RoomType;

  /** Group name, or the counterpart's display name for a direct room. */
  readonly name: string | null;
}
