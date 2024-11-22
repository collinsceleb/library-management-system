import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Author } from './entities/author.entity';
import { Repository } from 'typeorm';
import { HelperService } from '../../common/utils/helper/helper.service';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    private readonly helperService: HelperService,
  ) {}
  /**
   * Create a new author
   * @param createAuthorDto
   * @returns
   */
  async createAuthor(createAuthorDto: CreateAuthorDto) {
    try {
      const { firstName, lastName, bio } = createAuthorDto;
      const initialsCode = `${firstName[0]}${lastName[1]}`;
      const initials = initialsCode.toUpperCase();
      const identifierCode = await this.helperService.generateIdentifierCode(
        initials,
        this.authorRepository,
      );
      const author = this.authorRepository.create({
        firstName,
        lastName,
        bio,
        identifierCode,
      });
      const savedAuthor = await this.authorRepository.save(author);
      return savedAuthor;
    } catch (error) {
      console.error('Error creating author:', error);
      throw new InternalServerErrorException(
        'An error occurred creating author. Please check server logs for details.',
        error,
      );
    }
  }

  findAll() {
    return `This action returns all authors`;
  }

  findOne(id: number) {
    return `This action returns a #${id} author`;
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    return `This action updates a #${id} author`;
  }

  remove(id: number) {
    return `This action removes a #${id} author`;
  }
}
