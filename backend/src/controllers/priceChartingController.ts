// src/controllers/priceChartingController.ts
import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const getPriceChartingData = async (req: Request, res: Response) => {
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
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
