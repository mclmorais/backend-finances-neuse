import z from "zod";

export const yearStringZod = z
.string()
.regex(/^\d{4}$/, { message: 'Year must be a 4-digit number' })
.transform((val) => parseInt(val, 10))