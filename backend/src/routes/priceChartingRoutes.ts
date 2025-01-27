import { Router } from "express";
import {
  getPriceChartingData,
  getPriceChartingDataBatch,
  getPriceChartingDataByPost,
} from "../controllers/priceChartingController";

const router = Router();

// GET routes
router.get("/", getPriceChartingData);

// New POST route
router.post("/lookup", getPriceChartingDataByPost);
router.post("/batch", getPriceChartingDataBatch);

export default router;
