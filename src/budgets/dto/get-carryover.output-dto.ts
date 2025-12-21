import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const carryoverItemSchema = z.object({
  accountId: z.number().int(),
  categoryId: z.number().int(),
  remaining: z.string(),
});

export class GetCarryoverOutputDto extends createZodDto(
  z.array(carryoverItemSchema),
) {}

