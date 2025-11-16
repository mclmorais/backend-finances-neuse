import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { categories, categoryPlanning, expenses } from '../db/schema';
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

  async getCategoryPlanningAnalysis(
    userId: string,
    year: number,
    month: number,
  ) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const result = await this.dbService.db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryIcon: categories.icon,
        categoryType: categories.type,
        plannedValue: categoryPlanning.value,
        totalSpent: sql<string>`COALESCE(SUM(${expenses.value}), '0')`,
      })
      .from(categories)
      .leftJoin(
        categoryPlanning,
        and(
          eq(categoryPlanning.categoryId, categories.id),
          eq(categoryPlanning.month, month),
          eq(categoryPlanning.year, year),
        ),
      )
      .leftJoin(
        expenses,
        and(
          eq(expenses.categoryId, categories.id),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate),
        ),
      )
      .where(eq(categories.userId, userId))
      .groupBy(
        categories.id,
        categories.name,
        categories.color,
        categories.icon,
        categories.type,
        categoryPlanning.id,
        categoryPlanning.value,
      );

    return result.map((item) => ({
      ...item,
      availableAmount: this.calculateAvailable(
        item.plannedValue,
        item.totalSpent,
      ),
    }));
  }

  private calculateAvailable(planned: string | null, spent: string): string {
    const plannedAmount = parseFloat(planned || '0');
    const spentAmount = parseFloat(spent || '0');
    const available = plannedAmount - spentAmount;
    return available.toFixed(2);
  }
}
