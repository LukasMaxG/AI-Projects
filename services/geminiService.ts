import { GoogleGenAI } from "@google/genai";
import { WineData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
     Provide a brief 1-2 sentence explanation of value potential (e.g., "Likely to appreciate due to scarcity...").
7. SERVICE: Pairing, temp, decant, GLASSWARE.
8. ONLINE: Find official winery URL.
9. IMAGES: Find 4-6 valid, publicly accessible URLs.
   - Candidates: Bottle shot (PRIORITY: Search https://winelibrary.com/wines/), Winery Estate, Vineyard.
   - SOURCES: https://winelibrary.com/wines/ (Top Priority), Official Site, totalwine.com, vivino.com, wine.com.
   - CRITICAL: Direct image links (.jpg, .png).
10. HISTORY: Origins, fun facts.
    LEGENDARY VINTAGES: Identify 2-3 best years with notes/awards.
11. PIVOT: Recommend 2 similar wines (1 similar style/price, 1 hidden gem/value).
12. EDUCATION:
    - CLIMATE: Brief type (e.g. "Mediterranean").
    - GEOGRAPHY: Key feature (e.g. "Volcanic soil").
    - VIBE: 1-sentence analogy (e.g. "Think of this like the 'Texas of Italy'").
    - LABEL DECODER: Define 2-3 technical terms on label (Riserva, DOCG, Sur Lie, etc).
    - PRONUNCIATION: Native spelling + Phonetic (e.g. Gewürztraminer -> Guh-VURTZ-tra-mee-ner).

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
  "imageCandidates": ["https://...", "https://..."],
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
    { "grape": "Cabernet Sauvignon", "percentage": 85 },
    { "grape": "Merlot", "percentage": 15 }
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
    { "name": "Wine Name", "reason": "Similar power and structure..." }
  ],
  "education": {
    "climate": "Mediterranean",
    "geography": "Galestro Soil",
    "vibe": "The 'Texas of Italy' - big and bold.",
    "labelTerms": [
      { "term": "Riserva", "definition": "Aged for at least 2 years..." }
    ],
    "pronunciation": {
      "native": "Chianti Classico",
      "phonetic": "Key-AHN-tee CLAH-see-ko"
    }
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
      model: 'gemini-2.5-flash',
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
      model: 'gemini-2.5-flash',
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