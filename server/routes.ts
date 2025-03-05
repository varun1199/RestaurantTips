import type { Express, Request, Response } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTipSchema, insertTillSchema, insertUserSchema, registrationSchema } from "@shared/schema";
import session from "express-session";
import { nanoid } from "nanoid";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express) {
  // Session middleware
  app.use(
    session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" }
    })
  );

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Employee routes
  app.get("/api/employees", requireAuth, async (_req, res) => {
    const employees = await storage.getActiveEmployees();
    res.json(employees);
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registrationSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const employeeId = nanoid(10);
      const user = await storage.createUser({
        username: userData.username,
        password: userData.password,
        isAdmin: false,
        employeeId,
        email: userData.email
      });

      req.session.userId = user.id;
      res.status(201).json({ 
        user: { 
          ...user,
          password: undefined 
        },
        message: "Registration successful" 
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid input" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ user: { ...user, password: undefined } });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  // Tips routes
  app.post("/api/tips", requireAuth, async (req, res) => {
    const tipData = insertTipSchema.parse(req.body);
    const tip = await storage.createTip({
      ...tipData,
      submittedById: req.session.userId!
    });
    res.json(tip);
  });

  app.get("/api/tips", requireAuth, async (req, res) => {
    const tips = await storage.getAllTips();
    const tipsWithEmployees = await Promise.all(
      tips.map(async (tip) => ({
        ...tip,
        employees: await storage.getTipEmployees(tip.id)
      }))
    );
    res.json(tipsWithEmployees);
  });

  // Till routes
  app.post("/api/tills", requireAuth, async (req, res) => {
    const tillData = insertTillSchema.parse(req.body);
    const till = await storage.createTill({
      ...tillData,
      submittedById: req.session.userId!
    });
    res.json(till);
  });

  app.get("/api/tills/today", requireAuth, async (req, res) => {
    const tills = await storage.getTillsByDate(new Date());
    res.json(tills);
  });

  const httpServer = createServer(app);
  return httpServer;
}