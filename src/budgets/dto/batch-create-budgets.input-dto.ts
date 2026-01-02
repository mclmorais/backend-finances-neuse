import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const budgetItemSchema = z.object({
  accountId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-01$/, {
    message: 'Date must be in YYYY-MM-01 format (first day of month)',
  }),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Value must be a valid decimal number (e.g., 10.50)',
  }),
});

const batchCreateBudgetsSchema = z.object({
  budgets: z.array(budgetItemSchema).min(1, 'At least one budget is required'),
});

export class BatchCreateBudgetsBodyInputDto extends createZodDto(
  batchCreateBudgetsSchema,
) {}
