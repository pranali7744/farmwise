import type { FarmInputs } from "../types";

export const defaults: FarmInputs = {
  crop: "wheat",
  scenario_name: "Base Scenario",
  state: "Maharashtra",
  region: "Kolhapur",
  soil: "black_soil",
  farm_size_acres: 5,
  water_availability: 100,
  weather: "normal",
  planting_date: "optimal",
  fertilizer: "recommended",
};

export default function Form({
  value,
  onChange,
  onRun,
  busy,
}: {
  value: FarmInputs;
  onChange: (value: FarmInputs) => void;
  onRun: () => void;
  busy: boolean;
}) {
  const set = <K extends keyof FarmInputs>(key: K, value: FarmInputs[K]) =>
    onChange({ ...value, [key]: value });

  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault();
        onRun();
      }}
    >
      <div className="section-head">
        <div>
          <span className="step">01</span>
          <h2>Farm setup</h2>
        </div>
        <p>Set the conditions you want to test.</p>
      </div>

      <div className="grid">
        <Field label="Crop">
          <select value={value.crop} onChange={(e) => set("crop", e.target.value)}>
            {["wheat", "rice", "maize", "soybean", "cotton", "sugarcane", "groundnut", "jowar"].map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </Field>

        <Field label="Scenario name">
          <input value={value.scenario_name} onChange={(e) => set("scenario_name", e.target.value)} />
        </Field>

        <Field label="Farm size (acres)">
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={value.farm_size_acres}
            onChange={(e) => set("farm_size_acres", Number(e.target.value))}
          />
        </Field>

        <Field label="State">
          <input value={value.state} onChange={(e) => set("state", e.target.value)} />
        </Field>

        <Field label="Soil">
          <select value={value.soil} onChange={(e) => set("soil", e.target.value)}>
            <option value="black_soil">Black soil</option>
            <option value="alluvial_loam">Alluvial loam</option>
            <option value="red_sandy_loam">Red sandy loam</option>
            <option value="clay_loam">Clay loam</option>
            <option value="sandy_soil">Sandy soil</option>
          </select>
        </Field>

        <Field label={`Water availability: ${value.water_availability}%`}>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={value.water_availability}
            onChange={(e) => set("water_availability", Number(e.target.value))}
          />
        </Field>

        <Field label="Weather">
          <select value={value.weather} onChange={(e) => set("weather", e.target.value)}>
            <option value="optimal">Optimal</option>
            <option value="normal">Normal</option>
            <option value="moderate_heatwave">Moderate heatwave</option>
            <option value="severe_drought">Severe drought</option>
            <option value="unseasonal_rain">Unseasonal rain</option>
          </select>
        </Field>

        <Field label="Planting">
          <select value={value.planting_date} onChange={(e) => set("planting_date", e.target.value)}>
            <option value="optimal">Optimal</option>
            <option value="early">Early</option>
            <option value="late">Late</option>
            <option value="very_late">Very late</option>
          </select>
        </Field>

        <Field label="Fertilizer">
          <select value={value.fertilizer} onChange={(e) => set("fertilizer", e.target.value)}>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="recommended">Recommended</option>
            <option value="high">High</option>
            <option value="excessive">Excessive</option>
            <option value="organic">Organic</option>
          </select>
        </Field>
      </div>

      <div className="actions">
        <button className="primary" disabled={busy}>
          {busy ? "Simulating…" : "▶ Run simulation"}
        </button>
        <button type="button" onClick={() => onChange(defaults)}>Reset</button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
