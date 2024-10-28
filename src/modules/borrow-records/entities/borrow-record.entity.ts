import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from '../../books/entities/book.entity';

@Entity('borrow_record')
export class BorrowRecord {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_borrow_record_id',
  })
  id: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, { eager: true })
  user: User;

  @ApiProperty({ type: () => Book })
  @ManyToOne(() => Book, { eager: true })
  book: Book;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @Column({ name: 'borrow_date', type: 'timestamptz' })
  borrowDate: Date;

  @ApiProperty({ example: '2023-05-08T00:00:00.000Z' })
  @Column({ name: 'return_date', type: 'timestamptz', nullable: true })
  returnDate: Date;
}
