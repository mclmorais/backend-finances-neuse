import { createZodDto } from "nestjs-zod";
import z from "zod";

const monthlyCategoriesBudgetComparisonItemSchema = z.object({
    categoryName: z.string(),
    categoryIcon: z.string(),
    categoryColor: z.string(),
    expensesSum: z.string(),
    budget: z.string(),
    carryover: z.string(),
    delta: z.string(),
});

export class MonthlyCategoriesBudgetComparisonOutputDto extends createZodDto(
    z.array(monthlyCategoriesBudgetComparisonItemSchema)
) {}