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
  funFacts: string[]; // Famous years, history
  sources: string[];
}

export interface AnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  data?: WineData;
  error?: string;
}
