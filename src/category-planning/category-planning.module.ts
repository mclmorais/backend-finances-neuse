import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DbModule } from '../db/db.module';
import { CategoryPlanningController } from './category-planning.controller';
import { CategoryPlanningService } from './category-planning.service';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [CategoryPlanningController],
  providers: [CategoryPlanningService],
})
export class CategoryPlanningModule {}
