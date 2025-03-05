import { users, tips, tills, employees, tipEmployees, type User, type InsertUser, type Tip, type InsertTip, type Till, type InsertTill, type Employee } from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  // Employee operations
  getAllEmployees(): Promise<Employee[]>;
  getActiveEmployees(): Promise<Employee[]>;

  // Tip operations
  createTip(tip: InsertTip & { distributions: Array<{ employeeId: number, amount: number }> }): Promise<Tip>;
  getTipsByDate(date: Date): Promise<Tip[]>;
  getAllTips(): Promise<Tip[]>;
  getTipEmployees(tipId: number): Promise<(Employee & { amount: number })[]>;

  // Till operations
  createTill(till: InsertTill): Promise<Till>;
  getTillsByDate(date: Date): Promise<Till[]>;
}

export class DatabaseStorage implements IStorage {
  // Existing user methods remain unchanged
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // Employee methods
  async getAllEmployees(): Promise<Employee[]> {
    return db.select().from(employees);
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.isActive, true));
  }

  // Updated tip methods with individual amounts
  async createTip(insertTip: InsertTip & { distributions: Array<{ employeeId: number, amount: number }> }): Promise<Tip> {
    const { distributions, ...tipData } = insertTip;

    return await db.transaction(async (tx) => {
      // Create the tip
      const [tip] = await tx.insert(tips).values(tipData).returning();

      // Create tip-employee relationships with individual amounts
      await Promise.all(
        distributions.map(dist =>
          tx.insert(tipEmployees).values({
            tipId: tip.id,
            employeeId: dist.employeeId,
            amount: dist.amount
          })
        )
      );

      return tip;
    });
  }

  async getTipsByDate(date: Date): Promise<Tip[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.select().from(tips)
      .where(and(gte(tips.date, startOfDay), lte(tips.date, endOfDay)));
  }

  async getAllTips(): Promise<Tip[]> {
    return db.select().from(tips);
  }

  async getTipEmployees(tipId: number): Promise<(Employee & { amount: number })[]> {
    const result = await db
      .select({
        ...employees,
        amount: tipEmployees.amount
      })
      .from(tipEmployees)
      .innerJoin(employees, eq(tipEmployees.employeeId, employees.id))
      .where(eq(tipEmployees.tipId, tipId));

    return result;
  }

  // Till methods remain unchanged
  async createTill(insertTill: InsertTill): Promise<Till> {
    const [till] = await db.insert(tills).values(insertTill).returning();
    return till;
  }

  async getTillsByDate(date: Date): Promise<Till[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db.select().from(tills)
      .where(and(gte(tills.date, startOfDay), lte(tills.date, endOfDay)));
  }
}

// Create default admin user on startup
async function initializeDatabase() {
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    await storage.createUser({
      username: "admin",
      password: "admin123", // In production, this should be hashed
      isAdmin: true
    });
  }
}

export const storage = new DatabaseStorage();
initializeDatabase().catch(console.error);