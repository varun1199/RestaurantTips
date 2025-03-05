import { users, tips, tills, type User, type InsertUser, type Tip, type InsertTip, type Till, type InsertTill } from "@shared/schema";
import { db } from "./db";
import { eq, gte, lte, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;

  // Tip operations
  createTip(tip: InsertTip): Promise<Tip>;
  getTipsByDate(date: Date): Promise<Tip[]>;
  getAllTips(): Promise<Tip[]>;

  // Till operations
  createTill(till: InsertTill): Promise<Till>;
  getTillsByDate(date: Date): Promise<Till[]>;
}

export class DatabaseStorage implements IStorage {
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

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const [tip] = await db.insert(tips).values(insertTip).returning();
    return tip;
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