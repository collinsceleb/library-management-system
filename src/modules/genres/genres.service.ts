import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';
import { CreateSubGenreDto } from './dto/create-sub-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre) private readonly genreRepository: Repository<Genre>,
  ) {}
  async createParentGenre(createGenreDto: CreateGenreDto): Promise<Genre> {
    try {
      const genre = this.genreRepository.create(createGenreDto);
      const savedGenre = await this.genreRepository.save(genre);
      return savedGenre;
    } catch (error) {
      console.error('Error creating parent genre:', error.message);
      throw new InternalServerErrorException(
        'An error occurred creating parent genre. Please check server logs for details.',
        error.message,
      );
    }
  }
  async addSubGenre(createSubGenreDto: CreateSubGenreDto): Promise<Genre> {
    try {
      const { parentGenreId, subGenreName } = createSubGenreDto;
      const parentGenre = await this.genreRepository.findOne({
        where: { id: parentGenreId },
      });
      if (!parentGenre) {
        throw new NotFoundException(
          `Parent genre with id ${parentGenreId} not found`,
        );
      }
      const subgenre = this.genreRepository.create({
        name: subGenreName,
        parentGenre: parentGenre
      });
      const savedSubgenre = await this.genreRepository.save(subgenre);
      return savedSubgenre;
    } catch (error) {
      console.error('Error creating sub genre:', error.message);
      throw new InternalServerErrorException(
        'An error occurred creating sub genre. Please check server logs for details.',
        error.message,
      );
    }
  }

  findAll() {
    return `This action returns all genres`;
  }

  findOne(id: number) {
    return `This action returns a #${id} genre`;
  }

  update(id: number, updateGenreDto: UpdateGenreDto) {
    return `This action updates a #${id} genre`;
  }

  remove(id: number) {
    return `This action removes a #${id} genre`;
  }
}
