import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { User } from '../auth/decorators/user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { ReportsService } from './reports.service';
import { MonthlyComparisonQueryInputDto } from './dto/monthly-comparison.input-dto';
import { MonthlyComparisonOutputDto } from './dto/monthly-comparison.output-dto';
import { BalanceTrendQueryInputDto } from './dto/balance-trend.input-dto';
import { BalanceTrendOutputDto } from './dto/balance-trend.output-dto';
import { MonthlyCategoriesBudgetComparisonQueryInputDto } from './dto/monthly-categories-budget-comparison.input-dto';

@Controller('reports')
@ApiBearerAuth('bearer')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('monthly-comparison')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compare income vs expenses for a specific month',
    description:
      'Returns total income, total expenses, net balance, and counts for a given month',
  })
  @ZodResponse({ type: MonthlyComparisonOutputDto })
  async getMonthlyComparison(
    @User() user: { userId: string },
    @Query() query: MonthlyComparisonQueryInputDto,
  ) {
    return this.reportsService.getMonthlyComparison(
      user.userId,
      query.year,
      query.month,
    );
  }

  @Get('balance-trend')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get balance trend over a date range',
    description:
      'Returns monthly income, expenses, net balance, and cumulative balance for each month in the specified range',
  })
  @ZodResponse({ type: BalanceTrendOutputDto })
  async getBalanceTrend(
    @User() user: { userId: string },
    @Query() query: BalanceTrendQueryInputDto,
  ) {
    return this.reportsService.getBalanceTrend(
      user.userId,
      query.startYear,
      query.startMonth,
      query.endYear,
      query.endMonth,
    );
  }

  @Get('monthly-categories-budget-comparison/:userId')
  // @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compare categories budget vs actual expenses for a specific month',
    description: 'Returns the budget allocation for each category and the actual expenses for the specified month',
  })
  // @ZodResponse({ type: MonthlyCategoriesBudgetComparisonOutputDto })
  async getMonthlyCategoriesBudgetComparison(
    @Param('userId') userId: string,
    @Query() query: MonthlyCategoriesBudgetComparisonQueryInputDto,
  ) {
    return this.reportsService.getMonthlyCategoriesBudgetComparison(
      userId,
      query.year,
      query.month,
    );
  }
}
