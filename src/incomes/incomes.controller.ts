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
import { IncomesService } from './incomes.service';
import { CreateIncomeBodyInputDto } from './dto/create-income.input-dto';
import { CreateIncomeOutputDto } from './dto/create-income.output-dto';
import { DeleteIncomeParamsInputDto } from './dto/delete-income.input-dto';
import { ListIncomesByMonthQueryInputDto } from './dto/list-incomes-by-month.input-dto';
import { ListIncomesOutputDto } from './dto/list-incomes.output-dto';
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
  @ZodResponse({ type: ListIncomesOutputDto })
  async findAll(@User() user: { userId: string }) {
    return this.incomesService.findAll(user.userId);
  }

  @Get('by-month')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ListIncomesOutputDto })
  async findByMonth(
    @User() user: { userId: string },
    @Query() query: ListIncomesByMonthQueryInputDto,
  ) {
    return this.incomesService.findByMonth(
      user.userId,
      query.year,
      query.month,
    );
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateIncomeOutputDto })
  async update(
    @User() user: { userId: string },
    @Param() params: UpdateIncomeParamsInputDto,
    @Body() updateIncomeDto: UpdateIncomeBodyInputDto,
  ) {
    return this.incomesService.update(user.userId, params.id, updateIncomeDto);
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateIncomeOutputDto })
  async delete(
    @User() user: { userId: string },
    @Param() params: DeleteIncomeParamsInputDto,
  ) {
    return this.incomesService.delete(user.userId, params.id);
  }
}
