import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiCreatedResponse, ApiFoundResponse, ApiTags } from '@nestjs/swagger';
import { Category } from './entities/category.entity';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create-category')
  @ApiCreatedResponse({
    type: Category,
    description: 'Category created successfully',
    status: 201,
  })
  async createParentCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return await this.categoriesService.createParentCategory(createCategoryDto);
  }
  @Post('add-subcategory')
  @ApiCreatedResponse({
    type: Category,
    description: 'Sub Category created successfully',
    status: 201,
  })
  async addSubCategory(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<Category> {
    return await this.categoriesService.addSubCategory(createSubCategoryDto);
  }

  @Get()
  @ApiFoundResponse({
    type: [Category],
    description: 'Categories fetched successfully',
    isArray: true,
    status: 200,
  })
  async fetchAllCategories(): Promise<Category[]> {
    return await this.categoriesService.fetchAllCategories();
  }

  @Get(':categoryId')
  @ApiFoundResponse({
    type: Category,
    description: 'Category fetched successfully',
    status: 200,
  })
  async fetchCategoryById(
    @Param('categoryId') categoryId: string,
  ): Promise<Category> {
    return await this.categoriesService.fetchCategoryById(categoryId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
