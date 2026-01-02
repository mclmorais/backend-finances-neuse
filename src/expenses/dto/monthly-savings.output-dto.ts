import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const monthlySavingsItemSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  categoryId: z.number().int(),
  categoryName: z.string(),
  categoryIcon: z.string(),
  categoryColor: z.string(),
  categoryType: z.enum(['expense', 'saving']),
  totalValue: z.string(),
  accumulatedValue: z.string(),
});

export class MonthlySavingsOutputDto extends createZodDto(
  z.array(monthlySavingsItemSchema),
) {}

