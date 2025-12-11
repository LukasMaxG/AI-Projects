
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

export interface LegendaryVintage {
  year: string;
  notes: string;
  awards: string[];
}

export interface GrapeComposition {
  grape: string;
  percentage: number; // 0-100
}

export interface WineRecommendation {
  name: string;
  reason: string; // "Similar Style" or "Hidden Gem"
}

export interface LabelTerm {
  term: string;
  definition: string;
}

export interface EducationalInsight {
  climate: string; // e.g. "Mediterranean (Hot Summers)"
  geography: string; // e.g. "Galestro soil, high altitude"
  vibe: string; // e.g. "Think of this region like the 'Texas of Italy'"
  labelTerms: LabelTerm[];
  pronunciation: {
    native: string;
    phonetic: string; // e.g. "Guh-VURTZ-tra-mee-ner"
  };
}

export interface WineData {
  id?: string; // Unique ID for history
  timestamp?: number; // Time of scan
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
  websiteUrl?: string; // New: Official Website
  onlineImage?: string; // New: AI found image URL (Primary)
  imageCandidates?: string[]; // New: List of candidate URLs to try if primary fails
  awards: string[];
  funFacts: string[]; 
  bestVintages?: LegendaryVintage[] | string[]; // New: List of best years (Rich object or legacy string)
  sources: string[];
  
  // New Enhanced Fields
  criticScores: CriticScore[];
  terroir: TerroirData;
  styleProfile: StyleProfile;
  vintageComparison: VintageScore[];
  aging: AgingData;
  pairing: PairingData;
  
  // Phase 2.6: Deep Analysis & User Data
  grapeComposition?: GrapeComposition[]; // Estimated blend percentages
  recommendations?: WineRecommendation[]; // AI suggestions
  userRating?: number; // 0-5 stars set by user
  userNotes?: string; // Personal notes set by user
  
  // Phase 2.7: Education (Winography Style)
  education?: EducationalInsight;
}

export interface CellarItem {
  id: string; // Unique instance ID
  wine: WineData;
  quantity: number;
  purchasePrice?: number;
  purchaseDate?: number;
  location?: string; // e.g. "Bin 3"
  addedAt: number;
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  data?: WineData;
  error?: string;
}
