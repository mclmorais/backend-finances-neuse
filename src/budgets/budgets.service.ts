import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, lt, sql } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { accounts, budgets, categories, expenses } from '../db/schema';
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

  async getCarryover(userId: string, year: number, month: number) {
    const cutoffDate = `${year}-${String(month).padStart(2, '0')}-01`;

    // Subquery for budget totals per account-category before the cutoff date
    const budgetTotals = this.dbService.db
      .select({
        accountId: budgets.accountId,
        categoryId: budgets.categoryId,
        totalBudget: sql<string>`CAST(COALESCE(SUM(${budgets.value}), 0) AS TEXT)`.as(
          'totalBudget',
        ),
      })
      .from(budgets)
      .where(and(eq(budgets.userId, userId), lt(budgets.date, cutoffDate)))
      .groupBy(budgets.accountId, budgets.categoryId)
      .as('budgetTotals');

    // Subquery for expense totals per account-category before the cutoff date
    const expenseTotals = this.dbService.db
      .select({
        accountId: expenses.accountId,
        categoryId: expenses.categoryId,
        totalExpense: sql<string>`CAST(COALESCE(SUM(${expenses.value}), 0) AS TEXT)`.as(
          'totalExpense',
        ),
      })
      .from(expenses)
      .where(and(eq(expenses.userId, userId), lt(expenses.date, cutoffDate)))
      .groupBy(expenses.accountId, expenses.categoryId)
      .as('expenseTotals');

    // Join accounts and categories to get all combinations, then left join with totals
    const result = await this.dbService.db
      .select({
        accountId: accounts.id,
        categoryId: categories.id,
        remaining: sql<string>`CAST(
          COALESCE(${budgetTotals.totalBudget}::numeric, 0) - 
          COALESCE(${expenseTotals.totalExpense}::numeric, 0) 
        AS TEXT)`,
      })
      .from(accounts)
      .crossJoin(categories)
      .leftJoin(
        budgetTotals,
        and(
          eq(accounts.id, budgetTotals.accountId),
          eq(categories.id, budgetTotals.categoryId),
        ),
      )
      .leftJoin(
        expenseTotals,
        and(
          eq(accounts.id, expenseTotals.accountId),
          eq(categories.id, expenseTotals.categoryId),
        ),
      )
      .where(and(eq(accounts.userId, userId), eq(categories.userId, userId)));

    // Filter out zero values for a cleaner response
    return result.filter((item) => parseFloat(item.remaining) !== 0);
  }
}
