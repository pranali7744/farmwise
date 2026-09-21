import { useState } from "react";
import { compare, simulate } from "./api";
import Form, { defaults } from "./components/Form";
import Results from "./components/Results";
import type { FarmInputs, SimulationResult } from "./types";

export default function App() {
  const [inputs, setInputs] = useState<FarmInputs>(defaults);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [whatIf, setWhatIf] = useState<SimulationResult | null>(null);
  const [comparisonText, setComparisonText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setBusy(true);
    setError("");
    setWhatIf(null);
    setComparisonText("");
    try {
      setResult(await simulate(inputs));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function runWhatIf() {
    if (!result) return;
    setBusy(true);
    setError("");
    try {
      const changed: FarmInputs = {
        ...inputs,
        scenario_name: "What-If: 120% water",
        water_availability: Math.min(150, inputs.water_availability + 20),
      };
      const [simulated, comparison] = await Promise.all([
        simulate(changed),
        compare(inputs, changed),
      ]);
      setWhatIf(simulated);
      setComparisonText(comparison.comparison_summary.plain_english_explanation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "What-if simulation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header>
        <div>
          <div className="brand">🌱 <b>FarmWise</b></div>
          <small>Scenario & Decision Simulator</small>
        </div>
        <select aria-label="Language">
          <option>English</option>
          <option>मराठी</option>
          <option>हिन्दी</option>
        </select>
      </header>

      <main>
        <section className="hero">
          <span>AGRI PS01 · FARM DECISION SIMULATOR</span>
          <h1>Test your farming decisions before you make them.</h1>
          <p>Set conditions → Simulate → Change something → Compare → Understand.</p>
        </section>

        <Form value={inputs} onChange={setInputs} onRun={run} busy={busy} />

        {error && <div className="error">{error}</div>}

        <Results result={result} />

        <section className="card">
          <div className="section-head">
            <div><span className="step">03</span><h2>What-If Lab</h2></div>
            <p>Change water availability and run the real backend again.</p>
          </div>

          <button className="secondary" onClick={runWhatIf} disabled={!result || busy}>
            {busy ? "Running…" : "Run What-If scenario"}
          </button>

          {whatIf && result && (
            <div className="compare-grid">
              <div><small>Yield</small><b>{result.yieldValue} → {whatIf.yieldValue} t/ha</b></div>
              <div><small>Cost</small><b>₹{result.cost?.toLocaleString("en-IN")} → ₹{whatIf.cost?.toLocaleString("en-IN")}</b></div>
              <div><small>Water</small><b>{result.water} → {whatIf.water} m³</b></div>
              <div><small>Risk</small><b>{result.risk} → {whatIf.risk}</b></div>
            </div>
          )}

          {comparisonText && <p className="explanation">{comparisonText}</p>}
        </section>
      </main>

      <footer>FarmWise · Transparent rule-based simulation</footer>
    </>
  );
}
