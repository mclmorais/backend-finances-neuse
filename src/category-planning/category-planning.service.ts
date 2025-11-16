import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { categoryPlanning } from '../db/schema';
import { CreateCategoryPlanningBodyInputDto } from './dto/create-category-planning.input-dto';
import { UpdateCategoryPlanningBodyInputDto } from './dto/update-category-planning.input-dto';

@Injectable()
export class CategoryPlanningService {
  constructor(private readonly dbService: DbService) {}

  async create(
    userId: string,
    createCategoryPlanningDto: CreateCategoryPlanningBodyInputDto,
  ) {
    const [planning] = await this.dbService.db
      .insert(categoryPlanning)
      .values({
        ...createCategoryPlanningDto,
        userId,
      })
      .returning();

    return planning;
  }

  async findAll(userId: string) {
    return this.dbService.db
      .select()
      .from(categoryPlanning)
      .where(eq(categoryPlanning.userId, userId));
  }

  async findByMonthYear(userId: string, year: number, month: number) {
    return this.dbService.db
      .select()
      .from(categoryPlanning)
      .where(
        and(
          eq(categoryPlanning.userId, userId),
          eq(categoryPlanning.year, year),
          eq(categoryPlanning.month, month),
        ),
      );
  }

  async update(
    userId: string,
    planningId: number,
    updateCategoryPlanningDto: UpdateCategoryPlanningBodyInputDto,
  ) {
    const [planning] = await this.dbService.db
      .update(categoryPlanning)
      .set(updateCategoryPlanningDto)
      .where(
        and(
          eq(categoryPlanning.id, planningId),
          eq(categoryPlanning.userId, userId),
        ),
      )
      .returning();

    if (!planning) {
      throw new NotFoundException(
        `Category planning with ID ${planningId} not found or does not belong to the user`,
      );
    }

    return planning;
  }

  async delete(userId: string, planningId: number) {
    const [planning] = await this.dbService.db
      .delete(categoryPlanning)
      .where(
        and(
          eq(categoryPlanning.id, planningId),
          eq(categoryPlanning.userId, userId),
        ),
      )
      .returning();

    if (!planning) {
      throw new NotFoundException(
        `Category planning with ID ${planningId} not found or does not belong to the user`,
      );
    }

    return planning;
  }
}
