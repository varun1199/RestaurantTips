import { pgTable, text, serial, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

// Tip record model
export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  amount: numeric("amount").notNull(),
  numEmployees: numeric("num_employees").notNull(),
  submittedById: serial("submitted_by_id").references(() => users.id),
});

// Till calculation model
export const tills = pgTable("tills", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  pennies: numeric("pennies").notNull(),
  nickels: numeric("nickels").notNull(),
  dimes: numeric("dimes").notNull(),
  quarters: numeric("quarters").notNull(),
  ones: numeric("ones").notNull(),
  fives: numeric("fives").notNull(),
  tens: numeric("tens").notNull(),
  twenties: numeric("twenties").notNull(),
  fifties: numeric("fifties").notNull(),
  hundreds: numeric("hundreds").notNull(),
  total: numeric("total").notNull(),
  submittedById: serial("submitted_by_id").references(() => users.id),
});

// Schemas for insertion
export const insertUserSchema = createInsertSchema(users);
export const insertTipSchema = createInsertSchema(tips).omit({ id: true, date: true });
export const insertTillSchema = createInsertSchema(tills).omit({ id: true, date: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Till = typeof tills.$inferSelect;
export type InsertTill = z.infer<typeof insertTillSchema>;
