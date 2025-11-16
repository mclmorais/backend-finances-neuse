import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, gte, lte } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { incomes } from '../db/schema';
import { CreateIncomeBodyInputDto } from './dto/create-income.input-dto';
import { UpdateIncomeBodyInputDto } from './dto/update-income.input-dto';

@Injectable()
export class IncomesService {
  constructor(private readonly dbService: DbService) {}

  async create(userId: string, createIncomeDto: CreateIncomeBodyInputDto) {
    const [income] = await this.dbService.db
      .insert(incomes)
      .values({
        ...createIncomeDto,
        userId,
      })
      .returning();

    return income;
  }

  async findAll(userId: string) {
    return this.dbService.db
      .select()
      .from(incomes)
      .where(eq(incomes.userId, userId));
  }

  async findByMonth(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return this.dbService.db
      .select()
      .from(incomes)
      .where(
        and(
          eq(incomes.userId, userId),
          gte(incomes.date, startDate),
          lte(incomes.date, endDate),
        ),
      );
  }

  async update(
    userId: string,
    incomeId: number,
    updateIncomeDto: UpdateIncomeBodyInputDto,
  ) {
    const [income] = await this.dbService.db
      .update(incomes)
      .set(updateIncomeDto)
      .where(and(eq(incomes.id, incomeId), eq(incomes.userId, userId)))
      .returning();

    if (!income) {
      throw new NotFoundException(
        `Income with ID ${incomeId} not found or does not belong to the user`,
      );
    }

    return income;
  }

  async delete(userId: string, incomeId: number) {
    const [income] = await this.dbService.db
      .delete(incomes)
      .where(and(eq(incomes.id, incomeId), eq(incomes.userId, userId)))
      .returning();

    if (!income) {
      throw new NotFoundException(
        `Income with ID ${incomeId} not found or does not belong to the user`,
      );
    }

    return income;
  }
}
