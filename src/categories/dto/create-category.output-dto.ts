import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const categoryOutputSchema = z.object({
  id: z.number().int(),
  userId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'userId must be a valid UUID',
  }),
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  type: z.string(),
});

export class CreateCategoryOutputDto extends createZodDto(categoryOutputSchema) {}

