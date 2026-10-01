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

type Lang = "en" | "mr" | "hi";

const FORM_TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    farmSetup: "Farm setup",
    setConditions: "Set the conditions you want to test.",
    crop: "Crop",
    scenarioName: "Scenario name",
    farmSize: "Farm size (acres)",
    state: "State",
    region: "Region",
    soil: "Soil",
    blackSoil: "Black soil",
    alluvialLoam: "Alluvial loam",
    redSandyLoam: "Red sandy loam",
    clayLoam: "Clay loam",
    sandySoil: "Sandy soil",
    waterAvailability: "Water availability",
    weather: "Weather",
    optimal: "Optimal",
    normal: "Normal",
    heatwave: "Moderate heatwave",
    drought: "Severe drought",
    unseasonalRain: "Unseasonal rain",
    planting: "Planting schedule",
    early: "Early",
    late: "Late",
    veryLate: "Very late",
    fertilizer: "Fertilizer / input",
    low: "Low",
    moderate: "Moderate",
    recommended: "Recommended",
    high: "High",
    excessive: "Excessive",
    organic: "Organic",
    simulating: "Simulating...",
    runSimulation: "Run simulation",
    reset: "Reset",
    wheat: "Wheat",
    rice: "Rice",
    jowar: "Jowar (Sorghum)",
    cotton: "Cotton",
    maize: "Maize",
    sugarcane: "Sugarcane",
    soybean: "Soybean",
    groundnut: "Groundnut",
  },
  mr: {
    farmSetup: "शेती सेटअप",
    setConditions: "तुम्हाला तपासायच्या असलेल्या शेती परिस्थिती निश्चित करा.",
    crop: "पीक",
    scenarioName: "परिस्थितीचे नाव",
    farmSize: "शेताचे क्षेत्रफळ (एकर)",
    state: "राज्य",
    region: "प्रदेश / जिल्हा",
    soil: "माती",
    blackSoil: "काळी माती",
    alluvialLoam: "गाळाची माती",
    redSandyLoam: "लाल वालुकामय माती",
    clayLoam: "चिकणमाती",
    sandySoil: "वालुकामय माती",
    waterAvailability: "पाण्याची उपलब्धता",
    weather: "हवामान",
    optimal: "योग्य वेळ / अनुकूल",
    normal: "सामान्य",
    heatwave: "मध्यम उष्णतेची लाट",
    drought: "तीव्र दुष्काळ",
    unseasonalRain: "अवेळी पाऊस",
    planting: "लागवड वेळापत्रक",
    early: "लवकर पेरणी",
    late: "उशिरा पेरणी",
    veryLate: "खूप उशिरा पेरणी",
    fertilizer: "खत / इनपुट वापर",
    low: "कमी",
    moderate: "मध्यम",
    recommended: "शिफारस केलेले",
    high: "जास्त",
    excessive: "अतिप्रमाणात",
    organic: "सेंद्रिय खत",
    simulating: "सिम्युलेशन सुरू आहे...",
    runSimulation: "सिम्युलेशन करा",
    reset: "रीसेट",
    wheat: "गहू",
    rice: "भात (तांदूळ)",
    jowar: "ज्वारी",
    cotton: "कापूस",
    maize: "मका",
    sugarcane: "ऊस",
    soybean: "सोयाबीन",
    groundnut: "भुईमूग",
  },
  hi: {
    farmSetup: "खेती सेटअप",
    setConditions: "वे परिस्थितियां निर्धारित करें जिनका आप परीक्षण करना चाहते हैं।",
    crop: "फसल",
    scenarioName: "परिदृश्य का नाम",
    farmSize: "खेत का आकार (एकड़)",
    state: "राज्य",
    region: "क्षेत्र / जिला",
    soil: "मिट्टी",
    blackSoil: "काली मिट्टी",
    alluvialLoam: "जलोढ़ दोमट",
    redSandyLoam: "लाल रेतीली दोमट",
    clayLoam: "चिकनी दोमट",
    sandySoil: "रेतीली मिट्टी",
    waterAvailability: "पानी की उपलब्धता",
    weather: "मौसम",
    optimal: "उचित समय / अनुकूल",
    normal: "सामान्य",
    heatwave: "मध्यम लू",
    drought: "गंभीर सूखा",
    unseasonalRain: "बेमौसम बारिश",
    planting: "बुवाई समय",
    early: "जल्दी बुवाई",
    late: "देरी से बुवाई",
    veryLate: "बहुत देरी से बुवाई",
    fertilizer: "उर्वरक / इनपुट उपयोग",
    low: "कम",
    moderate: "मध्यम",
    recommended: "अनुशंसित",
    high: "अधिक",
    excessive: "अत्यधिक",
    organic: "जैविक खाद",
    simulating: "सिमुलेशन जारी है...",
    runSimulation: "सिमुलेशन चलाएं",
    reset: "रीसेट",
    wheat: "गेहूं",
    rice: "चावल (धान)",
    jowar: "ज्वार",
    cotton: "कपास",
    maize: "मक्का",
    sugarcane: "गन्ना",
    soybean: "सोयाबीन",
    groundnut: "मूंगफली",
  },
};

