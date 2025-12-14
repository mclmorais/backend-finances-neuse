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

const batchCreateBudgetsOutputSchema = z.object({
  created: z.array(budgetOutputSchema),
  errors: z.array(
    z.object({
      budget: z.object({
        accountId: z.number().int(),
        categoryId: z.number().int(),
        date: z.string(),
        value: z.string(),
      }),
      error: z.string(),
    }),
  ),
});

export class BatchCreateBudgetsOutputDto extends createZodDto(
  batchCreateBudgetsOutputSchema,
) {}
