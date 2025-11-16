import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const deleteCategoryParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, {
    message: 'ID must be a valid number',
  }).transform((val) => parseInt(val, 10)),
});

export class DeleteCategoryParamsInputDto extends createZodDto(deleteCategoryParamsSchema) {}
