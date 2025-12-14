import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { budgets } from '../db/schema';
import { CreateBudgetBodyInputDto } from './dto/create-budget.input-dto';
import { UpdateBudgetBodyInputDto } from './dto/update-budget.input-dto';
import { BatchCreateBudgetsBodyInputDto } from './dto/batch-create-budgets.input-dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly dbService: DbService) {}

  async create(userId: string, createBudgetDto: CreateBudgetBodyInputDto) {
    const [budget] = await this.dbService.db
      .insert(budgets)
      .values({
        ...createBudgetDto,
        userId,
      })
      .returning();

    return budget;
  }

  async batchCreate(
    userId: string,
    batchCreateDto: BatchCreateBudgetsBodyInputDto,
  ) {
    const created = [];
    const errors = [];

    // Process each budget individually to handle conflicts gracefully
    for (const budgetData of batchCreateDto.budgets) {
      try {
        const [budget] = await this.dbService.db
          .insert(budgets)
          .values({
            ...budgetData,
            userId,
          })
          .returning();

        created.push(budget);
      } catch (error) {
        // Check if it's a unique constraint violation (PostgreSQL error code 23505)
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          (error as { code: string }).code === '23505'
        ) {
          errors.push({
            budget: budgetData,
            error:
              'Budget allocation already exists for this account-category-month combination',
          });
        } else {
          // Re-throw unexpected errors
          throw error;
        }
      }
    }

    return { created, errors };
  }

  async findAll(userId: string) {
    return this.dbService.db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));
  }

  async findByMonth(userId: string, year: number, month: number) {
    const monthDate = `${year}-${String(month).padStart(2, '0')}-01`;

    return this.dbService.db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, userId), eq(budgets.date, monthDate)));
  }

  async update(
    userId: string,
    budgetId: number,
    updateBudgetDto: UpdateBudgetBodyInputDto,
  ) {
    const [budget] = await this.dbService.db
      .update(budgets)
      .set(updateBudgetDto)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
      .returning();

    if (!budget) {
      throw new NotFoundException(
        `Budget with ID ${budgetId} not found or does not belong to the user`,
      );
    }

    return budget;
  }

  async delete(userId: string, budgetId: number) {
    const [budget] = await this.dbService.db
      .delete(budgets)
      .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
      .returning();

    if (!budget) {
      throw new NotFoundException(
        `Budget with ID ${budgetId} not found or does not belong to the user`,
      );
    }

    return budget;
  }
}
