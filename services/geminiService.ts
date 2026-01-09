
import { GoogleGenAI, Type } from "@google/genai";
import { WineData, WineMatch } from "../types";

const SYSTEM_INSTRUCTION = `
You are an expert Master Sommelier.
Return a structured JSON report for the wine requested. 
Research using Google Search (Vivino/Wine-Searcher) to find real-time data.

CRITICAL: Return ONLY raw JSON. No Markdown.

FIELDS TO POPULATE:
1. IDENTIFY: Wine name, vintage, grapes, region.
2. SENSORY: Visual color, nose aromas, palate taste.
3. DATA: ABV, critic scores (e.g. RP95), market price range.
4. TERROIR: Soil, oak, farming. Estimate % grape blend (sum 100).
5. VINTAGE: Trend for 5 recent years (Year, Score, Note).
6. INVESTMENT: Drink window, 5yr value outlook.
7. SERVICE: Pairings, temp, decant time, glassware.
8. ONLINE: Winery URL, 4-6 valid direct image URLs (.jpg/.png).
9. EDUCATION: Pronunciation (native/phonetic), climate, geography, vibe.

JSON STRUCTURE:
{
  "name": "string",
  "vintage": "string",
  "country": "string",
  "region": "string",
  "subRegion": "string",
  "varietals": ["string"],
  "type": "string",
  "abv": "string",
  "color": "string",
  "nose": "string",
  "taste": "string",
  "closure": "string",
  "size": "string",
  "marketPrice": "string",
  "wineryInfo": "string",
  "websiteUrl": "string",
  "onlineImage": "string",
  "imageCandidates": ["string"],
  "awards": ["string"],
  "funFacts": ["string"],
  "bestVintages": [{ "year": "string", "notes": "string", "awards": ["string"] }],
  "criticScores": [{ "critic": "string", "score": "string" }],
  "terroir": { "soil": ["string"], "oak": "string", "farming": ["string"] },
  "grapeComposition": [{ "grape": "string", "percentage": number }],
  "styleProfile": { "body": "string", "acidity": "string", "tannins": "string" },
  "vintageComparison": [{ "year": "string", "score": number, "notes": "string" }],
  "aging": { "drinkFrom": "string", "drinkUntil": "string", "peakYears": "string", "investmentPotential": "string", "estimatedValue5Years": "string" },
  "pairing": { "foods": ["string"], "temperature": "string", "decanting": "string", "glassware": "string" },
  "recommendations": [{ "name": "string", "reason": "string" }],
  "education": { "climate": "string", "geography": "string", "vibe": "string", "labelTerms": [{ "term": "string", "definition": "string" }], "pronunciation": { "native": "string", "phonetic": "string" } }
}
`;

const parseResponse = (text: string, groundingMetadata: any): WineData => {
  try {
    const data: WineData = JSON.parse(text);
    data.timestamp = Date.now();
    data.id = `${data.name}-${data.vintage}-${Date.now()}`;

    if (!data.onlineImage && data.imageCandidates?.length) {
      data.onlineImage = data.imageCandidates[0];
    }

    const sources: string[] = [];
    groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
      if (chunk.web?.uri) sources.push(chunk.web.title || chunk.web.uri);
    });
    
    return { ...data, sources: [...new Set(sources)] };
  } catch (error) {
    console.error("Parse Error", error);
    throw new Error("Model returned malformed data. Try a more specific wine.");
  }
};

export const analyzeWineLabel = async (base64: string, mimeType: string): Promise<WineData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: "Analyze this label and return JSON." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      // Disable thinking budget to minimize latency for retrieval tasks
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return parseResponse(response.text, response.candidates?.[0]?.groundingMetadata);
};

export const searchWineByName = async (query: string): Promise<WineData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Report for: ${query}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      // Disable thinking budget to minimize latency for retrieval tasks
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return parseResponse(response.text, response.candidates?.[0]?.groundingMetadata);
};

export const searchWineMatches = async (query: string): Promise<WineMatch[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `List 3 likely wine matches for query: "${query}"`,
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
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

  return JSON.parse(response.text);
};
