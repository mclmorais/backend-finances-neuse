import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const categoryOutputSchema = z.object({
  id: z.number().int(),
  userId: z.uuid(),
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  type: z.string(),
});

export class UpdateCategoryOutputDto extends createZodDto(
  categoryOutputSchema,
) {}
