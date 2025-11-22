import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const categorySchema = z.object({
  id: z.number().int(),
  userId: z.uuid(),
  color: z.string(),
  icon: z.string(),
  name: z.string(),
  type: z.string(),
});

const listCategoriesOutputSchema = z.array(categorySchema);

export class ListCategoriesOutputDto extends createZodDto(
  listCategoriesOutputSchema,
) {}
