import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { categories } from '../db/schema';
import { CreateCategoryBodyInputDto } from './dto/create-category.input-dto';
import { UpdateCategoryBodyInputDto } from './dto/update-category.input-dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly dbService: DbService) {}

  async create(userId: string, createCategoryDto: CreateCategoryBodyInputDto) {
    const [category] = await this.dbService.db
      .insert(categories)
      .values({
        ...createCategoryDto,
        userId,
      })
      .returning();

    return category;
  }

  async findAll(userId: string) {
    return this.dbService.db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));
  }

  async update(
    userId: string,
    categoryId: number,
    updateCategoryDto: UpdateCategoryBodyInputDto,
  ) {
    const [category] = await this.dbService.db
      .update(categories)
      .set(updateCategoryDto)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${categoryId} not found or does not belong to the user`,
      );
    }

    return category;
  }

  async delete(userId: string, categoryId: number) {
    const [category] = await this.dbService.db
      .delete(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${categoryId} not found or does not belong to the user`,
      );
    }

    return category;
  }
}
