import { User, InsertUser, Tip, InsertTip, Till, InsertTill } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tips: Map<number, Tip>;
  private tills: Map<number, Till>;
  private currentIds: { users: number; tips: number; tills: number };

  constructor() {
    this.users = new Map();
    this.tips = new Map();
    this.tills = new Map();
    this.currentIds = { users: 1, tips: 1, tills: 1 };

    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // In production, this should be hashed
      isAdmin: true
    } as InsertUser);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { id, username: insertUser.username, password: insertUser.password, isAdmin: insertUser.isAdmin ?? false };
    this.users.set(id, user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createTip(insertTip: InsertTip): Promise<Tip> {
    const id = this.currentIds.tips++;
    const tip: Tip = {
      id,
      date: new Date(),
      submittedById: insertTip.submittedById,
      amount: insertTip.amount,
      numEmployees: insertTip.numEmployees
    };
    this.tips.set(id, tip);
    return tip;
  }

  async getTipsByDate(date: Date): Promise<Tip[]> {
    return Array.from(this.tips.values()).filter(
      (tip) => tip.date.toDateString() === date.toDateString()
    );
  }

  async getAllTips(): Promise<Tip[]> {
    return Array.from(this.tips.values());
  }

  async createTill(insertTill: InsertTill): Promise<Till> {
    const id = this.currentIds.tills++;
    const till: Till = {
      id,
      date: new Date(),
      submittedById: insertTill.submittedById,
      pennies: insertTill.pennies,
      nickels: insertTill.nickels,
      dimes: insertTill.dimes,
      quarters: insertTill.quarters,
      ones: insertTill.ones,
      fives: insertTill.fives,
      tens: insertTill.tens,
      twenties: insertTill.twenties,
      fifties: insertTill.fifties,
      hundreds: insertTill.hundreds,
      total: insertTill.total
    };
    this.tills.set(id, till);
    return till;
  }

  async getTillsByDate(date: Date): Promise<Till[]> {
    return Array.from(this.tills.values()).filter(
      (till) => till.date.toDateString() === date.toDateString()
    );
  }
}

export const storage = new MemStorage();