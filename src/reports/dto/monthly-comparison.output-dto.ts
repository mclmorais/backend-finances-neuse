import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const monthlyComparisonSchema = z.object({
  year: z.number().int(),
  month: z.number().int(),
  totalIncome: z.string(),
  totalExpenses: z.string(),
  netBalance: z.string(),
  incomeCount: z.number().int(),
  expenseCount: z.number().int(),
});

export class MonthlyComparisonOutputDto extends createZodDto(
  monthlyComparisonSchema,
) {}
