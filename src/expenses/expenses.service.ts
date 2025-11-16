import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, gte, lte } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { expenses } from '../db/schema';
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
      );
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
}
