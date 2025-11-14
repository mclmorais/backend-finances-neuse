import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id: serial('id').primaryKey().notNull(),
  userId: integer('user_id').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
})