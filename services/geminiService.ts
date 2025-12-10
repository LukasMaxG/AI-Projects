import { GoogleGenAI } from "@google/genai";
import { WineData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Master Sommelier.
Provide a fast, accurate report on the requested wine (image or name).
Research using Google Search to find accurate, real-time data.

CRITICAL: Return ONLY raw JSON. No Markdown. No code blocks.

TASKS:
1. IDENTIFY: Wine, vintage, grapes, ABV, region.
2. SENSORY: Color, Nose, Taste.
3. CRITICS: Find scores (Parker, Spectator, Suckling).
4. TERROIR: Soil, oak, farming.
5. VINTAGE: Compare requested vintage vs 2-3 others.
6. INVEST: Drinking window, peak, future value.
7. SERVICE: Pairing, temp, decant, GLASSWARE.
8. ONLINE: Find official winery URL.
9. IMAGE: Search for a list of 8-10 valid, publicly accessible URLs for images.
   - Candidates: Bottle shot (highest priority), Label shot, Winery Estate, Winery Logo.
   - SOURCES: Official Winery Website, winelibrary.com, totalwine.com, winemag.com (Wine Enthusiast), wikipedia.org, vivino.com, wine.com, cellartracker.com, decanter.com, winespectator.com.
   - CRITICAL: Ensure URLs are direct image links ending in .jpg, .png, or .webp. Do not return HTML pages or base64.
10. HISTORY: Winery origins, fun facts.
    LEGENDARY VINTAGES: Identify 2-3 best years. Return year, detailed notes on weather/quality/context, and key awards/scores for that specific vintage.

JSON STRUCTURE:
{
  "name": "Full Wine Name",
  "vintage": "Year",
  "country": "Country",
  "region": "Region",
  "subRegion": "Appellation",
  "varietals": ["Grape 1", "Grape 2"],
  "type": "Red/White/etc",
  "abv": "XX%",
  "color": "Visual",
  "nose": "Aromas",
  "taste": "Palate",
  "closure": "Cork/Screwcap",
  "size": "750ml",
  "marketPrice": "$XX - $XX",
  "wineryInfo": "History...",
  "websiteUrl": "https://...",
  "onlineImage": "https://... (Primary)",
  "imageCandidates": ["https://... (Bottle)", "https://... (Label)", "https://... (Winery)"],
  "awards": ["Award 1"],
  "funFacts": ["Fact 1"],
  "bestVintages": [
    { "year": "2016", "notes": "Exceptional weather conditions...", "awards": ["97pts WS", "Gold Medal"] }
  ],
  "criticScores": [{ "critic": "RP", "score": "96" }],
  "terroir": {
    "soil": ["Soil"],
    "oak": "Details",
    "farming": ["Organic"]
  },
  "styleProfile": {
    "body": "Full",
    "acidity": "High",
    "tannins": "Silky"
  },
  "vintageComparison": [
    { "year": "2018", "score": 95, "notes": "Great" }
  ],
  "aging": {
    "drinkFrom": "YYYY",
    "drinkUntil": "YYYY",
    "peakYears": "YYYY-YYYY",
    "investmentPotential": "High",
    "estimatedValue5Years": "$XX"
  },
  "pairing": {
    "foods": ["Dish"],
    "temperature": "16C",
    "decanting": "30m",
    "glassware": "Bordeaux"
  }
}
`;

const parseResponse = (text: string, groundingMetadata: any): WineData => {
  let jsonString = text || "";
  jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');

  try {
    const data: WineData = JSON.parse(jsonString);
    
    // Add timestamp and ID
    data.timestamp = Date.now();
    data.id = `${data.name}-${data.vintage}-${Date.now()}`;

    // Smart Image Handling: Ensure onlineImage is populated
    if (!data.onlineImage && data.imageCandidates && data.imageCandidates.length > 0) {
      data.onlineImage = data.imageCandidates[0];
    }
    // Ensure candidates array exists if only onlineImage was found
    if (!data.imageCandidates && data.onlineImage) {
      data.imageCandidates = [data.onlineImage];
    }

    // Extract grounding sources
    const sources: string[] = [];
    const chunks = groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push(chunk.web.title || chunk.web.uri);
          }
      });
    }
    
    return { ...data, sources: [...new Set(sources)] };
  } catch (parseError) {
    console.error("JSON Parse Error", parseError, jsonString);
    throw new Error("Failed to parse wine data. Please try again.");
  }
};

export const analyzeWineLabel = async (base64Image: string, mimeType: string): Promise<WineData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Analyze wine label. Return strict JSON. Fast & Accurate."
          },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    return parseResponse(response.text || "", response.candidates?.[0]?.groundingMetadata);
  } catch (error) {
    console.error("Gemini Image API Error:", error);
    throw error;
  }
};

export const searchWineByName = async (wineName: string): Promise<WineData> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            text: `Research wine: "${wineName}". Return strict JSON. Fast & Accurate.`
          },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    return parseResponse(response.text || "", response.candidates?.[0]?.groundingMetadata);
  } catch (error) {
    console.error("Gemini Text API Error:", error);
    throw error;
  }
};