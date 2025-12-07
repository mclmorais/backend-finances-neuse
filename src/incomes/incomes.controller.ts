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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { User } from '../auth/decorators/user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { IncomesService } from './incomes.service';
import { CreateIncomeBodyInputDto } from './dto/create-income.input-dto';
import { CreateIncomeOutputDto } from './dto/create-income.output-dto';
import { DeleteIncomeParamsInputDto } from './dto/delete-income.input-dto';
import { ListIncomesOutputDto } from './dto/list-incomes.output-dto';
import { ListMonthlyIncomesQueryInputDto } from './dto/list-monthly-incomes.input-dto';
import { MonthlySummaryOutputDto } from './dto/monthly-summary.output-dto';
import {
  UpdateIncomeBodyInputDto,
  UpdateIncomeParamsInputDto,
} from './dto/update-income.input-dto';
import { UpdateIncomeOutputDto } from './dto/update-income.output-dto';

@Controller('incomes')
@ApiBearerAuth('bearer')
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new income',
    description: 'Creates a new income record for the authenticated user',
  })
  @ZodResponse({ type: CreateIncomeOutputDto })
  async create(
    @User() user: { userId: string },
    @Body() createIncomeDto: CreateIncomeBodyInputDto,
  ) {
    return this.incomesService.create(user.userId, createIncomeDto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all incomes',
    description: 'Returns all income records for the authenticated user',
  })
  @ZodResponse({ type: ListIncomesOutputDto })
  async findAll(@User() user: { userId: string }) {
    return this.incomesService.findAll(user.userId);
  }

  @Get('monthly')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List incomes for a specific month',
    description:
      'Returns all income records for the specified month, sorted by date descending',
  })
  @ZodResponse({ type: ListIncomesOutputDto })
  async findMonthly(
    @User() user: { userId: string },
    @Query() query: ListMonthlyIncomesQueryInputDto,
  ) {
    return this.incomesService.findByMonth(
      user.userId,
      query.year,
      query.month,
    );
  }

  @Get('monthly/summary')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get monthly income summary',
    description:
      'Returns total income amount and count of income records for the specified month',
  })
  @ZodResponse({ type: MonthlySummaryOutputDto })
  async getMonthlySummary(
    @User() user: { userId: string },
    @Query() query: ListMonthlyIncomesQueryInputDto,
  ) {
    return this.incomesService.getMonthlySummary(
      user.userId,
      query.year,
      query.month,
    );
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an income',
    description:
      'Updates an existing income record. Returns 404 if not found or does not belong to user',
  })
  @ZodResponse({ type: UpdateIncomeOutputDto })
  async update(
    @User() user: { userId: string },
    @Param() params: UpdateIncomeParamsInputDto,
    @Body() updateIncomeDto: UpdateIncomeBodyInputDto,
  ) {
    return this.incomesService.update(
      user.userId,
      params.id,
      updateIncomeDto,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an income',
    description:
      'Deletes an income record. Returns 404 if not found or does not belong to user',
  })
  @ZodResponse({ type: UpdateIncomeOutputDto })
  async delete(
    @User() user: { userId: string },
    @Param() params: DeleteIncomeParamsInputDto,
  ) {
    return this.incomesService.delete(user.userId, params.id);
  }
}
