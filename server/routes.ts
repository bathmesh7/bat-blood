import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDonationSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Session setup
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "lifeshare-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
      cookie: {
        maxAge: 86400000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Authentication middleware
  const authenticate = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Successfully logged out" });
    });
  });

  // Get current user
  app.get("/api/auth/me", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId as number);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get donations by user ID
  app.get("/api/donations", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId;
      const donations = await storage.getDonationsByUserId(userId as number);
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add a new donation
  app.post("/api/donations", authenticate, async (req, res) => {
    try {
      const userId = req.session.userId;
      const donationData = insertDonationSchema.parse({
        ...req.body,
        userId
      });
      
      const donation = await storage.createDonation(donationData);
      
      // Update user's last donation date
      const user = await storage.getUser(userId as number);
      if (user) {
        const updatedUser = {
          ...user,
          lastDonation: donationData.donationDate
        };
        await storage.createUser(updatedUser);
      }
      
      res.status(201).json(donation);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  // Get latest donors i think so
  app.get("/api/donors/latest", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const donors = await storage.getLatestDonors(limit);
      
      // Remove passwords from response many not work i think
      const donorsWithoutPasswords = donors.map(donor => {
        const { password, ...donorWithoutPassword } = donor;
        return donorWithoutPassword;
      });
      
      res.json(donorsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all donors it is working
  app.get("/api/donors", async (req, res) => {
    try {
      const donors = await storage.getAllUsers();
      
      // Filter by blood group if provided
      const bloodGroup = req.query.bloodGroup as string;
      const location = req.query.location as string;
      const searchTerm = req.query.search as string;
      
      let filteredDonors = donors;
      
      if (bloodGroup) {
        filteredDonors = filteredDonors.filter(donor => 
          donor.bloodGroup.toLowerCase() === bloodGroup.toLowerCase()
        );
      }
      
      if (location) {
        filteredDonors = filteredDonors.filter(donor => 
          donor.city.toLowerCase().includes(location.toLowerCase()) || 
          donor.state.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      if (searchTerm) {
        filteredDonors = filteredDonors.filter(donor => 
          donor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          donor.state.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Remove passwords from response not yeat test pls test it 
      const donorsWithoutPasswords = filteredDonors.map(donor => {
        const { password, ...donorWithoutPassword } = donor;
        return donorWithoutPassword;
      });
      
      res.json(donorsWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
