import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateIncomeParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10)),
});

const updateIncomeBodySchema = z.object({
  accountId: z.number().int().positive().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Date must be in YYYY-MM-DD format',
    })
    .optional(),
  description: z.string().optional(),
  value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'Value must be a valid decimal number (e.g., 10.50)',
    })
    .optional(),
});

export class UpdateIncomeParamsInputDto extends createZodDto(
  updateIncomeParamsSchema,
) {}

export class UpdateIncomeBodyInputDto extends createZodDto(
  updateIncomeBodySchema,
) {}
