import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { LevenshteinDistance } from "../utils/utils";

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

export const getPriceChartingDataByPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const consoleType = req.body.consoleType?.toLowerCase();
  const productName = req.body.productName?.toLowerCase();
  const SIMILARITY_THRESHOLD = 5;

  console.log("Received request for:", { consoleType, productName });

  if (!consoleType || !productName) {
    res.status(400).json({
      error: "Console type and product name are required",
    });
    return;
  }

  try {
    const { data: allPossibleMatches, error: fuzzyError } = await supabase
      .from("priceChartingData")
      .select("*")
      .ilike("console-name", consoleType)
      .ilike("product-name", `%${productName.replace(/[^a-zA-Z0-9]/g, "%")}%`)
      .limit(50);

    console.log("Found possible matches:", allPossibleMatches?.length);

    if (fuzzyError) throw fuzzyError;

    if (!allPossibleMatches || allPossibleMatches.length === 0) {
      console.log("No matches found for console:", consoleType);
      res.status(404).json({
        error: "No matching data found",
      });
      return;
    }

    let bestMatch = null;
    let bestDistance = Infinity;

    const searchName = productName.replace(/[^a-zA-Z0-9\s]/g, "").trim();

    for (const match of allPossibleMatches) {
      const matchName = match["product-name"]
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim();

      const distance = LevenshteinDistance(searchName, matchName);

      console.log(
        `Comparing "${searchName}" with "${matchName}" - Distance: ${distance}`
      );

      if (distance <= SIMILARITY_THRESHOLD && distance < bestDistance) {
        bestDistance = distance;
        bestMatch = {
          ...match,
          matchConfidence: Math.max(0, 100 - distance * 20),
          searchDistance: distance,
        };
      }
    }

    if (bestMatch) {
      console.log("Found best match:", bestMatch);
      res.json(bestMatch);
    } else {
      console.log("No good matches found within threshold");
      res.status(404).json({
        error: "No matching data found",
        suggestion: "Try using the exact game title",
      });
    }
  } catch (error) {
    console.error("Error fetching price charting data:", error);
    res.status(500).json({
      error: "Failed to fetch price charting data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
interface GameQuery {
  consoleType: string;
  productName: string;
}

interface PriceChartingData {
  id: number;
  "console-name": string;
  "product-name": string;
  "loose-price": string;
  "cib-price": string;
  "sales-volume": number;
  [key: string]: any; // for other potential fields
}

interface GameMatch extends PriceChartingData {
  matchConfidence: number;
  searchDistance: number;
}

type QueryResultSuccess = {
  query: GameQuery;
  result: GameMatch;
  error: null;
};

type QueryResultError = {
  query: GameQuery;
  result: null;
  error: string;
};

type QueryResult = QueryResultSuccess | QueryResultError;

function isQueryResultSuccess(
  result: QueryResult
): result is QueryResultSuccess {
  return result.result !== null;
}
export const getPriceChartingDataBatch = async (
  req: Request,
  res: Response
): Promise<void> => {
  const queries: [string, string][] = req.body;

  if (!Array.isArray(queries) || queries.length === 0) {
    res.status(400).json({
      error: "Request body must be an array of [console, game] pairs",
    });
    return;
  }

  try {
    const formattedQueries: GameQuery[] = queries.map(([consoleType, productName]) => ({
      consoleType: consoleType.toLowerCase(),
      productName: productName.toLowerCase(),
    }));

    const results = await Promise.all(
      formattedQueries.map(async ({ consoleType, productName }) => {
        try {
          const { data: matches, error } = await supabase
            .from("priceChartingData")
            .select("*")
            .ilike("console-name", consoleType)
            .ilike("product-name", `%${productName.replace(/[^a-zA-Z0-9]/g, "%")}%`)
            .limit(50);

          if (error) throw error;

          if (!matches || matches.length === 0) {
            return {
              query: { consoleType, productName },
              result: null,
              error: "No matches found",
            } as QueryResultError;
          }

          const searchName = productName
            .replace(/[^a-zA-Z0-9\s]/g, "")
            .trim();

          let bestMatch: GameMatch | null = null;
          let bestDistance = Infinity;

          for (const match of matches) {
            const matchName = match["product-name"]
              .toLowerCase()
              .replace(/[^a-zA-Z0-9\s]/g, "")
              .trim();

            const distance = LevenshteinDistance(searchName, matchName);

            if (distance <= 5 && distance < bestDistance) {
              bestDistance = distance;
              bestMatch = {
                ...match,
                matchConfidence: Math.max(0, 100 - distance * 20),
                searchDistance: distance,
              };
            }
          }

          if (bestMatch) {
            return {
              query: { consoleType, productName },
              result: bestMatch,
              error: null,
            } as QueryResultSuccess;
          }

          return {
            query: { consoleType, productName },
            result: null,
            error: "No close matches found",
          } as QueryResultError;

        } catch (error) {
          return {
            query: { consoleType, productName },
            result: null,
            error: error instanceof Error ? error.message : "Unknown error",
          } as QueryResultError;
        }
      })
    );

    // Separate successful and failed results
    const successfulResults = results.filter(isQueryResultSuccess);
    const failedResults = results.filter((r): r is QueryResultError => !isQueryResultSuccess(r));
    
    const validResults = successfulResults.map(r => r.result);

    if (validResults.length === 0) {
      res.json({
        summary: {
          "total-cib-price": "$0.00",
          "avg-cib-price": "$0.00",
          "total-loose-price": "$0.00",
          "avg-loose-price": "$0.00",
        },
        games: [],
        not_found: failedResults.map(r => ({
          console: r.query.consoleType,
          game: r.query.productName,
          error: r.error
        }))
      });
      return;
    }

    const summary = {
      "total-cib-price": validResults.reduce(
        (sum, game) => sum + parseFloat(game["cib-price"].replace(/[$,]/g, "")),
        0
      ),
      "avg-cib-price":
        validResults.reduce(
          (sum, game) => sum + parseFloat(game["cib-price"].replace(/[$,]/g, "")),
          0
        ) / validResults.length,
      "total-loose-price": validResults.reduce(
        (sum, game) => sum + parseFloat(game["loose-price"].replace(/[$,]/g, "")),
        0
      ),
      "avg-loose-price":
        validResults.reduce(
          (sum, game) => sum + parseFloat(game["loose-price"].replace(/[$,]/g, "")),
          0
        ) / validResults.length,
    };

    // Sort results by CIB price
    const sortedResults = [...validResults].sort(
      (a, b) =>
        parseFloat(b["cib-price"].replace(/[$,]/g, "")) -
        parseFloat(a["cib-price"].replace(/[$,]/g, ""))
    );

    res.json({
      summary: {
        "total-cib-price": `$${summary["total-cib-price"].toFixed(2)}`,
        "avg-cib-price": `$${summary["avg-cib-price"].toFixed(2)}`,
        "total-loose-price": `$${summary["total-loose-price"].toFixed(2)}`,
        "avg-loose-price": `$${summary["avg-loose-price"].toFixed(2)}`,
      },
      games: sortedResults.map((game) => ({
        "console-name": game["console-name"],
        "product-name": game["product-name"],
        "cib-price": game["cib-price"],
        "loose-price": game["loose-price"],
        "sales-volume": game["sales-volume"],
      })),
      not_found: failedResults.map(r => ({
        console: r.query.consoleType,
        game: r.query.productName,
        error: r.error
      }))
    });
  } catch (error) {
    console.error("Error processing batch request:", error);
    res.status(500).json({
      error: "Failed to process batch request",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};