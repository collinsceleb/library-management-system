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
import { ApiCreatedResponse, ApiFoundResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubGenreDto } from './dto/create-sub-genre.dto';
import { Genre } from './entities/genre.entity';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post('create-genre')
  @ApiCreatedResponse({
    type: Genre,
    description: 'Genre created successfully',
    status: 201,
  })
  async createParentGenre(
    @Body() createGenreDto: CreateGenreDto,
  ): Promise<Genre> {
    return await this.genresService.createParentGenre(createGenreDto);
  }
  @Post('add-subgenre')
  @ApiCreatedResponse({
    type: Genre,
    description: 'Sub Genre created successfully',
    status: 201,
  })
  async addSubGenre(
    @Body() createSubGenreDto: CreateSubGenreDto,
  ): Promise<Genre> {
    return await this.genresService.addSubGenre(createSubGenreDto);
  }

  @Get()
  @ApiFoundResponse({
    type: Genre,
    description: 'Genres fetched successfully',
    status: 201,
  })
  async fetchAllGenres(): Promise<Genre[]> {
    return await this.genresService.fetchAllGenres();
  }

  @Get(':genreId')
  @ApiFoundResponse({
    type: Genre,
    description: 'Genre fetched successfully',
    status: 201,
  })
  async fetchGenreById(@Param('genreId') genreId: string): Promise<Genre> {
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
