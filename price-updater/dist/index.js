import cron from "node-cron";
import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
async function updatePrices() {
    try {
        // Non-null assertions after checking environment variables
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_KEY = process.env.SUPABASE_KEY;
        const CSV_URL = process.env.CSV_URL;
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Fetching CSV data...");
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        console.log("CSV Data received, parsing...");
        const parseResult = Papa.parse(csvText, { header: true });
        const newData = parseResult.data;
        console.log(`Parsed ${newData.length} records from CSV`);
        console.log("Fetching existing data from Supabase...");
        const { data: existingData } = await supabase
            .from("priceChartingData")
            .select("Title, Console, Loose_Price, CIB_Price, New_Price");
        console.log(`Found ${existingData?.length} existing records`);
        console.log("Comparing records to find updates...");
        const updates = newData.filter((newRecord) => {
            const existingRecord = existingData?.find((e) => e.Title === newRecord.Title && e.Console === newRecord.Console);
            return (!existingRecord ||
                existingRecord.Loose_Price !== Number(newRecord.Loose_Price) ||
                existingRecord.CIB_Price !== Number(newRecord.CIB_Price) ||
                existingRecord.New_Price !== Number(newRecord.New_Price));
        });
        console.log(`Found ${updates.length} records that need updating`);
        console.log("Processing updates in batches...");
        for (let i = 0; i < updates.length; i += 1000) {
            const batch = updates.slice(i, i + 1000);
            console.log(`Updating batch ${i / 1000 + 1}/${Math.ceil(updates.length / 1000)}`);
            await supabase.from("priceChartingData").upsert(batch);
        }
        console.log("Update complete!");
    }
    catch (error) {
        console.error("Update failed:", error);
    }
}
cron.schedule("0 1 * * *", updatePrices);
updatePrices();
