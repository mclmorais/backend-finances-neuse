import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const listMonthlyBudgetsQuerySchema = z.object({
  year: z
    .string()
    .regex(/^\d{4}$/, { message: 'Year must be a 4-digit number' })
    .transform((val) => parseInt(val, 10)),
  month: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, { message: 'Month must be between 1 and 12' })
    .transform((val) => parseInt(val, 10)),
});

export class ListMonthlyBudgetsQueryInputDto extends createZodDto(
  listMonthlyBudgetsQuerySchema,
) {}
