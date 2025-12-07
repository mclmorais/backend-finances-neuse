import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const monthlySummarySchema = z.object({
  totalIncome: z.string(),
  incomeCount: z.number().int(),
});

export class MonthlySummaryOutputDto extends createZodDto(
  monthlySummarySchema,
) {}
