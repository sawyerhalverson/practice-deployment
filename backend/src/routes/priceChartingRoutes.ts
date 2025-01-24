import { Router } from "express";
import { getPriceChartingData, getTestParam, getPriceChartingDataByPost } from "../controllers/priceChartingController";

const router = Router();

// GET routes
router.get("/", getPriceChartingData);
router.get("/test/:param", getTestParam);

// New POST route
router.post("/lookup", getPriceChartingDataByPost);

export default router;
