
import { GoogleGenAI, Type } from "@google/genai";
import { WineData, WineMatch } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Master Sommelier.
Provide a fast, accurate report on the requested wine.
Research using Google Search to find accurate, real-time data.

CRITICAL: Return ONLY raw JSON. No Markdown.

TASKS:
1. IDENTIFY: Wine, vintage, grapes, ABV, region.
2. SENSORY: Color, Nose, Taste.
3. CRITICS: Scores (Parker, Spectator, etc).
4. TERROIR: Soil, oak, farming. 
   - ESTIMATE BLEND: % of each grape (must sum to 100%).
5. VINTAGE: Compare requested vintage vs 4 other recent vintages (total 5 years) to show quality trend.
6. INVEST: 
   - Drinking window (Start, Peak, End).
   - MARKET VALUE: Research Vivino/WineSearcher/CellarTracker for 5yr value prediction.
     Provide a brief 1-2 sentence explanation of value potential.
7. SERVICE: Pairing, temp, decant, GLASSWARE.
8. ONLINE: Find official winery URL.
9. IMAGES: Find 4-6 valid, publicly accessible URLs.
   - Sources: winelibrary.com, winery site, vivino.com, wine.com.
   - CRITICAL: Direct image links (.jpg, .png).
10. HISTORY: Origins, fun facts, legendary vintages.
11. PIVOT: Recommend 2 similar wines.
12. EDUCATION: Climate, geography, vibe analogy, label terms, pronunciation.

JSON STRUCTURE:
{
  "name": "Full Wine Name",
  "vintage": "Year",
  "country": "Country",
  "region": "Region",
  "subRegion": "Appellation",
  "varietals": ["Grape 1"],
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
  "onlineImage": "https://...",
  "imageCandidates": ["https://..."],
  "awards": ["Award 1"],
  "funFacts": ["Fact 1"],
  "bestVintages": [
    { "year": "2016", "notes": "Notes...", "awards": ["97pts"] }
  ],
  "criticScores": [{ "critic": "RP", "score": "96" }],
  "terroir": {
    "soil": ["Soil"],
    "oak": "Details",
    "farming": ["Organic"]
  },
  "grapeComposition": [
    { "grape": "Cabernet Sauvignon", "percentage": 100 }
  ],
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
    "estimatedValue5Years": "Detailed prediction text..."
  },
  "pairing": {
    "foods": ["Dish"],
    "temperature": "16C",
    "decanting": "30m",
    "glassware": "Bordeaux"
  },
  "recommendations": [
    { "name": "Wine Name", "reason": "Reason..." }
  ],
  "education": {
    "climate": "Mediterranean",
    "geography": "Galestro Soil",
    "vibe": "Analogy here.",
    "labelTerms": [
      { "term": "Riserva", "definition": "Definition..." }
    ],
    "pronunciation": {
      "native": "Name",
      "phonetic": "Phonetic"
    }
  }
}
`;

// Helper to handle cleaning and parsing the response
const parseResponse = (text: string, groundingMetadata: any): WineData => {
  let jsonString = text || "";
  // Remove markdown formatting if present
  jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');

  try {
    const data: WineData = JSON.parse(jsonString);
    data.timestamp = Date.now();
    data.id = `${data.name}-${data.vintage}-${Date.now()}`;

    // Ensure images are present
    if (!data.onlineImage && data.imageCandidates && data.imageCandidates.length > 0) {
      data.onlineImage = data.imageCandidates[0];
    }
    if (!data.imageCandidates && data.onlineImage) {
      data.imageCandidates = [data.onlineImage];
    }

    // Extract grounding sources as per guidelines
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

/**
 * FIX: Implemented analyzeWineLabel which was missing from exports.
 * Uses inlineData for image and googleSearch for grounding.
 */
export const analyzeWineLabel = async (base64: string, mimeType: string): Promise<WineData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: "Identify this wine label and provide a detailed report in JSON format." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });

  return parseResponse(response.text || "", response.candidates?.[0]?.groundingMetadata);
};

/**
 * FIX: Implemented searchWineByName which was missing from exports.
 * Uses text query with googleSearch grounding for up-to-date data.
 */
export const searchWineByName = async (query: string): Promise<WineData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Please provide a detailed report for the following wine: ${query}. Use JSON format.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }]
    }
  });

  return parseResponse(response.text || "", response.candidates?.[0]?.groundingMetadata);
};

/**
 * FIX: Completed truncated searchWineMatches function and ensured it returns a value.
 */
export const searchWineMatches = async (query: string): Promise<WineMatch[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for wines matching: "${query}". Provide a list of the 3-5 most likely matches as a JSON array of objects with 'name', 'vintage', and 'region'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              vintage: { type: Type.STRING },
              region: { type: Type.STRING },
            },
            required: ['name', 'vintage', 'region']
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Search matches failed", error);
    return [];
  }
};
