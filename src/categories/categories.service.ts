import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { categories } from '../db/schema';
import { CreateCategoryBodyInputDto } from './dto/create-category.input-dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly dbService: DbService) {}

  async create(createCategoryDto: CreateCategoryBodyInputDto) {
    const [category] = await this.dbService.db
      .insert(categories)
      .values(createCategoryDto)
      .returning();

    return category;
  }
}

