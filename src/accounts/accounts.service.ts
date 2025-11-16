import { Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DbService } from '../db/db.service';
import { accounts } from '../db/schema';
import { CreateAccountBodyInputDto } from './dto/create-account.input-dto';
import { UpdateAccountBodyInputDto } from './dto/update-account.input-dto';

@Injectable()
export class AccountsService {
  constructor(private readonly dbService: DbService) {}

  async create(userId: string, createAccountDto: CreateAccountBodyInputDto) {
    const [account] = await this.dbService.db
      .insert(accounts)
      .values({
        ...createAccountDto,
        userId,
      })
      .returning();

    return account;
  }

  async findAll(userId: string) {
    return this.dbService.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
  }

  async update(
    userId: string,
    accountId: number,
    updateAccountDto: UpdateAccountBodyInputDto,
  ) {
    const [account] = await this.dbService.db
      .update(accounts)
      .set(updateAccountDto)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
      )
      .returning();

    if (!account) {
      throw new NotFoundException(
        `Account with ID ${accountId} not found or does not belong to the user`,
      );
    }

    return account;
  }

  async delete(userId: string, accountId: number) {
    const [account] = await this.dbService.db
      .delete(accounts)
      .where(
        and(eq(accounts.id, accountId), eq(accounts.userId, userId)),
      )
      .returning();

    if (!account) {
      throw new NotFoundException(
        `Account with ID ${accountId} not found or does not belong to the user`,
      );
    }

    return account;
  }
}