const cropIds = [
  "wheat",
  "rice",
  "jowar",
  "cotton",
  "maize",
  "sugarcane",
  "soybean",
  "groundnut",
];

export default function Form({
  value,
  onChange,
  onRun,
  busy,
  t,
  language = "en",
}: {
  value: FarmInputs;
  onChange: (value: FarmInputs) => void;
  onRun: () => void;
  busy: boolean;
  t?: (key: string) => string;
  language?: Lang;
}) {
  const dict = FORM_TRANSLATIONS[language] || FORM_TRANSLATIONS.en;
  const tr = (key: string) => {
    if (t) {
      const res = t(key);
      if (res && res !== key) return res;
    }
    return dict[key] ?? key;
  };

  // IMPORTANT: update the COMPLETE FarmInputs object.
  // The previous version accidentally shadowed `value` and replaced the
  // whole form state with the individual field value.
  const set = <K extends keyof FarmInputs>(key: K, next: FarmInputs[K]) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <form
      className="card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy) onRun();
      }}
    >
      <div className="section-head">
        <div>
          <span className="step">01</span>
          <h2>{tr("farmSetup")}</h2>
        </div>
        <p>{tr("setConditions")}</p>
      </div>

      <div className="grid">
        <Field label={tr("crop")}>
          <select value={value.crop} onChange={(e) => set("crop", e.target.value)}>
            {cropIds.map((id) => (
              <option key={id} value={id}>{tr(id)}</option>
            ))}
          </select>
        </Field>

        <Field label={tr("scenarioName")}>
          <input
            value={value.scenario_name}
            onChange={(e) => set("scenario_name", e.target.value)}
          />
        </Field>

        <Field label={tr("farmSize")}>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={value.farm_size_acres}
            onChange={(e) => set("farm_size_acres", Number(e.target.value))}
          />
        </Field>

        <Field label={tr("state")}>
          <input value={value.state} onChange={(e) => set("state", e.target.value)} />
        </Field>

        <Field label={tr("region")}>
          <input value={value.region} onChange={(e) => set("region", e.target.value)} />
        </Field>

        <Field label={tr("soil")}>
          <select value={value.soil} onChange={(e) => set("soil", e.target.value)}>
            <option value="black_soil">{tr("blackSoil")}</option>
            <option value="alluvial_loam">{tr("alluvialLoam")}</option>
            <option value="red_sandy_loam">{tr("redSandyLoam")}</option>
            <option value="clay_loam">{tr("clayLoam")}</option>
            <option value="sandy_soil">{tr("sandySoil")}</option>
          </select>
        </Field>

        <Field label={`${tr("waterAvailability")}: ${value.water_availability}%`}>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={value.water_availability}
            onChange={(e) => set("water_availability", Number(e.target.value))}
          />
        </Field>

        <Field label={tr("weather")}>
          <select value={value.weather} onChange={(e) => set("weather", e.target.value)}>
            <option value="optimal">{tr("optimal")}</option>
            <option value="normal">{tr("normal")}</option>
            <option value="moderate_heatwave">{tr("heatwave")}</option>
            <option value="severe_drought">{tr("drought")}</option>
            <option value="unseasonal_rain">{tr("unseasonalRain")}</option>
          </select>
        </Field>

        <Field label={tr("planting")}>
          <select value={value.planting_date} onChange={(e) => set("planting_date", e.target.value)}>
            <option value="optimal">{tr("optimal")}</option>
            <option value="early">{tr("early")}</option>
            <option value="late">{tr("late")}</option>
            <option value="very_late">{tr("veryLate")}</option>
          </select>
        </Field>

        <Field label={tr("fertilizer")}>
          <select value={value.fertilizer} onChange={(e) => set("fertilizer", e.target.value)}>
            <option value="low">{tr("low")}</option>
            <option value="moderate">{tr("moderate")}</option>
            <option value="recommended">{tr("recommended")}</option>
            <option value="high">{tr("high")}</option>
            <option value="excessive">{tr("excessive")}</option>
            <option value="organic">{tr("organic")}</option>
          </select>
        </Field>
      </div>

      <div className="actions">
        <button className="primary" type="submit" disabled={busy}>
          {busy ? tr("simulating") : `▶ ${tr("runSimulation")}`}
        </button>
        <button type="button" onClick={() => onChange({ ...defaults })} disabled={busy}>
          {tr("reset")}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}
