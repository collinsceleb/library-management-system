import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../books/entities/book.entity';
import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('authors')
export class Author {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_author_id',
  })
  id: string;

  @ApiProperty({ example: 'J. K. Rowling' })
  @Column({ name: 'name', unique: true })
  @Index('idx_author_name', { unique: true })
  name: string;

  @ApiProperty({ example: 'J. K. Rowling is a British author...' })
  @Column({ name: 'bio', nullable: true })
  bio: string;

  @ApiProperty({ type: () => Book, isArray: true })
  @ManyToMany(() => Book, (book) => book.authors)
  books: Book[];
}
