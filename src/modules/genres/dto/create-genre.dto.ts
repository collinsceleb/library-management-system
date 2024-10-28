import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({ example: 'Fiction', description: 'The name of the genre' })
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'Must not be empty' })
  @Matches(/^[a-zA-Z]+$/, { message: 'Genre name must contain only letters' })
  name: string;
}
