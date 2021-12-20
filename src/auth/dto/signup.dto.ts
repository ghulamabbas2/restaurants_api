import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email address' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;
}
