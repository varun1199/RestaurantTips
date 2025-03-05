import { pgTable, text, serial, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  employeeId: text("employee_id").unique(),
  email: text("email"),
});

// New Employee model
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// Tips model with employee relations
export const tips = pgTable("tips", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  amount: numeric("amount").notNull(),
  numEmployees: numeric("num_employees").notNull(),
  submittedById: serial("submitted_by_id").references(() => users.id),
});

// Junction table for tips and employees with individual amounts
export const tipEmployees = pgTable("tip_employees", {
  id: serial("id").primaryKey(),
  tipId: serial("tip_id").references(() => tips.id),
  employeeId: serial("employee_id").references(() => employees.id),
  amount: numeric("amount").notNull(), // Individual tip amount for this employee
});

// Till model 
export const tills = pgTable("tills", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
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
export const registrationSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email format").optional(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertEmployeeSchema = createInsertSchema(employees);
export const insertTipSchema = createInsertSchema(tips)
  .omit({ id: true, date: true })
  .extend({
    amount: z.number().min(0, "Amount must be positive"),
    numEmployees: z.number().min(1, "Must have at least one employee"),
    employeeIds: z.array(z.number()).min(1, "Select at least one employee"),
    distributions: z.array(z.object({
      employeeId: z.number(),
      employeeName: z.string(),
      amount: z.number()
    }))
  });
export const insertTillSchema = createInsertSchema(tills).omit({ id: true, date: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Till = typeof tills.$inferSelect;
export type InsertTill = z.infer<typeof insertTillSchema>;
export type TipEmployee = typeof tipEmployees.$inferSelect;