import type { Express, Request, Response } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTipSchema, insertTillSchema, insertUserSchema } from "@shared/schema";
import session from "express-session";

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

  // Auth routes
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
    res.json(tips);
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
