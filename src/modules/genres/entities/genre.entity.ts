import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../books/entities/book.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('genre')
export class Genre {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_genre_id',
  })
  id: string;

  @ApiProperty({ example: 'Science Fiction' })
  @Column({ name: 'name', unique: true })
  @Index('idx_genre_name', { unique: true })
  name: string;

  @ApiProperty({ type: () => Genre, nullable: true })
  @ManyToOne(() => Genre, (genre) => genre.subgenres)
  @JoinColumn({ name: 'parent_genre_id', referencedColumnName: 'id' })
  @Index('idx_genre_parent_genre_id')
  parentGenre: Genre;

  @ApiProperty({ type: () => Genre, isArray: true, nullable: true })
  @OneToMany(() => Genre, (genre) => genre.parentGenre)
  subgenres: Genre[];

  @ApiProperty({ type: () => Book, isArray: true })
  @OneToMany(() => Book, (book) => book.genres)
  books: Book[];

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
