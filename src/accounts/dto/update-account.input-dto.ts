import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateAccountParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10)),
});

const updateAccountBodySchema = z.object({
  color: z
    .string()
    .regex(/^#([0-9a-f]{6}|[0-9a-f]{3})$/i, {
      message: 'Color must be a valid hex color (e.g., #RGB or #RRGGBB)',
    })
    .optional(),
  icon: z.string().optional(),
  name: z.string().optional(),
});

export class UpdateAccountParamsInputDto extends createZodDto(
  updateAccountParamsSchema,
) {}

export class UpdateAccountBodyInputDto extends createZodDto(
  updateAccountBodySchema,
) {}
