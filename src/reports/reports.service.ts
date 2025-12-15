import { Injectable } from '@nestjs/common';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { budgets, categories, expenses, incomes } from '../db/schema';

@Injectable()
export class ReportsService {
  constructor(private readonly dbService: DbService) {}

  async getMonthlyComparison(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Get income summary
    const [incomeSummary] = await this.dbService.db
      .select({
        totalIncome: sql<string>`CAST(COALESCE(SUM(${incomes.value}), 0) AS TEXT)`,
        incomeCount: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(incomes)
      .where(
        and(
          eq(incomes.userId, userId),
          gte(incomes.date, startDate),
          lte(incomes.date, endDate),
        ),
      );

    // Get expense summary
    const [expenseSummary] = await this.dbService.db
      .select({
        totalExpenses: sql<string>`CAST(COALESCE(SUM(${expenses.value}), 0) AS TEXT)`,
        expenseCount: sql<number>`CAST(COUNT(*) AS INTEGER)`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate),
        ),
      );

    const totalIncome = parseFloat(incomeSummary?.totalIncome || '0');
    const totalExpenses = parseFloat(expenseSummary?.totalExpenses || '0');
    const netBalance = (totalIncome - totalExpenses).toFixed(2);

    return {
      year,
      month,
      totalIncome: incomeSummary?.totalIncome || '0',
      totalExpenses: expenseSummary?.totalExpenses || '0',
      netBalance,
      incomeCount: incomeSummary?.incomeCount || 0,
      expenseCount: expenseSummary?.expenseCount || 0,
    };
  }

  async getBalanceTrend(
    userId: string,
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number,
  ) {
    // Generate array of months between start and end
    const months = [];
    let currentYear = startYear;
    let currentMonth = startMonth;

    while (
      currentYear < endYear ||
      (currentYear === endYear && currentMonth <= endMonth)
    ) {
      months.push({ year: currentYear, month: currentMonth });

      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    // Fetch data for each month
    const monthlyData = await Promise.all(
      months.map((m) => this.getMonthlyComparison(userId, m.year, m.month)),
    );

    // Calculate cumulative balance
    let cumulative = 0;
    return monthlyData.map((data) => {
      const netBalance = parseFloat(data.netBalance);
      cumulative += netBalance;

      return {
        ...data,
        cumulativeBalance: cumulative.toFixed(2),
      };
    });
  }

  async getMonthlyCategoriesBudgetComparison(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

/*SELECT
  c.name AS category_name,
  COALESCE(SUM(e.value), 0) AS expenses_sum,
  COALESCE(ab.budget_sum, 0) AS budget_for_category
FROM
  categories c
LEFT JOIN
  expenses e ON e.category_id = c.id
  AND e.user_id = '77c0c161-ba86-4448-b848-9acb36b762ef'
  AND e.date >= '2025-12-01'
  AND e.date < '2026-01-01'
LEFT JOIN
  (
    SELECT
      b.category_id,
      SUM(b.value) AS budget_sum
    FROM
      budgets b
    WHERE
      b.user_id = '77c0c161-ba86-4448-b848-9acb36b762ef'
      AND b.date >= '2025-12-01'
      AND b.date < '2026-01-01'
    GROUP BY
      b.category_id
  ) ab ON ab.category_id = c.id
WHERE
  c.user_id = '77c0c161-ba86-4448-b848-9acb36b762ef'
GROUP BY
  c.id, c.name, ab.budget_sum
ORDER BY
  c.name
*/

const budgetSubquery = this.dbService.db
  .select({
    categoryId: budgets.categoryId,
    budgetSum: sql<string>`CAST(COALESCE(SUM(${budgets.value}), 0) AS TEXT)`.as('budgetSum'),
  })
  .from(budgets)
  .where(and(eq(budgets.userId, userId), gte(budgets.date, startDate), lte(budgets.date, endDate)))
  .groupBy(budgets.categoryId)
  .as('budgetSubquery')

    const result = await this.dbService.db
    .select({
      categoryName: categories.name,
      expensesSum: sql<string>`CAST(COALESCE(SUM(${expenses.value}), 0) AS TEXT)`,
      budget: sql<string>`COALESCE(${budgetSubquery.budgetSum}, '0')`,
    })
    .from(categories)
    .leftJoin(expenses,
      and(
        eq(expenses.categoryId, categories.id),
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate),
      )
    )
    .leftJoin(budgetSubquery, eq(categories.id, budgetSubquery.categoryId))
    .where(eq(categories.userId, userId))
    .groupBy(categories.id, categories.name, budgetSubquery.budgetSum)

    return result
  }
}
