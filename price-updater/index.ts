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

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const CSV_URL = process.env.CSV_URL!;
const CHUNK_SIZE = 1000;

async function processChunk(csvText: string, startIndex: number) {
 const lines = csvText.split('\n');
 const chunk = Papa.parse<PriceRecord>(
   lines.slice(startIndex, startIndex + CHUNK_SIZE).join('\n'), 
   { header: true }
 ).data;
 
 console.log(`Processing ${chunk.length} records from index ${startIndex}`);
 
 if (chunk.length === 0) return;

 const { data: existingData } = await supabase
   .from("priceChartingData")
   .select("Title, Console, Loose_Price, CIB_Price, New_Price")
   .limit(CHUNK_SIZE);

 const updates = chunk.filter(newRecord => {
   const existingRecord = existingData?.find(e => 
     e.Title === newRecord.Title && e.Console === newRecord.Console
   );
   return !existingRecord || 
     existingRecord.Loose_Price !== newRecord.Loose_Price ||
     existingRecord.CIB_Price !== newRecord.CIB_Price ||
     existingRecord.New_Price !== newRecord.New_Price;
 });

 if (updates.length > 0) {
   console.log(`Updating ${updates.length} records`);
   await supabase.from("priceChartingData").upsert(updates);
 }
}

async function updatePrices() {
 try {
   console.log("Fetching CSV...");
   const response = await fetch(CSV_URL);
   const csvText = await response.text();
   const totalLines = csvText.split('\n').length;
   console.log(`Total lines in CSV: ${totalLines}`);

   for (let i = 1; i < totalLines; i += CHUNK_SIZE) {
     await processChunk(csvText, i);
     await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
   }
   console.log("Update complete!");
 } catch (error) {
   console.error("Update failed:", error);
 }
}

cron.schedule("0 1 * * *", updatePrices);
updatePrices();