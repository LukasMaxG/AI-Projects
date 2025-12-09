export interface VintageScore {
  year: string;
  score: number; // 0-100
  notes: string;
}

export interface AgingData {
  drinkFrom: string;
  drinkUntil: string;
  peakYears: string;
  investmentPotential: string; // "High", "Medium", "Low"
  estimatedValue5Years: string;
}

export interface PairingData {
  foods: string[];
  temperature: string;
  decanting: string;
  glassware: string; // e.g. "Bordeaux Glass"
}

export interface StyleProfile {
  body: string; // e.g., "Full-bodied"
  acidity: string;
  tannins: string;
}

export interface CriticScore {
  critic: string; // e.g. "Robert Parker", "Wine Spectator"
  score: string; // e.g. "95/100"
}

export interface TerroirData {
  soil: string[]; // e.g. ["Limestone", "Clay"]
  oak: string; // e.g. "18 months in French Oak"
  farming: string[]; // e.g. ["Organic", "Biodynamic"]
}

export interface WineData {
  name: string;
  vintage: string;
  country: string;
  region: string;
  subRegion?: string;
  varietals: string[];
  type: string; // e.g., Cabernet, Pinot Noir
  abv: string;
  color: string;
  nose: string;
  taste: string;
  closure: string; // cork, screwcap
  size: string; // 750ml, etc.
  marketPrice: string;
  wineryInfo: string;
  awards: string[];
  funFacts: string[]; 
  sources: string[];
  
  // New Enhanced Fields
  criticScores: CriticScore[];
  terroir: TerroirData;
  styleProfile: StyleProfile;
  vintageComparison: VintageScore[];
  aging: AgingData;
  pairing: PairingData;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  data?: WineData;
  error?: string;
}