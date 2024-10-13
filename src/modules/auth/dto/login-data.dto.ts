import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDataDto {
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}