import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
}

