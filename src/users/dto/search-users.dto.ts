import { IsString, MaxLength, MinLength } from 'class-validator';
import { MIN_USER_SEARCH_LEN } from '../users.constants';

export class SearchUsersDto {
  @IsString()
  @MinLength(MIN_USER_SEARCH_LEN)
  @MaxLength(20)
  readonly search: string;
}
