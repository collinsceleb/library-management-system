import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateSubGenreDto } from './dto/create-sub-genre.dto';
import { Genre } from './entities/genre.entity';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post('create-genre')
  async createParentGenre(
    @Body() createGenreDto: CreateGenreDto,
  ): Promise<Genre> {
    return await this.genresService.createParentGenre(createGenreDto);
  }
  @Post('add-subgenre')
  async addSubGenre(
    @Body() createSubGenreDto: CreateSubGenreDto,
  ): Promise<Genre> {
    return await this.genresService.addSubGenre(createSubGenreDto);
  }

  @Get()
  fetchAllGenres() {
    return this.genresService.fetchAllGenres();
  }

  @Get(':genreId')
  async fetchGenreById(@Param('genreId') genreId: string) {
    return await this.genresService.fetchGenreById(genreId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genresService.update(+id, updateGenreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.genresService.remove(+id);
  }
}
