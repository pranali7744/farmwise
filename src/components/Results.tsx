import type { SimulationResult } from "../types";
import Metric from "./Metric";

type Lang = "en" | "mr" | "hi";

const RESULTS_TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    emptyTitle: "Run a simulation to see results.",
    emptySub: "Yield, cost, water use, risk and factor attribution come from the backend.",
    simulationResults: "Simulation results",
    expectedYield: "Expected yield",
    estimatedCost: "Estimated cost",
    waterUse: "Water use",
    risk: "Risk",
    majorFactors: "Major factors",
    noFactorAttribution: "No factor attribution returned.",
    whyResult: "Why this result?",
    disclaimer: "FarmWise displays the deterministic result from the SimulationEngine; the frontend does not recreate the formula.",
    low: "Low",
    medium: "Medium",
    high: "High",
  },
  mr: {
    emptyTitle: "निकाल पाहण्यासाठी सिम्युलेशन करा.",
    emptySub: "उत्पादन, खर्च, पाण्याचा वापर, जोखीम आणि घटक विश्लेषण बॅकएंडकडून येते.",
    simulationResults: "सिम्युलेशन निकाल",
    expectedYield: "अपेक्षित उत्पादन",
    estimatedCost: "अंदाजे खर्च",
    waterUse: "पाण्याचा वापर",
    risk: "जोखीम",
    majorFactors: "मुख्य घटक",
    noFactorAttribution: "कोणतेही घटक विश्लेषण मिळालेले नाही.",
    whyResult: "हा निकाल का आला?",
    disclaimer: "FarmWise सिम्युलेशन इंजिनमधून आलेला निश्चित निकाल दाखवते; फ्रंटएंड सूत्र पुन्हा तयार करत नाही.",
    low: "कमी",
    medium: "मध्यम",
    high: "जास्त",
  },
  hi: {
    emptyTitle: "परिणाम देखने के लिए सिमुलेशन चलाएं।",
    emptySub: "उपज, लागत, पानी उपयोग, जोखिम और कारक विश्लेषण बैकएंड से आते हैं।",
    simulationResults: "सिमुलेशन परिणाम",
    expectedYield: "अपेक्षित उपज",
    estimatedCost: "अनुमानित लागत",
    waterUse: "पानी का उपयोग",
    risk: "जोखिम",
    majorFactors: "मुख्य कारक",
    noFactorAttribution: "कोई कारक विश्लेषण उपलब्ध नहीं।",
    whyResult: "यह परिणाम क्यों आया?",
    disclaimer: "FarmWise सिमुलेशन इंजन से प्राप्त सटीक परिणाम प्रदर्शित करता है; फ्रंटएंड फॉर्मूला को दोबारा नहीं बनाता।",
    low: "कम",
    medium: "मध्यम",
    high: "अधिक",
  },
};

const formatRisk = (raw: string, dict: Record<string, string>) => {
  let val = raw;
  val = val.replace(/\bhigh\b/gi, dict.high);
  val = val.replace(/\bmedium\b/gi, dict.medium);
  val = val.replace(/\blow\b/gi, dict.low);
  return val;
};

export interface ResultsProps {
  result?: SimulationResult | null;
  r?: SimulationResult | null;
  language?: Lang;
  t?: (key: string) => string;
}

const FACTOR_NAME_MAP: Record<Lang, Record<string, string>> = {
  en: {
    "Soil Compatibility": "Soil Compatibility",
    "Water Availability": "Water Availability",
    "Weather Condition": "Weather Condition",
    "Planting Schedule": "Planting Schedule",
    "Fertilizer / Inputs": "Fertilizer / Inputs",
  },
  mr: {
    "Soil Compatibility": "माती अनुकूलता",
    "Water Availability": "पाण्याची उपलब्धता",
    "Weather Condition": "हवामान स्थिती",
    "Planting Schedule": "लागवड वेळापत्रक",
    "Fertilizer / Inputs": "खते / इनपुट",
  },
  hi: {
    "Soil Compatibility": "मिट्टी अनुकूलता",
    "Water Availability": "पानी की उपलब्धता",
    "Weather Condition": "मौसम की स्थिति",
    "Planting Schedule": "बुवाई का समय",
    "Fertilizer / Inputs": "उर्वरक / इनपुट",
  },
};

const translateFactor = (name: string, lang: Lang): string => {
  return FACTOR_NAME_MAP[lang]?.[name] || FACTOR_NAME_MAP.en[name] || name;
};

export default function Results(props: ResultsProps) {
  const result = props.result ?? props.r ?? null;
  const language = props.language || "en";
  const t = props.t;

  const dict = RESULTS_TRANSLATIONS[language] || RESULTS_TRANSLATIONS.en;
  const tr = (key: string) => {
    if (t) {
      const res = t(key);
      if (res && res !== key) return res;
    }
    return dict[key] ?? key;
  };

  if (!result) {
    return (
      <div className="card empty">
        <div className="empty-icon">🌾</div>
        <h3>{tr("emptyTitle")}</h3>
        <p>{tr("emptySub")}</p>
      </div>
    );
  }

  const riskDisplay = result.riskScore == null 
    ? formatRisk(result.risk, dict) 
    : `${formatRisk(result.risk, dict)} (${result.riskScore}/100)`;

  return (
    <>
      <div className="section-head outside">
        <div><span className="step">02</span><h2>{tr("simulationResults")}</h2></div>
        <p>{result.scenarioName}</p>
      </div>

      <div className="metrics">
        <Metric label={tr("expectedYield")} value={result.yieldValue == null ? "—" : `${result.yieldValue} ${language === "en" ? "t/ha" : "टन/हे."}`} icon="🌾" />
        <Metric label={tr("estimatedCost")} value={result.cost == null ? "—" : `₹${result.cost.toLocaleString("en-IN")}`} icon="₹" />
        <Metric label={tr("waterUse")} value={result.water == null ? "—" : `${result.water.toLocaleString("en-IN")} m³`} icon="💧" />
        <Metric label={tr("risk")} value={riskDisplay} icon="⚠" />
      </div>

      <div className="two">
        <div className="card">
          <h3>{tr("majorFactors")}</h3>
          {result.factors.length ? (
            result.factors.map((factor, index) => {
              const width = Math.min(100, Math.abs(factor.impact) * 60);
              return (
                <div className="factor" key={`${factor.name}-${index}`}>
                  <div>
                    <span>{translateFactor(factor.name, language)}</span>
                    <small>{factor.impact > 0 ? "+" : ""}{factor.impact} {language === "en" ? "t/ha" : "टन/हे."}</small>
                  </div>
                  <i><b style={{ width: `${width}%` }} /></i>
                </div>
              );
            })
          ) : (
            <p className="muted">{tr("noFactorAttribution")}</p>
          )}
        </div>

        <div className="card">
          <h3>{tr("whyResult")}</h3>
          <p className="reason">{result.explanation}</p>
          <aside>{tr("disclaimer")}</aside>
        </div>
      </div>
    </>
  );
}
