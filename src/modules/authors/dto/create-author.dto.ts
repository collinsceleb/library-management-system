import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAuthorDto {
  @ApiProperty({
    example: 'Author Name',
    description: 'Name of the Author',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Author Location',
    description: 'Location of the Author',
  })
  @IsString()
  @IsOptional()
  bio?: string;
}
