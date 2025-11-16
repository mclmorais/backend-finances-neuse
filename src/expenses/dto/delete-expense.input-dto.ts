import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const deleteExpenseParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10)),
});

export class DeleteExpenseParamsInputDto extends createZodDto(
  deleteExpenseParamsSchema,
) {}
