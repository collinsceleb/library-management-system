import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';
import { CreateSubGenreDto } from './dto/create-sub-genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
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
        parentGenre: parentGenre,
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

  async fetchAllGenres(): Promise<Genre[]> {
    try {
      // Create a map for a lookup
      const genreMap = new Map<string, Genre>();
      const treeGenres: Genre[] = [];
      const query = `
        WITH RECURSIVE genre_tree AS (
            SELECT * FROM genre WHERE parent_genre_id IS NULL
            UNION
            SELECT g.* FROM genre g
            INNER JOIN genre_tree gt ON g.parent_genre_id = gt.id
        )
        SELECT * FROM genre_tree;
        `;
      const genres = await this.genreRepository.query(query);
      // Build a map for quick lookup
      genres.forEach((genre: Genre) => {
        genreMap.set(genre.id, genre);
      });

      // Assign parents to children
      genres.forEach((genre) => {
        if (genre.parent_genre_id) {
          const parent = genreMap.get(genre.parent_genre_id) as Genre;
         if (!parent.subgenres) {
            parent.subgenres = [];
          }
          parent.subgenres.push(genre);
        } else {
          treeGenres.push(genre);
        }
      });


      return treeGenres;

      return genres;
    } catch (error) {
      console.error('Error fetching genres:', error.message);
      throw new InternalServerErrorException(
        'An error occurred fetching genres. Please check server logs for details.',
        error.message,
      );
    }
  }

  async fetchGenreById(genreId: string): Promise<Genre> {
    try {
      // Create a map for a lookup
      const genreMap = new Map<string, Genre>();
      const query = `
        WITH RECURSIVE genre_tree AS (
            SELECT * FROM genre WHERE id = $1
            UNION
            SELECT g.* FROM genre g
            INNER JOIN genre_tree gt ON g.parent_genre_id = gt.id
        )
        SELECT * FROM genre_tree;
        `;
      const genres = await this.genreRepository.query(query, [genreId]);
      console.log(genres);

      // If no genre is found, return null
      if (genres.length === 0) {
        throw new NotFoundException(`Genre with id ${genreId} not found`);
      }

      // Build a map for quick lookup
      genres.forEach((genre: Genre) => {
        genreMap.set(genre.id, genre);
      });

      // Assign parents to children
      genres.forEach((genre) => {
        if (genre.parent_genre_id) {
          const parent = genreMap.get(genre.parent_genre_id) as Genre;
          if (parent) {
            parent.subgenres = parent.subgenres || [];
            parent.subgenres.push(genre);
          }
        }
      });

      // Find the root genre
      const rootGenre = genres.find(
        (genre: { parent_genre_id: Genre; id: string }) =>
          !genre.parent_genre_id || genre.id == genreId,
      );

      return rootGenre;
    } catch (error) {
      console.error('Error fetching genre:', error.message);
      throw new InternalServerErrorException(
        'An error occurred fetching genre. Please check server logs for details.',
        error.message,
      );
    }
  }

  update(id: number, updateGenreDto: UpdateGenreDto) {
    return `This action updates a #${id} genre`;
  }

  remove(id: number) {
    return `This action removes a #${id} genre`;
  }
}
