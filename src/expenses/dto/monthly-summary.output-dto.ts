import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const categorySummarySchema = z.object({
  categoryId: z.number().int(),
  categoryName: z.string(),
  categoryIcon: z.string(),
  categoryColor: z.string(),
  totalValue: z.string(),
  expenseCount: z.number().int(),
});

export class MonthlySummaryOutputDto extends createZodDto(
  z.array(categorySummarySchema),
) {}
