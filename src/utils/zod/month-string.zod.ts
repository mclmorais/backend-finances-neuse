import z from "zod";

export const monthStringZod = z
.string()
.regex(/^(0?[1-9]|1[0-2])$/, { message: 'Month must be between 1 and 12' })
.transform((val) => parseInt(val, 10))