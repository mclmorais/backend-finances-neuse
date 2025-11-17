import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { categories, categoryPlanning, expenses, incomes } from '../db/schema';
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
          eq(categoryPlanning.userId, userId),
          eq(categoryPlanning.month, month),
          eq(categoryPlanning.year, year),
        ),
      )
      .leftJoin(
        expenses,
        and(
          eq(expenses.categoryId, categories.id),
          eq(expenses.userId, userId),
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

  async getTotalIncomeByMonth(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const result = await this.dbService.db
      .select({
        totalIncome: sql<string>`COALESCE(SUM(${incomes.value}), '0')`,
      })
      .from(incomes)
      .where(
        and(
          eq(incomes.userId, userId),
          gte(incomes.date, startDate),
          lte(incomes.date, endDate),
        ),
      );

    return { totalIncome: result[0]?.totalIncome || '0' };
  }

  async copyFromPreviousMonth(
    userId: string,
    targetYear: number,
    targetMonth: number,
  ) {
    // Calculate previous month
    let previousMonth = targetMonth - 1;
    let previousYear = targetYear;

    if (previousMonth < 1) {
      previousMonth = 12;
      previousYear -= 1;
    }

    // Get planning from previous month
    const previousPlanning = await this.findByMonthYear(
      userId,
      previousYear,
      previousMonth,
    );

    if (previousPlanning.length === 0) {
      return [];
    }

    // Delete existing planning for target month (if any)
    await this.dbService.db
      .delete(categoryPlanning)
      .where(
        and(
          eq(categoryPlanning.userId, userId),
          eq(categoryPlanning.year, targetYear),
          eq(categoryPlanning.month, targetMonth),
        ),
      );

    // Create new planning for target month based on previous month
    const newPlanningValues = previousPlanning.map((plan) => ({
      userId,
      categoryId: plan.categoryId,
      month: targetMonth,
      year: targetYear,
      value: plan.value,
    }));

    const result = await this.dbService.db
      .insert(categoryPlanning)
      .values(newPlanningValues)
      .returning();

    return result;
  }

  async getPreviousMonthsRemaining(
    userId: string,
    targetYear: number,
    targetMonth: number,
  ) {
    // Create target date for comparison
    const targetDate = new Date(targetYear, targetMonth - 1, 1);
    const targetDateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;

    // Get all categories for the user
    const userCategories = await this.dbService.db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

    // Get all planning records for the user
    const allPlanning = await this.dbService.db
      .select()
      .from(categoryPlanning)
      .where(eq(categoryPlanning.userId, userId));

    // Filter planning records before target month
    const previousPlanning = allPlanning.filter((plan) => {
      const planDate = new Date(plan.year, plan.month - 1, 1);
      return planDate < targetDate;
    });

    // Get all expenses before target month
    const allExpenses = await this.dbService.db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          sql`${expenses.date} < ${targetDateStr}`,
        ),
      );

    // Calculate cumulative remaining for each category
    const results = userCategories.map((category) => {
      // Get planning records for this category
      const categoryPlanningRecords = previousPlanning.filter(
        (p) => p.categoryId === category.id,
      );

      let cumulativeRemaining = 0;

      // For each planning period, calculate remaining amount
      for (const plan of categoryPlanningRecords) {
        // Calculate date range for this month
        const startDate = `${plan.year}-${String(plan.month).padStart(2, '0')}-01`;
        const lastDay = new Date(plan.year, plan.month, 0).getDate();
        const endDate = `${plan.year}-${String(plan.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        // Sum expenses for this month and category
        const monthExpenses = allExpenses.filter(
          (e) =>
            e.categoryId === category.id &&
            e.date >= startDate &&
            e.date <= endDate,
        );

        const totalSpent = monthExpenses.reduce(
          (sum, e) => sum + parseFloat(e.value),
          0,
        );

        const planned = parseFloat(plan.value || '0');
        const remaining = planned - totalSpent;
        cumulativeRemaining += remaining;
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
        categoryIcon: category.icon,
        categoryType: category.type,
        cumulativeRemaining: cumulativeRemaining.toFixed(2),
      };
    });

    return results;
  }
}
