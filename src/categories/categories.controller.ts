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
import { CategoriesService } from './categories.service';
import { CreateCategoryBodyInputDto } from './dto/create-category.input-dto';
import { CreateCategoryOutputDto } from './dto/create-category.output-dto';
import { DeleteCategoryParamsInputDto } from './dto/delete-category.input-dto';
import { ListCategoriesOutputDto } from './dto/list-categories.output-dto';
import {
  UpdateCategoryBodyInputDto,
  UpdateCategoryParamsInputDto,
} from './dto/update-category.input-dto';
import { UpdateCategoryOutputDto } from './dto/update-category.output-dto';

@Controller('categories')
@ApiBearerAuth('bearer')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ type: CreateCategoryOutputDto })
  async create(
    @User() user: { userId: string },
    @Body() createCategoryDto: CreateCategoryBodyInputDto,
  ) {
    return this.categoriesService.create(user.userId, createCategoryDto);
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ListCategoriesOutputDto })
  async findAll(@User() user: { userId: string }) {
    return this.categoriesService.findAll(user.userId);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateCategoryOutputDto })
  async update(
    @User() user: { userId: string },
    @Param() params: UpdateCategoryParamsInputDto,
    @Body() updateCategoryDto: UpdateCategoryBodyInputDto,
  ) {
    return this.categoriesService.update(
      user.userId,
      params.id,
      updateCategoryDto,
    );
  }

  @Delete(':id')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: UpdateCategoryOutputDto })
  async delete(
    @User() user: { userId: string },
    @Param() params: DeleteCategoryParamsInputDto,
  ) {
    return this.categoriesService.delete(user.userId, params.id);
  }
}

