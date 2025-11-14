import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createCategorySchema = z.object({
  color: z.string().regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, {
    message: 'Color must be a valid hex color (e.g., #RGB or #RRGGBB)',
  }),
  icon: z.string(),
  name: z.string(),
  type: z.string(),
});

export class CreateCategoryBodyInputDto extends createZodDto(createCategorySchema) {}

