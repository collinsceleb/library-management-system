import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}
  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    const {
      isbn,
      author,
      publisher,
      genre,
      category,
      totalCopies,
      title,
      publicationDate,
      description,
    } = createBookDto;

    const newBook = this.bookRepository.create({
      title,
      ISBN: isbn,
      publicationDate,
      description,
    })
    const savedNewBook = await this.bookRepository.save(newBook)
    return savedNewBook;
  }

  findAll() {
    return `This action returns all books`;
  }

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
