import { IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  readonly username: string;
}
