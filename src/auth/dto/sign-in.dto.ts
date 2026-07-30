import { IsNotEmpty, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  @Transform((params: TransformFnParams) => {
    const value: unknown = params.value;
    return typeof value === 'string' ? value.toLowerCase() : value;
  })
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
