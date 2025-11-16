import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const deleteCategoryPlanningParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10)),
});

export class DeleteCategoryPlanningParamsInputDto extends createZodDto(
  deleteCategoryPlanningParamsSchema,
) {}
