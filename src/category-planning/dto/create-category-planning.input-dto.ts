import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createCategoryPlanningSchema = z.object({
  categoryId: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1900).max(2100),
  value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'Value must be a valid decimal number (e.g., 10.50)',
    })
    .optional(),
});

export class CreateCategoryPlanningBodyInputDto extends createZodDto(
  createCategoryPlanningSchema,
) {}
