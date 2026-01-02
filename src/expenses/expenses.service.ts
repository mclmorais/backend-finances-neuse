import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { categories, expenses } from '../db/schema';
import { CreateExpenseBodyInputDto } from './dto/create-expense.input-dto';
import { UpdateExpenseBodyInputDto } from './dto/update-expense.input-dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly dbService: DbService) {}

  async create(userId: string, createExpenseDto: CreateExpenseBodyInputDto) {
    const [expense] = await this.dbService.db
      .insert(expenses)
      .values({
        ...createExpenseDto,
        userId,
      })
      .returning();

    return expense;
  }

  async findAll(userId: string) {
    return this.dbService.db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId));
  }

  async update(
    userId: string,
    expenseId: number,
    updateExpenseDto: UpdateExpenseBodyInputDto,
  ) {
    const [expense] = await this.dbService.db
      .update(expenses)
      .set(updateExpenseDto)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
      .returning();

    if (!expense) {
      throw new NotFoundException(
        `Expense with ID ${expenseId} not found or does not belong to the user`,
      );
    }

    return expense;
  }

  async delete(userId: string, expenseId: number) {
    const [expense] = await this.dbService.db
      .delete(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
      .returning();

    if (!expense) {
      throw new NotFoundException(
        `Expense with ID ${expenseId} not found or does not belong to the user`,
      );
    }

    return expense;
  }

  async findByMonth(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return this.dbService.db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate),
        ),
      )
      .orderBy(desc(expenses.date), desc(expenses.id));
  }

  async getMonthlySummary(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return this.dbService.db
      .select({
        categoryId: expenses.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
        totalValue: sql<string>`CAST(SUM(${expenses.value}) AS TEXT)`,
        expenseCount: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(expenses)
      .innerJoin(categories, eq(expenses.categoryId, categories.id))
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate),
        ),
      )
      .groupBy(
        expenses.categoryId,
        categories.name,
        categories.icon,
        categories.color,
      )
      .orderBy(sql`SUM(${expenses.value}) DESC`);
  }

  async getMonthlySavingsEvolution(
    userId: string,
    startYear?: number,
    startMonth?: number,
    endYear?: number,
    endMonth?: number,
    categoryType: 'expenses' | 'savings' | 'both' = 'both',
  ): Promise<
    Array<{
      year: number;
      month: number;
      categoryId: number;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      categoryType: 'expense' | 'saving';
      totalValue: string;
      accumulatedValue: string;
    }>
  > {
    // Calculate default date range if not provided (6 months before current date)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

    let finalStartYear = startYear;
    let finalStartMonth = startMonth;
    const finalEndYear = endYear ?? currentYear;
    const finalEndMonth = endMonth ?? currentMonth;

    if (!finalStartYear || !finalStartMonth) {
      // Calculate 6 months before current date
      const monthsToSubtract = 6;
      finalStartMonth = currentMonth - monthsToSubtract;
      finalStartYear = currentYear;

      while (finalStartMonth <= 0) {
        finalStartMonth += 12;
        finalStartYear -= 1;
      }
    }

    // Generate array of months between start and end
    const months = [];
    let currentY = finalStartYear;
    let currentM = finalStartMonth;

    while (
      currentY < finalEndYear ||
      (currentY === finalEndYear && currentM <= finalEndMonth)
    ) {
      months.push({ year: currentY, month: currentM });

      currentM++;
      if (currentM > 12) {
        currentM = 1;
        currentY++;
      }
    }

    // Build category type filter
    const categoryTypeConditions = [];
    if (categoryType === 'expenses') {
      categoryTypeConditions.push(eq(categories.type, 'expense'));
    } else if (categoryType === 'savings') {
      categoryTypeConditions.push(eq(categories.type, 'saving'));
    }
    // If 'both', no filter needed

    // First, create a subquery to get monthly totals for ALL time (not just date range)
    // This ensures accumulated values are calculated from the beginning
    const monthlyTotals = this.dbService.db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${expenses.date})::INTEGER`.as('year'),
        month: sql<number>`EXTRACT(MONTH FROM ${expenses.date})::INTEGER`.as('month'),
        categoryId: expenses.categoryId,
        categoryName: categories.name,
        categoryIcon: categories.icon,
        categoryColor: categories.color,
        categoryType: categories.type,
        totalValue: sql<string>`
          CASE 
            WHEN ${categories.type} = 'expense' THEN 
              CAST(SUM(${expenses.value}) AS TEXT)
            WHEN ${categories.type} = 'saving' THEN 
              CAST(
                COALESCE(SUM(CASE WHEN ${expenses.savingsType} = 'deposit' OR ${expenses.savingsType} IS NULL THEN ${expenses.value} ELSE 0 END), 0)::numeric -
                COALESCE(SUM(CASE WHEN ${expenses.savingsType} = 'withdrawal' THEN ${expenses.value} ELSE 0 END), 0)::numeric
              AS TEXT)
            ELSE '0'
          END
        `.as('totalValue'),
      })
      .from(expenses)
      .innerJoin(categories, eq(expenses.categoryId, categories.id))
      .where(
        and(
          eq(expenses.userId, userId),
          ...(categoryTypeConditions.length > 0
            ? categoryTypeConditions
            : []),
        ),
      )
      .groupBy(
        sql`EXTRACT(YEAR FROM ${expenses.date})`,
        sql`EXTRACT(MONTH FROM ${expenses.date})`,
        expenses.categoryId,
        categories.name,
        categories.icon,
        categories.color,
        categories.type,
      )
      .as('monthlyTotals');

    // Now query from the subquery and calculate accumulated values using window function
    // Then filter to the date range
    const results = await this.dbService.db
      .select({
        year: monthlyTotals.year,
        month: monthlyTotals.month,
        categoryId: monthlyTotals.categoryId,
        categoryName: monthlyTotals.categoryName,
        categoryIcon: monthlyTotals.categoryIcon,
        categoryColor: monthlyTotals.categoryColor,
        categoryType: monthlyTotals.categoryType,
        totalValue: monthlyTotals.totalValue,
        accumulatedValue: sql<string>`
          CAST(
            SUM(CAST(${monthlyTotals.totalValue} AS NUMERIC)) OVER (
              PARTITION BY ${monthlyTotals.categoryId}
              ORDER BY ${monthlyTotals.year}, ${monthlyTotals.month}
              ROWS UNBOUNDED PRECEDING
            )
          AS TEXT)
        `.as('accumulatedValue'),
      })
      .from(monthlyTotals)
      .where(
        sql`(
          (${monthlyTotals.year} > ${finalStartYear}) OR 
          (${monthlyTotals.year} = ${finalStartYear} AND ${monthlyTotals.month} >= ${finalStartMonth})
        ) AND (
          (${monthlyTotals.year} < ${finalEndYear}) OR 
          (${monthlyTotals.year} = ${finalEndYear} AND ${monthlyTotals.month} <= ${finalEndMonth})
        )`,
      )
      .orderBy(
        monthlyTotals.year,
        monthlyTotals.month,
        monthlyTotals.categoryName,
      );

    // Map results to ensure categoryType matches the expected type
    return results.map((result) => ({
      ...result,
      categoryType: result.categoryType as 'expense' | 'saving',
    }));
  }
}
