import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Author } from '../../authors/entities/author.entity';
import { Genre } from '../../genres/entities/genre.entity';
import { Publisher } from '../../publishers/entities/publisher.entity';

@Entity('books')
export class Book {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'pk_book_id',
  })
  id: string;

  @ApiProperty({ example: 'The Great Gatsby' })
  @Column({ name: 'title' })
  @Index('idx_book_title')
  title: string;

  @ApiProperty({ example: 'F. Scott Fitzgerald' })
  @Column({ name: 'description', nullable: true })
  description: string;

  @ApiProperty({ example: '978-3-16-148410-0' })
  @Column({ name: 'ISBN', unique: true })
  @Index('idx_book_isbn')
  ISBN: string;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @Column({ name: 'publication_date', nullable: true, type: 'timestamptz' })
  publicationDate: Date;

  @ApiProperty({ type: () => Category, isArray: true })
  @ManyToMany(() => Category, (category) => category.books)
  @JoinTable({
    name: 'book_categories',

    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_book_categories_book_id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_book_categories_category_id',
    },
  })
  categories: Category[];

  @ApiProperty({ type: () => Author, isArray: true })
  @ManyToMany(() => Author, (author) => author.books)
  @JoinTable({
    name: 'book_authors',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_book_authors_book_id',
    },
    inverseJoinColumn: {
      name: 'author_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_book_authors_author_id',
    },
  })
  authors: Author[];

  @ApiProperty({ type: () => Genre, isArray: true })
  @ManyToMany(() => Genre, (genre) => genre.books)
  @JoinTable({
    name: 'book_genres',
    joinColumn: {
      name: 'book_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_book_genres_book_id',
    },
    inverseJoinColumn: {
      name: 'genre_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_book_genres_genre_id',
    },
  })
  genres: Genre[];

  @ApiProperty({ type: () => Publisher, nullable: true })
  @ManyToOne(() => Publisher, (publisher) => publisher.books)
  publisher: Publisher;

  @ApiProperty({ example: 100 })
  @Column({ name: 'total_copies', default: 0 })
  totalCopies: number;

  @ApiProperty({ example: 50 })
  @Column({ name: 'available_copies', default: 0 })
  availableCOpies: number;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
