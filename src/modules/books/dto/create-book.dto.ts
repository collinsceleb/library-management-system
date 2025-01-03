import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    example: 'The Great Gatsby',
    description: 'The title of the book',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '9780743273565',
    description: 'The ISBN of the book',
  })
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty({
    example: 'F. Scott Fitzgerald',
    description: 'The author of the book',
  })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    example: 'Scribner',
    description: 'The publisher of the book',
  })
  @IsString()
  @IsNotEmpty()
  publisher: string;

  @ApiProperty({
    example: 'Fiction',
    description: 'The genre of the book',
  })
  @IsString()
  @IsNotEmpty()
  genre: string;

  @ApiProperty({
    example: 'Classic',
    description: 'The category of the book',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 10,
    description: 'The total number of copies of the book',
    type: Number,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsOptional()
  totalCopies?: number;

  @ApiProperty({
    example: '1925-04-10',
    description: 'The publication date of the book',
  })
  @IsNotEmpty()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  publicationDate?: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}
