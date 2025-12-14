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
import { BudgetsService } from './budgets.service';
import { CreateBudgetBodyInputDto } from './dto/create-budget.input-dto';
import { CreateBudgetOutputDto } from './dto/create-budget.output-dto';
import { BatchCreateBudgetsBodyInputDto } from './dto/batch-create-budgets.input-dto';
import { BatchCreateBudgetsOutputDto } from './dto/batch-create-budgets.output-dto';
import { DeleteBudgetParamsInputDto } from './dto/delete-budget.input-dto';
import { ListBudgetsOutputDto } from './dto/list-budgets.output-dto';
import { ListMonthlyBudgetsQueryInputDto } from './dto/list-monthly-budgets.input-dto';
import {
  UpdateBudgetBodyInputDto,
  UpdateBudgetParamsInputDto,
} from './dto/update-budget.input-dto';
import { UpdateBudgetOutputDto } from './dto/update-budget.output-dto';

@Controller('budgets')
@ApiBearerAuth('bearer')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new budget allocation',
    description:
      'Creates a new budget allocation for a specific account-category-month combination',
  })
  @ZodResponse({ type: CreateBudgetOutputDto })
  async create(
    @User() user: { userId: string },
    @Body() createBudgetDto: CreateBudgetBodyInputDto,
  ) {
    return this.budgetsService.create(user.userId, createBudgetDto);
  }

  @Post('batch')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create multiple budget allocations at once',
    description:
      'Creates multiple budget allocations, gracefully handling conflicts',
  })
  @ZodResponse({ type: BatchCreateBudgetsOutputDto })
  async batchCreate(
    @User() user: { userId: string },
    @Body() batchCreateBudgetsDto: BatchCreateBudgetsBodyInputDto,
  ) {
    return this.budgetsService.batchCreate(user.userId, batchCreateBudgetsDto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all budgets',
    description: 'Returns all budget allocations for the authenticated user',
  })
  @ZodResponse({ type: ListBudgetsOutputDto })
  async findAll(@User() user: { userId: string }) {
    return this.budgetsService.findAll(user.userId);
  }

  @Get('monthly')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List budgets for a specific month',
    description: 'Returns all budget allocations for the specified month',
  })
  @ZodResponse({ type: ListBudgetsOutputDto })
  async findMonthly(
    @User() user: { userId: string },
    @Query() query: ListMonthlyBudgetsQueryInputDto,
  ) {
    return this.budgetsService.findByMonth(
      user.userId,
      query.year,
      query.month,
    );
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a budget allocation',
    description:
      'Updates an existing budget allocation. Returns 404 if not found or does not belong to user',
  })
  @ZodResponse({ type: UpdateBudgetOutputDto })
  async update(
    @User() user: { userId: string },
    @Param() params: UpdateBudgetParamsInputDto,
    @Body() updateBudgetDto: UpdateBudgetBodyInputDto,
  ) {
    return this.budgetsService.update(user.userId, params.id, updateBudgetDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a budget allocation',
    description:
      'Deletes a budget allocation. Returns 404 if not found or does not belong to user',
  })
  @ZodResponse({ type: UpdateBudgetOutputDto })
  async delete(
    @User() user: { userId: string },
    @Param() params: DeleteBudgetParamsInputDto,
  ) {
    return this.budgetsService.delete(user.userId, params.id);
  }
}
