import type { ComparisonResult, Factor, FarmInputs, SimulationResult } from "./types";

const base = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

async function post(path: string, body: unknown) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep HTTP fallback.
    }
    throw new Error(message);
  }

  return response.json();
}

const number = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
};

export async function simulate(inputs: FarmInputs): Promise<SimulationResult> {
  return normalize(await post("/api/simulate", inputs));
}

export async function compare(
  scenarioA: FarmInputs,
  scenarioB: FarmInputs
): Promise<ComparisonResult> {
  return post("/api/simulate/compare", {
    scenario_a: scenarioA,
    scenario_b: scenarioB,
  });
}

function normalize(data: any): SimulationResult {
  const yieldBlock = data?.yield ?? {};
  const costBlock = data?.costs_and_returns ?? {};
  const waterBlock = data?.water_applied_allocated ?? {};
  const riskBlock = data?.risk ?? {};

  const rawFactors = Array.isArray(data?.factor_attribution)
    ? data.factor_attribution
    : [];

  const factors: Factor[] = rawFactors.map((item: any) => {
    const impact = number(item?.impact_t_ha) ?? 0;
    return {
      name: item?.factor_name ?? item?.factor ?? "Factor",
      impact,
      direction: impact > 0 ? "positive" : impact < 0 ? "negative" : "neutral",
    };
  });

  return {
    raw: data,
    scenarioName: data?.scenario_name ?? "Scenario",
    yieldValue: number(yieldBlock.estimated_yield_t_ha),
    production: number(yieldBlock.total_production_tonnes),
    cost: number(costBlock.total_cost_inr),
    profit: number(costBlock.net_profit_inr),
    water: number(waterBlock.total_water_m3),
    riskScore: number(riskBlock.score),
    risk: riskBlock.category ?? "Unknown",
    yieldUnit: "t/ha",
    waterUnit: "m³",
    explanation:
      riskBlock.explanation ??
      `The simulation estimates ${yieldBlock.estimated_yield_t_ha ?? "—"} t/ha based on the selected farm conditions.`,
    factors,
  };
}
