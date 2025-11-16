import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
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

  async update(
    userId: string,
    expenseId: number,
    updateExpenseDto: UpdateExpenseBodyInputDto,
  ) {
    const [expense] = await this.dbService.db
      .update(expenses)
      .set(updateExpenseDto)
      .where(
        and(eq(expenses.id, expenseId), eq(expenses.userId, userId)),
      )
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
      .where(
        and(eq(expenses.id, expenseId), eq(expenses.userId, userId)),
      )
      .returning();

    if (!expense) {
      throw new NotFoundException(
        `Expense with ID ${expenseId} not found or does not belong to the user`,
      );
    }

    return expense;
  }
}
