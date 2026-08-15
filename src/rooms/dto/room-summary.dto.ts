import { RoomType } from '../../generated/prisma/enums';

export class RoomSummaryDto {
  readonly id: string;
  readonly type: RoomType;
  readonly name: string | null;
}
