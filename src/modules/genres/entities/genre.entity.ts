import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../books/entities/book.entity';
import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('genre')
export class Genre {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'pk_genre_id',
  })
  id: string;

  @ApiProperty({ example: 'Science Fiction' })
  @Column({ name: 'name', unique: true })
  @Index('uq_genre_name', { unique: true })
  name: string;

  @ApiProperty({ type: () => Book, isArray: true })
  @ManyToMany(() => Book, (book) => book.genres)
  books: Book[];
}
