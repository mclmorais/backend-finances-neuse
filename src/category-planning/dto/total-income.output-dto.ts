import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const totalIncomeSchema = z.object({
  totalIncome: z.string(),
});

export class TotalIncomeOutputDto extends createZodDto(totalIncomeSchema) {}
