import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const balanceTrendQuerySchema = z.object({
  startYear: z
    .string()
    .regex(/^\d{4}$/, { message: 'Year must be a 4-digit number' })
    .transform((val) => parseInt(val, 10)),
  startMonth: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, { message: 'Month must be between 1 and 12' })
    .transform((val) => parseInt(val, 10)),
  endYear: z
    .string()
    .regex(/^\d{4}$/, { message: 'Year must be a 4-digit number' })
    .transform((val) => parseInt(val, 10)),
  endMonth: z
    .string()
    .regex(/^(0?[1-9]|1[0-2])$/, { message: 'Month must be between 1 and 12' })
    .transform((val) => parseInt(val, 10)),
});

export class BalanceTrendQueryInputDto extends createZodDto(
  balanceTrendQuerySchema,
) {}
