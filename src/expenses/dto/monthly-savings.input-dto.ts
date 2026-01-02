import { createZodDto } from 'nestjs-zod';
import { monthStringZod } from '../../utils/zod/month-string.zod';
import { yearStringZod } from '../../utils/zod/year-string.zod';
import { z } from 'zod';

export class MonthlySavingsQueryInputDto extends createZodDto(
  z.object({
    startYear: yearStringZod.optional(),
    startMonth: monthStringZod.optional(),
    endYear: yearStringZod.optional(),
    endMonth: monthStringZod.optional(),
    categoryType: z.enum(['expenses', 'savings', 'both']).optional().default('both'),
  }),
) {}

