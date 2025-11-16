import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const expenseOutputSchema = z.object({
  id: z.number().int(),
  userId: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ),
  accountId: z.number().int(),
  categoryId: z.number().int(),
  date: z.string(),
  description: z.string().nullable(),
  value: z.string(),
});

export class UpdateExpenseOutputDto extends createZodDto(expenseOutputSchema) {}
