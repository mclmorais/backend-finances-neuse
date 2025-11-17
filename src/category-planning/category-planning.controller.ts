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
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { User } from '../auth/decorators/user.decorator';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CategoryPlanningService } from './category-planning.service';
import { CategoryPlanningAnalysisOutputDto } from './dto/category-planning-analysis.output-dto';
import { CopyPlanningBodyInputDto } from './dto/copy-planning.input-dto';
import { CreateCategoryPlanningBodyInputDto } from './dto/create-category-planning.input-dto';
import { CreateCategoryPlanningOutputDto } from './dto/create-category-planning.output-dto';
import { DeleteCategoryPlanningParamsInputDto } from './dto/delete-category-planning.input-dto';
import { ListCategoryPlanningByMonthQueryInputDto } from './dto/list-category-planning-by-month.input-dto';
import { ListCategoryPlanningOutputDto } from './dto/list-category-planning.output-dto';
import { TotalIncomeOutputDto } from './dto/total-income.output-dto';
import {
  UpdateCategoryPlanningBodyInputDto,
  UpdateCategoryPlanningParamsInputDto,
} from './dto/update-category-planning.input-dto';
import { UpdateCategoryPlanningOutputDto } from './dto/update-category-planning.output-dto';

@Controller('category-planning')
@ApiBearerAuth('bearer')
export class CategoryPlanningController {
  constructor(
    private readonly categoryPlanningService: CategoryPlanningService,
  ) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ type: CreateCategoryPlanningOutputDto })
  async create(
    @User() user: { userId: string },
    @Body() createCategoryPlanningDto: CreateCategoryPlanningBodyInputDto,
  ) {
    return this.categoryPlanningService.create(
      user.userId,
      createCategoryPlanningDto,
    );
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ListCategoryPlanningOutputDto })
  async findAll(@User() user: { userId: string }) {
    return this.categoryPlanningService.findAll(user.userId);
  }

  @Get('by-month')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ListCategoryPlanningOutputDto })
  async findByMonth(
    @User() user: { userId: string },
    @Query() query: ListCategoryPlanningByMonthQueryInputDto,
  ) {
    return this.categoryPlanningService.findByMonthYear(
      user.userId,
      query.year,
      query.month,
    );
  }

  @Get('analysis-by-month')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: CategoryPlanningAnalysisOutputDto })
  async getAnalysisByMonth(
    @User() user: { userId: string },
    @Query() query: ListCategoryPlanningByMonthQueryInputDto,
  ) {
    return this.categoryPlanningService.getCategoryPlanningAnalysis(
      user.userId,
      query.year,
      query.month,
    );
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateCategoryPlanningOutputDto })
  async update(
    @User() user: { userId: string },
    @Param() params: UpdateCategoryPlanningParamsInputDto,
    @Body() updateCategoryPlanningDto: UpdateCategoryPlanningBodyInputDto,
  ) {
    return this.categoryPlanningService.update(
      user.userId,
      params.id,
      updateCategoryPlanningDto,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateCategoryPlanningOutputDto })
  async delete(
    @User() user: { userId: string },
    @Param() params: DeleteCategoryPlanningParamsInputDto,
  ) {
    return this.categoryPlanningService.delete(user.userId, params.id);
  }

  @Get('total-income')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: TotalIncomeOutputDto })
  async getTotalIncome(
    @User() user: { userId: string },
    @Query() query: ListCategoryPlanningByMonthQueryInputDto,
  ) {
    return this.categoryPlanningService.getTotalIncomeByMonth(
      user.userId,
      query.year,
      query.month,
    );
  }

  @Post('copy-from-previous')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ type: ListCategoryPlanningOutputDto })
  async copyFromPrevious(
    @User() user: { userId: string },
    @Body() body: CopyPlanningBodyInputDto,
  ) {
    return this.categoryPlanningService.copyFromPreviousMonth(
      user.userId,
      body.targetYear,
      body.targetMonth,
    );
  }
}
