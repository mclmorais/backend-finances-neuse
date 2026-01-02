import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const budgetOutputSchema = z.object({
  id: z.number().int(),
  userId: z.uuid(),
  accountId: z.number().int(),
  categoryId: z.number().int(),
  date: z.string(),
  value: z.string(),
});

export class UpdateBudgetOutputDto extends createZodDto(budgetOutputSchema) {}
