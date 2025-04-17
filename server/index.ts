import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 1. Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "plausible.io", "www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://plausible.io", "https://www.google-analytics.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// 2. HTTPS Redirection Middleware (when not in development)
app.use((req, res, next) => {
  // Check if we're on Replit or another hosting platform where HTTPS is available
  // Skip for local development, which typically uses HTTP
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isSecure && process.env.NODE_ENV === 'production') {
    // Redirect to HTTPS
    return res.redirect('https://' + req.headers.host + req.url);
  }
  
  // Add HSTS header when on HTTPS
  if (isSecure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// 3. Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  message: { message: "Too many requests, please try again later." }
});

// Apply rate limiting to API routes
app.use("/api/", apiLimiter);

// Enhanced rate limiting for computationally expensive endpoints
const sitemapLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  standardHeaders: true,
  message: { message: "Too many sitemap generation requests, please try again later." }
});

// Apply stricter rate limiting to sitemap endpoint
app.use("/api/sitemap", sitemapLimiter);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // 4. Improved error handling for production vs development
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';
    
    // Always log errors server-side
    console.error('[Error]:', {
      status,
      message: err.message,
      stack: isDev ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Sanitize error response
    const clientError = {
      status,
      message: status >= 500 
        ? 'Internal Server Error'
        : err.message || 'An error occurred',
      ...(isDev && { stack: err.stack })
    };
    
    res.status(status).json(clientError);
});

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
