import { users, tips, tills, employees, tipEmployees, type User, type InsertUser, type Tip, type InsertTip, type Till, type InsertTill, type Employee } from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmployeeId(employeeId: string): Promise<User | undefined>;
  updateUserPassword(id: number, newPassword: string): Promise<void>;
  updateUserProfile(id: number, updates: { username: string; email?: string }): Promise<User>;
  getAllUsers(): Promise<User[]>;  // Added this method

  // Employee operations
  getAllEmployees(): Promise<Employee[]>;
  getActiveEmployees(): Promise<Employee[]>;
  createEmployee(employee: { name: string; isActive: boolean }): Promise<Employee>;
  updateEmployee(id: number, updates: { isActive: boolean }): Promise<Employee>;

  // Tip operations
  createTip(tip: InsertTip): Promise<Tip>;
  updateTip(id: number, tip: InsertTip): Promise<Tip>;
  getTipsByDate(date: Date): Promise<Tip[]>;
  getAllTips(): Promise<Tip[]>;
  getTipEmployees(tipId: number): Promise<(Employee & { amount: number })[]>;
  deleteTip(id: number): Promise<void>;

  // Till operations
  createTill(till: InsertTill): Promise<Till>;
  getTillsByDate(date: Date): Promise<Till[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
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

  async getUserByEmployeeId(employeeId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.employeeId, employeeId));
    return user;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id));
  }

  async updateUserProfile(id: number, updates: { username: string; email?: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Employee methods
  async getAllEmployees(): Promise<Employee[]> {
    return db.select().from(employees);
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.isActive, true));
  }

  async createEmployee(employee: { name: string; isActive: boolean }): Promise<Employee> {
    const [newEmployee] = await db.insert(employees).values(employee).returning();
    return newEmployee;
  }

  async updateEmployee(id: number, updates: { isActive: boolean }): Promise<Employee> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(updates)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee;
  }


  async createTip(insertTip: InsertTip): Promise<Tip> {
    const { distributions, employeeIds, ...tipData } = insertTip;

    return await db.transaction(async (tx) => {
      // Parse the date string into year, month, day and create a UTC date
      // that preserves the local date selection
      const [year, month, day] = tipData.date.split('-').map(Number);
      const tipDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

      // Insert the tip
      const [tip] = await tx.insert(tips).values({
        date: tipDate,
        amount: tipData.amount.toString(),
        numEmployees: tipData.numEmployees.toString(),
        submittedById: tipData.submittedById
      }).returning();

      // Create tip-employee relationships
      await Promise.all(
        distributions.map(dist =>
          tx.insert(tipEmployees).values({
            tipId: tip.id,
            employeeId: dist.employeeId,
            amount: dist.amount.toString()
          })
        )
      );

      return tip;
    });
  }

  async updateTip(id: number, insertTip: InsertTip): Promise<Tip> {
    const { distributions, employeeIds, ...tipData } = insertTip;

    return await db.transaction(async (tx) => {
      // Parse the date string into year, month, day and create a UTC date
      // that preserves the local date selection
      const [year, month, day] = tipData.date.split('-').map(Number);
      const tipDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

      // Update the tip
      const [tip] = await tx
        .update(tips)
        .set({
          date: tipDate,
          amount: tipData.amount.toString(),
          numEmployees: tipData.numEmployees.toString(),
          submittedById: tipData.submittedById
        })
        .where(eq(tips.id, id))
        .returning();

      // Delete existing tip-employee relationships
      await tx.delete(tipEmployees).where(eq(tipEmployees.tipId, id));

      // Create new tip-employee relationships
      await Promise.all(
        distributions.map(dist =>
          tx.insert(tipEmployees).values({
            tipId: tip.id,
            employeeId: dist.employeeId,
            amount: dist.amount.toString()
          })
        )
      );

      return tip;
    });
  }

  async getTipsByDate(date: Date): Promise<Tip[]> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return db.select().from(tips)
      .where(and(gte(tips.date, startOfDay), lte(tips.date, endOfDay)));
  }

  async getAllTips(): Promise<Tip[]> {
    return db.select().from(tips);
  }

  async getTipEmployees(tipId: number): Promise<(Employee & { amount: number })[]> {
    const results = await db
      .select({
        id: employees.id,
        name: employees.name,
        isActive: employees.isActive,
        amount: tipEmployees.amount,
      })
      .from(tipEmployees)
      .innerJoin(employees, eq(tipEmployees.employeeId, employees.id))
      .where(eq(tipEmployees.tipId, tipId));

    return results.map(r => ({
      ...r,
      amount: Number(r.amount)
    }));
  }

  // Till methods
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

  async deleteTip(id: number): Promise<void> {
    return await db.transaction(async (tx) => {
      // Delete tip-employee relationships first
      await tx.delete(tipEmployees).where(eq(tipEmployees.tipId, id));
      // Delete the tip
      await tx.delete(tips).where(eq(tips.id, id));
    });
  }
}

export const storage = new DatabaseStorage();