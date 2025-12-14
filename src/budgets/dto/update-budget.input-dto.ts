import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateBudgetParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10)),
});

const updateBudgetBodySchema = z.object({
  accountId: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-01$/, {
      message: 'Date must be in YYYY-MM-01 format (first day of month)',
    })
    .optional(),
  value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'Value must be a valid decimal number (e.g., 10.50)',
    })
    .optional(),
});

export class UpdateBudgetParamsInputDto extends createZodDto(
  updateBudgetParamsSchema,
) {}

export class UpdateBudgetBodyInputDto extends createZodDto(
  updateBudgetBodySchema,
) {}
