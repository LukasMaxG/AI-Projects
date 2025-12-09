import { GoogleGenAI } from "@google/genai";
import { WineData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Master Sommelier and Wine Investment Analyst.
Your task is to provide a detailed, deep-dive report on a specific wine.
You will receive either an image of a wine label or a text name of a wine.

You must identify the wine and perform deep research using Google Search to find:
1. Specifications (Grapes, ABV, Region).
2. Sensory profile (Color, Nose, Taste, Structure).
3. CRITICAL RECEPTION: Find specific scores from major critics (Robert Parker, Wine Spectator, James Suckling, Vinous, etc.) for this vintage.
4. TERROIR & VINIFICATION: Soil types, oak aging regimen, and farming practices (Organic, Biodynamic, etc.).
5. VINTAGE ANALYSIS: Compare the requested vintage score against 2-3 other recent or famous vintages of the same wine.
6. INVESTMENT & AGING: Determine the drinking window, peak years, and estimate future value.
7. SERVICE: Pairing, temperature, decanting, and GLASSWARE recommendation.
8. ONLINE PRESENCE: Find the official winery website and a direct URL to an image of the bottle or winery logo.
9. HERITAGE & TRIVIA: Research the winery's origins/history, identifying the "Best Vintages" (legendary years) for this wine, and any interesting fun facts.

You must return the response in strict JSON format. 
Do not wrap the JSON in markdown code blocks. Just return the raw JSON string.

The JSON object must match this structure exactly:
{
  "name": "Full Wine Name",
  "vintage": "Year or NV",
  "country": "Country of origin",
  "region": "Region",
  "subRegion": "Sub-region or Appellation",
  "varietals": ["List", "of", "Grapes"],
  "type": "Red, White, Rose, Sparkling, etc.",
  "abv": "Alcohol By Volume",
  "color": "Visual description",
  "nose": "Aromatic profile",
  "taste": "Palate profile",
  "closure": "Cork, Screwcap, etc.",
  "size": "Bottle size",
  "marketPrice": "Current market price range (e.g. $25 - $35)",
  "wineryInfo": "Origins and history of the winery.",
  "websiteUrl": "https://www.example-winery.com",
  "onlineImage": "https://example.com/bottle-shot.jpg",
  "awards": ["List", "of", "awards"],
  "funFacts": ["Interesting fact 1", "Interesting fact 2"],
  "bestVintages": ["2010", "2015", "2016"],
  "criticScores": [
    { "critic": "Robert Parker", "score": "96" },
    { "critic": "James Suckling", "score": "95" }
  ],
  "terroir": {
    "soil": ["Soil Type 1", "Soil Type 2"],
    "oak": "Oak aging details (e.g. 18 months in 50% new French Oak)",
    "farming": ["Organic", "Sustainable", "Hand-harvested"]
  },
  "styleProfile": {
    "body": "Light/Medium/Full",
    "acidity": "Low/Medium/High",
    "tannins": "Low/Medium/High/Silky/etc"
  },
  "vintageComparison": [
    { "year": "2018", "score": 95, "notes": "Excellent" },
    { "year": "2019", "score": 92, "notes": "Average" }
    // Include the requested vintage + 2 others
  ],
  "aging": {
    "drinkFrom": "YYYY",
    "drinkUntil": "YYYY",
    "peakYears": "YYYY-YYYY",
    "investmentPotential": "High/Medium/Low",
    "estimatedValue5Years": "Projected price in 5 years"
  },
  "pairing": {
    "foods": ["Dish 1", "Dish 2"],
    "temperature": "Serving temp (e.g. 16-18°C)",
    "decanting": "Decanting advice (e.g. 30 mins)",
    "glassware": "Recommended glass shape (e.g. Bordeaux, Burgundy, Flute)"
  }
}
`;

const parseResponse = (text: string, groundingMetadata: any): WineData => {
  let jsonString = text || "";
  jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');

  try {
    const data: WineData = JSON.parse(jsonString);
    
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
            text: "Analyze this wine label. Provide a comprehensive sommelier report including terroir, critic scores, vintage comparison, aging potential, investment analysis, winery origins, best vintages, and fun facts."
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
            text: `Research the wine named "${wineName}". Provide a comprehensive sommelier report including terroir, critic scores, vintage comparison, aging potential, investment analysis, winery origins, best vintages, and fun facts.`
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