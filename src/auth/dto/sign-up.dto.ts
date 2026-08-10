import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'username may only contain letters, numbers and underscores',
  })
  @Transform((params: TransformFnParams) => {
    const value: unknown = params.value;
    return typeof value === 'string' ? value.toLowerCase() : value;
  })
  readonly username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  readonly password: string;
}
