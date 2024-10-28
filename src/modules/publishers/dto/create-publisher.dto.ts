import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePublisherDto {
  @ApiProperty({
    example: 'Publisher Name',
    description: 'Name of the Publisher',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Publisher Location',
    description: 'Location of the Publisher',
  })
  @IsString()
  @IsNotEmpty()
  location: string;
}
