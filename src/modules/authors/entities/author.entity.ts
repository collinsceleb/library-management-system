import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../books/entities/book.entity';
import { Column, CreateDateColumn, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('authors')
@Index('idx_author_name_code', ['name', 'identifierCode'], { unique: true})
export class Author {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_author_id',
  })
  id: string;

  @ApiProperty({ example: 'J. K. Rowling' })
  @Column({ name: 'name', unique: true })
  name: string;

  @ApiProperty({ example: 'J. K. Rowling is a British author...' })
  @Column({ name: 'bio', nullable: true })
  bio: string;

  @ApiProperty({ example: 'Author Identifier Code' })
  @Column({ name: 'identifier_code', unique: true })
  identifierCode: string;

  @ApiProperty({ type: () => Book, isArray: true })
  @ManyToMany(() => Book, (book) => book.authors)
  books: Book[];

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
