import { createZodDto } from "nestjs-zod";
import { monthStringZod } from "src/utils/zod/month-string.zod";
import { yearStringZod } from "src/utils/zod/year-string.zod";
import z from "zod";

export class MonthlyCategoriesBudgetComparisonQueryInputDto extends createZodDto(z.object({
    year: yearStringZod,
    month: monthStringZod,
})) { }