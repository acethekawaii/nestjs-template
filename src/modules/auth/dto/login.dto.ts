import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform, type TransformFnParams } from 'class-transformer';

export class LoginDTO {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim().toLowerCase() : (value as unknown),
  )
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}