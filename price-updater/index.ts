import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

interface PriceRecord {
  Title: string;
  Console: string;
  Loose_Price: number;
  CIB_Price: number;
  New_Price: number;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);
const CSV_URL = process.env.CSV_URL!;
const CHUNK_SIZE = 5000;

async function processChunk(csvText: string, startIndex: number) {
  const chunk = Papa.parse<PriceRecord>(
    csvText
      .split("\n")
      .slice(startIndex, startIndex + CHUNK_SIZE)
      .join("\n"),
    { header: true }
  ).data;

  const { data: existingData } = await supabase
    .from("priceChartingData")
    .select("Title, Console, Loose_Price, CIB_Price, New_Price");

  const updates = chunk.filter((newRecord) => {
    const existingRecord = existingData?.find(
      (e) => e.Title === newRecord.Title && e.Console === newRecord.Console
    );
    return (
      !existingRecord ||
      existingRecord.Loose_Price !== newRecord.Loose_Price ||
      existingRecord.CIB_Price !== newRecord.CIB_Price ||
      existingRecord.New_Price !== newRecord.New_Price
    );
  });

  for (let i = 0; i < updates.length; i += 1000) {
    const batch = updates.slice(i, i + 1000);
    await supabase.from("priceChartingData").upsert(batch);
    console.log(
      `Processed batch ${i / 1000 + 1} of chunk starting at ${startIndex}`
    );
  }
}

async function updatePrices() {
  try {
    console.log("Fetching CSV...");
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    console.log("Processing CSV in chunks...");

    const lines = csvText.split("\n").length;
    for (let i = 0; i < lines; i += CHUNK_SIZE) {
      console.log(`Processing chunk starting at index ${i}`);
      await processChunk(csvText, i);
    }
    console.log("Update complete!");
  } catch (error) {
    console.error("Update failed:", error);
  }
}

cron.schedule("0 1 * * *", updatePrices);
updatePrices();
