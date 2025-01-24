import { Request, Response } from "express";
import { supabase } from "../config/supabase";

// Existing function
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

// Existing function for test param
export const getTestParam = (req: Request, res: Response) => {
  const { param } = req.params;
  try {
    const parsedParam = JSON.parse(decodeURIComponent(param));
    res.json(parsedParam);
  } catch (error) {
    res.status(400).json({
      error: "Invalid JSON parameter",
      details: error instanceof Error ? error.message : "Parsing error",
    });
  }
};

// New function for POST route to look up by console-type and product-name
export const getPriceChartingDataByPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { consoleType, productName } = req.body;

  // Validate input
  if (!consoleType || !productName) {
    res.status(400).json({
      error: "Console type and product name are required",
    });
  }

  try {
    // Query Supabase for records matching the consoleType and productName
    const { data, error } = await supabase
      .from("priceChartingData")
      .select("*")
      .eq("console-name", consoleType) // Assuming column is named "console_name"
      .eq("product-name", productName) // Assuming column is named "product_name"
      .limit(1)
      .single(); // Use single to only get one record (if exists)

    if (error) throw error;

    // If no data is found, send 404 error
    if (!data) {
      res.status(404).json({
        error: "No matching data found",
      });
    }

    // Send the result as JSON
    res.json(data);
  } catch (error) {
    console.error("Error fetching price charting data:", error);
    res.status(500).json({
      error: "Failed to fetch price charting data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
