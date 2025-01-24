import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(
  cors({
    origin: "https://practice-deployment-production.up.railway.app",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript + Node.js backend 🚀");
});

// Endpoint to fetch first 2 rows from priceChartingData
app.get("/api/price-charting", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("priceChartingData")
      .select("*")
      .limit(2);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching price charting data:", error);
    res.status(500).json({ 
      error: "Failed to fetch price charting data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Generic data endpoint
app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

export default app;