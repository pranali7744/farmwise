import type { SimulationResult } from "../types";
import Metric from "./Metric";

export default function Results({ result }: { result: SimulationResult | null }) {
  if (!result) {
    return (
      <div className="card empty">
        <div className="empty-icon">🌾</div>
        <h3>Run a simulation to see results.</h3>
        <p>Yield, cost, water use, risk and factor attribution come from the backend.</p>
      </div>
    );
  }

  return (
    <>
      <div className="section-head outside">
        <div><span className="step">02</span><h2>Simulation results</h2></div>
        <p>{result.scenarioName}</p>
      </div>

      <div className="metrics">
        <Metric label="Expected yield" value={result.yieldValue == null ? "—" : `${result.yieldValue} t/ha`} icon="🌾" />
        <Metric label="Estimated cost" value={result.cost == null ? "—" : `₹${result.cost.toLocaleString("en-IN")}`} icon="₹" />
        <Metric label="Water use" value={result.water == null ? "—" : `${result.water.toLocaleString("en-IN")} m³`} icon="💧" />
        <Metric label="Risk" value={result.riskScore == null ? result.risk : `${result.risk} (${result.riskScore}/100)`} icon="⚠" />
      </div>

      <div className="two">
        <div className="card">
          <h3>Major factors</h3>
          {result.factors.length ? (
            result.factors.map((factor, index) => {
              const width = Math.min(100, Math.abs(factor.impact) * 60);
              return (
                <div className="factor" key={`${factor.name}-${index}`}>
                  <div>
                    <span>{factor.name}</span>
                    <small>{factor.impact > 0 ? "+" : ""}{factor.impact} t/ha</small>
                  </div>
                  <i><b style={{ width: `${width}%` }} /></i>
                </div>
              );
            })
          ) : (
            <p className="muted">No factor attribution returned.</p>
          )}
        </div>

        <div className="card">
          <h3>Why this result?</h3>
          <p className="reason">{result.explanation}</p>
          <aside>FarmWise displays the deterministic result from the SimulationEngine; the frontend does not recreate the formula.</aside>
        </div>
      </div>
    </>
  );
}
