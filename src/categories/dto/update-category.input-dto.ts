import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateCategoryBodySchema = z.object({
  color: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, {
    message: 'Color must be a valid hex color (e.g., #RGB or #RRGGBB)',
  }).optional(),
  icon: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
});

const updateCategoryParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, {
    message: 'ID must be a valid number',
  }).transform((val) => parseInt(val, 10)),
});

export class UpdateCategoryBodyInputDto extends createZodDto(updateCategoryBodySchema) {}
export class UpdateCategoryParamsInputDto extends createZodDto(updateCategoryParamsSchema) {}
