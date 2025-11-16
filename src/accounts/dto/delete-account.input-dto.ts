import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const deleteAccountParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val, 10)),
});

export class DeleteAccountParamsInputDto extends createZodDto(
  deleteAccountParamsSchema,
) {}
