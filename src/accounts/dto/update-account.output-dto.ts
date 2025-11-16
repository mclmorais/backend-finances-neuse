import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const accountOutputSchema = z.object({
  id: z.number().int(),
  userId: z
    .string()
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ),
  color: z.string(),
  icon: z.string(),
  name: z.string(),
});

export class UpdateAccountOutputDto extends createZodDto(accountOutputSchema) {}
