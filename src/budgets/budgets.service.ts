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
    const results = [];

    // Process each budget with upsert - update if exists, insert if not
    for (const budgetData of batchCreateDto.budgets) {
      const [budget] = await this.dbService.db
        .insert(budgets)
        .values({
          ...budgetData,
          userId,
        })
        .onConflictDoUpdate({
          target: [budgets.userId, budgets.accountId, budgets.categoryId, budgets.date],
          set: { value: budgetData.value },
        })
        .returning();

      results.push(budget);
    }

    return { created: results, errors: [] };
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
