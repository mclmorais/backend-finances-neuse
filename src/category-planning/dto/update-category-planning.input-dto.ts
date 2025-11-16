import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateCategoryPlanningParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10)),
});

const updateCategoryPlanningBodySchema = z.object({
  categoryId: z.number().int().positive().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  value: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, {
      message: 'Value must be a valid decimal number (e.g., 10.50)',
    })
    .optional(),
});

export class UpdateCategoryPlanningParamsInputDto extends createZodDto(
  updateCategoryPlanningParamsSchema,
) {}

export class UpdateCategoryPlanningBodyInputDto extends createZodDto(
  updateCategoryPlanningBodySchema,
) {}
