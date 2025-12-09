import { GoogleGenAI } from "@google/genai";
import { WineData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Master Sommelier and Wine Researcher. 
Your task is to provide a detailed report on a specific wine.
You will receive either an image of a wine label or a text name of a wine.
You must identify the wine and then search the web for specific details including current market price, ratings, and winery history.
Use sources like winelibrary.com, wine encyclopedia, winespectator.com, etc.

You must return the response in strict JSON format. 
Do not wrap the JSON in markdown code blocks like \`\`\`json ... \`\`\`. Just return the raw JSON string.

The JSON object must match this structure:
{
  "name": "Full Wine Name",
  "vintage": "Year or NV",
  "country": "Country of origin",
  "region": "Region",
  "subRegion": "Sub-region or Appellation (if applicable)",
  "varietals": ["List", "of", "Grapes"],
  "type": "Red, White, Rose, Sparkling, etc.",
  "abv": "Alcohol By Volume (approximate if exact not found)",
  "color": "Visual description of color",
  "nose": "Aromatic profile description",
  "taste": "Palate and flavor profile description",
  "closure": "Cork, Screwcap, etc.",
  "size": "Bottle size (usually 750ml)",
  "marketPrice": "Current average market price range (e.g. $25 - $35)",
  "wineryInfo": "A concise paragraph about the winery/chateau history.",
  "awards": ["List", "of", "major", "points", "or", "awards"],
  "funFacts": ["Famous years", "Interesting history facts", "Pairing suggestions"]
}
`;

const parseResponse = (text: string, groundingMetadata: any): WineData => {
  let jsonString = text || "";
  // Cleanup if the model accidentally adds markdown
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
            text: "Analyze this wine label. Identify the wine, then find detailed specifications, tasting notes, current market price, and winery history using Google Search."
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
            text: `Research the wine named "${wineName}". Find detailed specifications, tasting notes, current market price, and winery history using Google Search. Return the data in the specified JSON format.`
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
