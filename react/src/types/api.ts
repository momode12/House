// ─── Dashboard types ───────────────────────────────────────────────────────

export interface Labels {
  location: Record<string, string>;
  Status: Record<string, string>;
  Transaction: Record<string, string>;
  Furnishing: Record<string, string>;
  Ownership: Record<string, string>;
}

export interface PredictionResult {
  predicted_price: number;
  price_in_lac: number;
  price_in_crore: number;
}

export interface HistoryItem {
  id: number;
  inputs: Record<string, string>;
  result: PredictionResult;
  timestamp: string;
}

export interface StatsItem {
  price: number;
  price_in_lac: number;
  location: string;
  bathroom: string;
  timestamp: number;
}

export interface Stats {
  total_predictions: number;
  avg_price: number;
  avg_price_in_lac: number;
  avg_response_time: number;
  last_predictions: StatsItem[];
}

export interface FormState {
  location: string;
  status: string;
  transaction: string;
  furnishing: string;
  bathroom: string;
  balcony: string;
  ownership: string;
  floor_num: string;
}

export interface UserProfile {
  username: string;
  email?: string;
  avatar?: string; // initials color key
}