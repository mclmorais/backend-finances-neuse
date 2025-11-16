import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { User } from '../auth/decorators/user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseBodyInputDto } from './dto/create-expense.input-dto';
import { CreateExpenseOutputDto } from './dto/create-expense.output-dto';
import { DeleteExpenseParamsInputDto } from './dto/delete-expense.input-dto';
import { ListExpensesOutputDto } from './dto/list-expenses.output-dto';
import {
  UpdateExpenseBodyInputDto,
  UpdateExpenseParamsInputDto,
} from './dto/update-expense.input-dto';
import { UpdateExpenseOutputDto } from './dto/update-expense.output-dto';

@Controller('expenses')
@ApiBearerAuth('bearer')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ type: CreateExpenseOutputDto })
  async create(
    @User() user: { userId: string },
    @Body() createExpenseDto: CreateExpenseBodyInputDto,
  ) {
    return this.expensesService.create(user.userId, createExpenseDto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ListExpensesOutputDto })
  async findAll(@User() user: { userId: string }) {
    return this.expensesService.findAll(user.userId);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateExpenseOutputDto })
  async update(
    @User() user: { userId: string },
    @Param() params: UpdateExpenseParamsInputDto,
    @Body() updateExpenseDto: UpdateExpenseBodyInputDto,
  ) {
    return this.expensesService.update(
      user.userId,
      params.id,
      updateExpenseDto,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateExpenseOutputDto })
  async delete(
    @User() user: { userId: string },
    @Param() params: DeleteExpenseParamsInputDto,
  ) {
    return this.expensesService.delete(user.userId, params.id);
  }
}
