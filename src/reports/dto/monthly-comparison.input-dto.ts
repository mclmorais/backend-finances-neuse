import { createZodDto } from 'nestjs-zod';
import { monthStringZod } from '../../utils/zod/month-string.zod';
import { yearStringZod } from '../../utils/zod/year-string.zod';
import { z } from 'zod';

const monthlyComparisonQuerySchema = z.object({
  year: yearStringZod,
  month: monthStringZod,
});

export class MonthlyComparisonQueryInputDto extends createZodDto(
  monthlyComparisonQuerySchema,
) {}
