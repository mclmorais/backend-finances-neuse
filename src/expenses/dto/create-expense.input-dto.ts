import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createExpenseSchema = z.object({
  accountId: z.number().int().positive(),
  categoryId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  }),
  description: z.string().optional(),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: 'Value must be a valid decimal number (e.g., 10.50)',
  }),
  savingsType: z.enum(['deposit', 'withdrawal']).optional(),
});

export class CreateExpenseBodyInputDto extends createZodDto(
  createExpenseSchema,
) {}
