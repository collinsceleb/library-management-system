import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../books/entities/book.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('publishers')
export class Publisher {
  @ApiProperty({ example: 'id', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_publisher_id',
  })
  id: string;

  @ApiProperty({ example: 'Publisher Name' })
  @Column({ name: 'name' })
  @Index('idx_publisher_name')
  name: string;

  @ApiProperty({ example: 'Publisher Location' })
  @Column({ name: 'location' })
  location: string;

  @ApiProperty({ example: 'Publisher Identifier Code' })
  @Column({ name: 'identifier_code', unique: true })
  @Index('idx_publisher_identifier_code')
  identifierCode: string;

  @ApiProperty({ type: () => Book, isArray: true })
  @OneToMany(() => Book, (book) => book.publisher)
  books: Book[];

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
