import { pgTable, serial, text, uuid } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
})

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;