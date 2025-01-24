import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./config/supabase";
import priceChartingRoutes from "./routes/priceChartingRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

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

app.use("/api/price-charting", priceChartingRoutes);

app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});