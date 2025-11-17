import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const previousMonthsRemainingItemSchema = z.object({
  categoryId: z.number().int(),
  categoryName: z.string(),
  categoryColor: z.string(),
  categoryIcon: z.string(),
  categoryType: z.string(),
  cumulativeRemaining: z.string(),
});

export class PreviousMonthsRemainingOutputDto extends createZodDto(
  z.array(previousMonthsRemainingItemSchema),
) {}
