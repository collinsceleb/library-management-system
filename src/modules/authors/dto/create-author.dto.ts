import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAuthorDto {
  @ApiProperty({
    example: 'Author First Name',
    description: 'First Name of the Author',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Author Last Name',
    description: 'Last Name of the Author',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'Author Location',
    description: 'Location of the Author',
  })
  @IsString()
  @IsOptional()
  bio?: string;
}
