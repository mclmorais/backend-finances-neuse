import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const incomeOutputSchema = z.object({
  id: z.number().int(),
  userId: z.uuid(),
  accountId: z.number().int(),
  date: z.string(),
  description: z.string().nullable(),
  value: z.string(),
});

export class ListIncomesOutputDto extends createZodDto(
  z.array(incomeOutputSchema),
) {}
