import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const categoryPlanningOutputSchema = z.object({
  id: z.number().int(),
  userId: z.uuid(),
  categoryId: z.number().int(),
  month: z.number().int(),
  year: z.number().int(),
  value: z.string().nullable(),
});

export class CreateCategoryPlanningOutputDto extends createZodDto(
  categoryPlanningOutputSchema,
) {}
