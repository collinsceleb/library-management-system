import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
    example: 'Author Nationality',
    description: 'Nationality of the Author',
  })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({
    example: 'Author Birth Date',
    description: 'Birth Date of the Author',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @ApiProperty({
    example: 'Author Location',
    description: 'Location of the Author',
  })
  @IsString()
  @IsOptional()
  bio?: string;
}
