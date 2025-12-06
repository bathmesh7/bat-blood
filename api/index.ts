import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

const app = express();

// Security Middleware
app.use(helmet());
app.use(cookieParser());

// Body Parsing Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later"
});
app.use("/api", limiter);

// Compression
app.use(compression());

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Register API routes
(async () => {
  try {
    await registerRoutes(app);
    
    // Error Handling Middleware
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      
      res.status(status).json({
        status: "error",
        message
      });
    });
  } catch (err) {
    console.error("Server initialization failed:", err);
  }
})();

export default app;
