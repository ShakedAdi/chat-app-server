import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Min one member' })
  @IsString({ each: true })
  readonly members: string[];
}
