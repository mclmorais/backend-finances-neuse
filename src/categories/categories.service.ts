import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { categories } from '../db/schema';
import { CreateCategoryBodyInputDto } from './dto/create-category.input-dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly dbService: DbService) {}

  async create(
    userId: string,
    createCategoryDto: CreateCategoryBodyInputDto,
  ) {
    const [category] = await this.dbService.db
      .insert(categories)
      .values({
        ...createCategoryDto,
        userId,
      })
      .returning();

    return category;
  }
}

