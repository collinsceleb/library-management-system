import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateSubGenreDto {
  @ApiProperty()
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'Must not be empty' })
  parentGenreId: string;

  @ApiProperty({ example: 'Fiction', description: 'The name of the genre' })
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty({ message: 'Must not be empty' })
  subGenreName: string;
}
