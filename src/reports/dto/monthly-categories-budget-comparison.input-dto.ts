import { createZodDto } from "nestjs-zod";
import { monthStringZod } from "../../utils/zod/month-string.zod";
import { yearStringZod } from "../../utils/zod/year-string.zod";
import z from "zod";

export class MonthlyCategoriesBudgetComparisonQueryInputDto extends createZodDto(z.object({
    year: yearStringZod,
    month: monthStringZod,
    categoryType: z.enum(['all', 'expense', 'saving']).optional().default('all'),
})) { }