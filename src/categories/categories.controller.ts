import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { CategoriesService } from './categories.service';
import { CreateCategoryBodyInputDto } from './dto/create-category.input-dto';
import { CreateCategoryOutputDto } from './dto/create-category.output-dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ type: CreateCategoryOutputDto })
  async create(@Body() createCategoryDto: CreateCategoryBodyInputDto) {
    return this.categoriesService.create(createCategoryDto);
  }
}

