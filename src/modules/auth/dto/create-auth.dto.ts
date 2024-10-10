import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  username: string;

  @ApiProperty({ example: 'P@ssw0rd' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain at least one special character',
  })
  @Matches(/^\S*$/, { message: 'Password must not contain spaces' })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @Matches(/^[a-zA-Z]+$/, { message: 'First name must contain only letters' })
  @Matches(/^\S*$/, { message: 'First name must not contain spaces' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  @Matches(/^[a-zA-Z]+$/, { message: 'Last name must contain only letters' })
  @Matches(/^\S*$/, { message: 'Last name must not contain spaces' })
  lastName: string;
}
