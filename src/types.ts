export type Lang = "en" | "mr" | "hi";

export interface FarmInputs {
  crop: string;
  scenario_name: string;
  state: string;
  region: string;
  soil: string;
  farm_size_acres: number;
  water_availability: number;
  weather: string;
  planting_date: string;
  fertilizer: string;
}

export interface Factor {
  name: string;
  impact: number;
  direction: "positive" | "negative" | "neutral";
}

export interface SimulationResult {
  raw: Record<string, any>;
  scenarioName: string;
  yieldValue: number | null;
  production: number | null;
  cost: number | null;
  profit: number | null;
  water: number | null;
  riskScore: number | null;
  risk: string;
  yieldUnit: string;
  waterUnit: string;
  explanation: string;
  factors: Factor[];
}

export interface ComparisonResult {
  comparison_summary: {
    scenario_a: string;
    scenario_b: string;
    delta_yield_t_ha: number;
    pct_delta_yield: number;
    delta_total_cost_inr: number;
    delta_net_profit_inr: number;
    delta_water_m3: number;
    delta_risk_score: number;
    primary_driver: string;
    secondary_driver: string;
    plain_english_explanation: string;
  };
}
