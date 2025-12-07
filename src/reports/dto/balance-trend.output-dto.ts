import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const monthlyBalanceSchema = z.object({
  year: z.number().int(),
  month: z.number().int(),
  totalIncome: z.string(),
  totalExpenses: z.string(),
  netBalance: z.string(),
  cumulativeBalance: z.string(),
});

export class BalanceTrendOutputDto extends createZodDto(
  z.array(monthlyBalanceSchema),
) {}
