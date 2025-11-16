import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const categoryPlanningAnalysisItemSchema = z.object({
  categoryId: z.number().int(),
  categoryName: z.string(),
  categoryColor: z.string(),
  categoryIcon: z.string(),
  categoryType: z.string(),
  plannedValue: z.string().nullable(),
  totalSpent: z.string(),
  availableAmount: z.string(),
});

export class CategoryPlanningAnalysisOutputDto extends createZodDto(
  z.array(categoryPlanningAnalysisItemSchema),
) {}
