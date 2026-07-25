import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import receiptRoutes from "./routes/receiptRoutes.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api", receiptRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Suppress Chrome DevTools 404/CSP error
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(204).end();
});

// Global error handler for multer and other errors
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err.message);

    if (err.message.includes("File too large")) {
      res.status(413).json({ error: "File too large. Maximum size is 10MB." });
      return;
    }

    if (err.message.includes("Invalid file type")) {
      res.status(415).json({ error: err.message });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
