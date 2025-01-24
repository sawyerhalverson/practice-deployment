// src/routes/priceChartingRoutes.ts
import { Router } from "express";
import { getPriceChartingData } from "../controllers/priceChartingController";

const router = Router();

router.get("/", getPriceChartingData);

export default router;
