import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const copyPlanningBodySchema = z.object({
  targetYear: z.number().int().min(1900).max(2100),
  targetMonth: z.number().int().min(1).max(12),
});

export class CopyPlanningBodyInputDto extends createZodDto(
  copyPlanningBodySchema,
) {}
