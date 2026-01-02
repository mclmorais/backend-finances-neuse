import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const deleteBudgetParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10)),
});

export class DeleteBudgetParamsInputDto extends createZodDto(
  deleteBudgetParamsSchema,
) {}
