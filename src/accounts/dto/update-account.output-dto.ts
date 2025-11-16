import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const accountOutputSchema = z.object({
  id: z.number().int(),
  userId: z.uuid(),
  color: z.string(),
  icon: z.string(),
  name: z.string(),
});

export class UpdateAccountOutputDto extends createZodDto(accountOutputSchema) {}
