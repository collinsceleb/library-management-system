import { ApiProperty } from '@nestjs/swagger';
import { Book } from 'src/modules/books/entities/book.entity';
import {
  Column,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('category')
export class Category {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'pk_category_id',
  })
  id: string;

  @ApiProperty({ example: 'Fiction' })
  @Column({ name: 'name', unique: true })
  @Index('idx_category_name', { unique: true })
  name: string;

  @ApiProperty({ type: () => Category, nullable: true })
  @ManyToOne(() => Category, (category) => category.subCategories, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentCategory: Category;

  @ApiProperty({ type: () => Category, isArray: true })
  @OneToMany(() => Category, (category) => category.parentCategory)
  subCategories: Category[];

  @ApiProperty({ type: () => Book, isArray: true })
  @ManyToMany(() => Book, (book) => book.categories)
  books: Book[];
}
