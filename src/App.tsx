import { useState } from "react";
import { simulate } from "./api";
import { defaults } from "./components/Form";
import Form from "./components/Form";
import Results from "./components/Results";
import Suggestions from "./components/Suggestions";
import type { FarmInputs, SimulationResult } from "./types";
import "./farmwise-enhancements.css";

type Lang = "en" | "mr" | "hi";

const translations = {
  en: {
    subtitle: "Scenario & Decision Simulator",
    hero: "Test your farming decisions before you make them.",
    heroSub: "Set conditions → Simulate → Change something → Compare → Understand.",
    language: "Language",
    whatIf: "What-If Lab",
    whatIfSub: "Change one condition and compare the outcome.",
    simulate: "Simulate What-If",
    comparison: "Scenario Comparison",
    add: "+ Add current scenario",
    scenario: "Scenario",
    yield: "Yield",
    cost: "Cost",
    water: "Water",
    risk: "Risk",
    reset: "Reset",
    footer: "FarmWise · Rule-based decision simulator",
  },
  mr: {
    subtitle: "परिस्थिती आणि निर्णय सिम्युलेटर",
    hero: "शेतीचा निर्णय घेण्यापूर्वी त्याची चाचणी करा.",
    heroSub: "परिस्थिती ठरवा → सिम्युलेट करा → बदल करा → तुलना करा → समजा.",
    language: "भाषा",
    whatIf: "What-If प्रयोगशाळा",
    whatIfSub: "एक परिस्थिती बदला आणि परिणामांची तुलना करा.",
    simulate: "What-If सिम्युलेट करा",
    comparison: "परिस्थिती तुलना",
    add: "+ सध्याची परिस्थिती जोडा",
    scenario: "परिस्थिती",
    yield: "उत्पादन",
    cost: "खर्च",
    water: "पाणी",
    risk: "जोखीम",
    reset: "रीसेट",
    footer: "FarmWise · नियम-आधारित निर्णय सिम्युलेटर",
  },
  hi: {
    subtitle: "परिदृश्य और निर्णय सिम्युलेटर",
    hero: "खेती का निर्णय लेने से पहले उसका परीक्षण करें।",
    heroSub: "स्थिति तय करें → सिमुलेट करें → बदलाव करें → तुलना करें → समझें।",
    language: "भाषा",
    whatIf: "What-If लैब",
    whatIfSub: "एक स्थिति बदलें और परिणाम की तुलना करें।",
    simulate: "What-If सिमुलेट करें",
    comparison: "परिदृश्य तुलना",
    add: "+ वर्तमान परिदृश्य जोड़ें",
    scenario: "परिदृश्य",
    yield: "उत्पादन",
    cost: "लागत",
    water: "पानी",
    risk: "जोखिम",
    reset: "रीसेट",
    footer: "FarmWise · नियम-आधारित निर्णय सिम्युलेटर",
  },
};

export default function App() {
  const [v, setV] = useState<FarmInputs>(defaults);
  const [r, setR] = useState<SimulationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [language, setLanguage] = useState<Lang>("en");
  const [whatIfResult, setWhatIfResult] = useState<SimulationResult | null>(null);
  const [water, setWater] = useState(120);
  const [scenarios, setScenarios] = useState<{ v: FarmInputs; r: SimulationResult }[]>([]);
  const t = translations[language];

  const run = async () => {
    setBusy(true);
    try {
      const result = await simulate(v);
      setR(result);
      setWhatIfResult(null);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  };

  const runWhatIf = async () => {
    try {
      const result = await simulate({
        ...v,
        scenario_name: "What-If",
        water_availability: water,
      });
      setWhatIfResult(result);
    } catch (e) {
      alert(String(e));
    }
  };

  const applySuggestion = async (changes: Partial<FarmInputs>) => {
    const next = { ...v, ...changes };
    setV(next);
    setBusy(true);
    try {
      const result = await simulate(next);
      setR(result);
      setWhatIfResult(null);
    } catch (e) {
      alert(String(e));
    } finally {
      setBusy(false);
    }
  };

  const addScenario = () => {
    if (!r) return;
    setScenarios([...scenarios, { v: { ...v }, r }]);
  };

  return (
    <>
      <header className="fw-navbar">
        <div className="fw-brand">
          <span className="fw-logo">🌱</span>
          <div>
            <strong>FarmWise</strong>
            <small>{t.subtitle}</small>
          </div>
        </div>

        <div className="fw-language">
          <span>{t.language}</span>
          <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button>
          <button className={language === "mr" ? "active" : ""} onClick={() => setLanguage("mr")}>मराठी</button>
          <button className={language === "hi" ? "active" : ""} onClick={() => setLanguage("hi")}>हिन्दी</button>
        </div>
      </header>

      <main>
        <section className="fw-hero">
          <span>🌾 FARM DECISION SIMULATOR</span>
          <h1>{t.hero}</h1>
          <p>{t.heroSub}</p>
        </section>

        <Form v={v} setV={setV} run={run} busy={busy} />

        <Results r={r} />

        {r && (
          <Suggestions
            inputs={v}
            language={language}
            onApply={applySuggestion}
          />
        )}

        <section className="card">
          <div className="head">
            <div><em>04</em><h2>🔄 {t.whatIf}</h2></div>
            <p>{t.whatIfSub}</p>
          </div>

          <label>
            {t.water}: {water}%
            <input type="range" min="0" max="150" value={water} onChange={(e) => setWater(+e.target.value)} />
          </label>

          <button className="primary" onClick={runWhatIf} disabled={!r}>
            {t.simulate}
          </button>

          {whatIfResult && r && (
            <div className="fw-compare">
              <h3>Base → What-If</h3>
              <div>🌾 {t.yield}: <strong>{r.yieldValue ?? "—"} → {whatIfResult.yieldValue ?? "—"}</strong></div>
              <div>₹ {t.cost}: <strong>{r.cost == null ? "—" : `₹${r.cost.toLocaleString()}`} → {whatIfResult.cost == null ? "—" : `₹${whatIfResult.cost.toLocaleString()}`}</strong></div>
              <div>💧 {t.water}: <strong>{r.water ?? "—"} → {whatIfResult.water ?? "—"}</strong></div>
              <div>⚠ {t.risk}: <strong>{r.risk} → {whatIfResult.risk}</strong></div>
            </div>
          )}
        </section>

        <section className="card">
          <div className="head">
            <div><em>05</em><h2>🔀 {t.comparison}</h2></div>
            <p>Compare saved farming decisions side-by-side.</p>
          </div>

          <button className="secondary" onClick={addScenario} disabled={!r}>{t.add}</button>

          {scenarios.length > 0 && (
            <div className="fw-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t.scenario}</th>
                    <th>{t.yield}</th>
                    <th>{t.cost}</th>
                    <th>{t.water}</th>
                    <th>{t.risk}</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((x, i) => (
                    <tr key={i}>
                      <td>{x.v.scenario_name || `Scenario ${i + 1}`}</td>
                      <td>{x.r.yieldValue ?? "—"}</td>
                      <td>{x.r.cost == null ? "—" : `₹${x.r.cost.toLocaleString()}`}</td>
                      <td>{x.r.water ?? "—"}</td>
                      <td>{x.r.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="fw-reset-area">
          <button
            className="secondary"
            onClick={() => {
              setV(defaults);
              setR(null);
              setWhatIfResult(null);
              setScenarios([]);
            }}
          >
            ↻ {t.reset}
          </button>
        </div>
      </main>

      <footer>{t.footer}</footer>
    </>
  );
}
