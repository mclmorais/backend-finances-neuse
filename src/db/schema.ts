import {
  date,
  decimal,
  integer,
  pgTable,
  serial,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
});

export type InsertCategory = typeof categories.$inferInsert;
export type SelectCategory = typeof categories.$inferSelect;

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  name: text('name').notNull(),
});

export type InsertAccount = typeof accounts.$inferInsert;
export type SelectAccount = typeof accounts.$inferSelect;

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  accountId: integer('account_id')
    .references(() => accounts.id)
    .notNull(),
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
  date: date('date').notNull(),
  description: text('description'),
  value: decimal('value').notNull(),
});

export type InsertExpense = typeof expenses.$inferInsert;
export type SelectExpense = typeof expenses.$inferSelect;

export const incomes = pgTable('incomes', {
  id: serial('id').primaryKey().notNull(),
  userId: uuid('user_id').notNull(),
  accountId: integer('account_id')
    .references(() => accounts.id)
    .notNull(),
  date: date('date').notNull(),
  description: text('description'),
  value: decimal('value').notNull(),
});

export type InsertIncome = typeof incomes.$inferInsert;
export type SelectIncome = typeof incomes.$inferSelect;
