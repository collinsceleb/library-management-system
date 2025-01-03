import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async createParentCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      const savedCategory = await this.categoryRepository.save(category);
      return savedCategory;
    } catch (error) {
      console.error('Error creating parent category:', error.message);
      throw new InternalServerErrorException(
        'An error occurred creating parent category. Please check server logs for details.',
        error.message,
      );
    }
  }
  async addSubCategory(
    createSubCategoryDto: CreateSubCategoryDto,
  ): Promise<Category> {
    try {
      const { parentCategoryId, subCategoryName } = createSubCategoryDto;
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parentCategoryId },
      });
      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with id ${parentCategoryId} not found`,
        );
      }
      const subcategory = this.categoryRepository.create({
        name: subCategoryName,
        parentCategory: parentCategory,
      });
      const savedSubcategory = await this.categoryRepository.save(subcategory);
      return savedSubcategory;
    } catch (error) {
      console.error('Error creating sub category:', error.message);
      throw new InternalServerErrorException(
        'An error occurred creating sub category. Please check server logs for details.',
        error.message,
      );
    }
  }

  async fetchAllCategories(): Promise<Category[]> {
    try {
      // Create a map for a lookup
      const categoryMap = new Map<string, Category>();
      const treeCategories: Category[] = [];
      const query = `
      WITH RECURSIVE category_tree AS (
            SELECT * FROM category WHERE parent_category_id IS NULL
            UNION
            SELECT c.* FROM category c
            INNER JOIN category_tree ct ON c.parent_category_id = ct.id
        )
        SELECT * FROM category_tree;
        `;
      const categories = await this.categoryRepository.query(query);
      // Build a map for quick lookup
      categories.forEach((category: Category) => {
        categoryMap.set(category.id, category);
      });

      // Assign parents to children
      categories.forEach((category) => {
        if (category.parent_category_id) {
          const parent = categoryMap.get(
            category.parent_category_id,
          );
          if (!parent.subCategories) {
            parent.subCategories = [];
          }
          parent.subCategories.push(category);
        } else {
          treeCategories.push(category);
        }
      });
      return treeCategories;
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      throw new InternalServerErrorException(
        'An error occurred fetching categories. Please check server logs for details.',
        error.message,
      );
    }
  }

  async fetchCategoryById(categoryId: string): Promise<Category> {
    try {
      // Create a map for a lookup
      const categoryMap = new Map<string, Category>();
      const query = `
          WITH RECURSIVE category_tree AS (
        SELECT * FROM category WHERE id = $1
        UNION
        SELECT c.* FROM category c
        INNER JOIN category_tree ct ON c.parent_category_id = ct.id
      )
      SELECT * FROM category_tree;
        `;
      const categories = await this.categoryRepository.query(query, [
        categoryId,
      ]);
      console.log(categories);

      // If no category is found, return null
      if (categories.length === 0) {
        throw new NotFoundException(`Category with id ${categoryId} not found`);
      }

      // Build a map for quick lookup
      categories.forEach((category: Category) => {
        categoryMap.set(category.id, category);
      });

      // Assign parents to children
      categories.forEach((category) => {
        if (category.parent_category_id) {
          const parent = categoryMap.get(
            category.parent_category_id,
          );
          if (parent) {
            parent.subCategories = parent.subCategories || [];
            parent.subCategories.push(category);
          }
        }
      });

      // Find the root category
      const rootCategory = categories.find(
        (category: { parent_category_id: Category; id: string }) =>
          !category.parent_category_id || category.id === categoryId,
      );

      return rootCategory;
    } catch (error) {
      console.error('Error fetching category:', error.message);
      throw new InternalServerErrorException(
        'An error occurred fetching category. Please check server logs for details.',
        error.message,
      );
    }
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
