import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

const app = express();

// 1. Security Middleware
app.use(helmet());
app.use(cookieParser());

// 2. Body Parsing Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// 3. CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// 4. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again later"
});
app.use("/api", limiter);

// 5. Compression
app.use(compression());

// 6. Enhanced Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  res.on("finish", () => {
    const { statusCode } = res;
    const duration = Date.now() - start;
    const contentLength = res.get("Content-Length") || 0;
    
    log(`${method} ${originalUrl} ${statusCode} ${duration}ms ${contentLength}b - ${ip}`);
    
    if (originalUrl.startsWith("/api") && process.env.NODE_ENV === "development") {
      console.log("Request Body:", req.body);
      console.log("Response:", res.locals.responseData);
    }
  });

  next();
});

// 7. Health Check Endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy" });
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // 8. Error Handling Middleware
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      
      if (status >= 500) {
        log(`Server Error: ${status} - ${message} - ${err.stack}`, "error");
      }
      
      res.status(status).json({
        status: "error",
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
      });
    });

    // 9. Environment-based Setup
    const isDev = process.env.NODE_ENV === "development";
    
    if (isDev) {
      await setupVite(app, server);
      log("Vite development middleware enabled");
    } else {
      serveStatic(app);
      log("Serving static files from production build");
    }

    // 10. Server Startup
    const port = Number(process.env.PORT) || 5000;
    const host = process.env.HOST || "127.0.0.1";

    server.listen(port, host, () => {
      log(`Server running in ${isDev ? "development" : "production"} mode`);
      log(`API: http://${host}:${port}/api`);
      log(`Client: http://${host}:${port}`);
    }).on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        log(`Port ${port} in use, retrying...`, "warn");
        const altPort = port + 1;
        server.listen(altPort, host, () => {
          log(`Server running on alternative port ${altPort}`);
        });
      } else {
        log(`Server startup error: ${err.message}`, "error");
        process.exit(1);
      }
    });

  } catch (err) {
    log(`Server initialization failed: ${err}`, "error");
    process.exit(1);
  }
})();