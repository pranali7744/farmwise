import type { FarmInputs } from "../types";

type Lang = "en" | "mr" | "hi";

interface Props {
  inputs: FarmInputs;
  language: Lang;
  onApply: (changes: Partial<FarmInputs>) => void;
}

const text = {
  en: {
    title: "Smart Suggestions",
    subtitle: "Suggestions based on your simulation inputs",
    water: "Increase water availability",
    waterDesc: "Your current water availability may be limiting the simulated outcome.",
    planting: "Use optimal planting",
    plantingDesc: "Changing the planting schedule to optimal may reduce planting-related risk.",
    fertilizer: "Use recommended fertilizer",
    fertilizerDesc: "Compare the recommended fertilizer level with your current input.",
    weather: "Compare a normal-weather scenario",
    weatherDesc: "Test a normal-weather scenario before making the decision.",
    apply: "Apply & Simulate",
    good: "Your current setup does not show an obvious adjustment.",
    goodDesc: "Try What-If scenarios to explore alternatives.",
  },
  mr: {
    title: "स्मार्ट सूचना",
    subtitle: "तुमच्या सिम्युलेशन इनपुटवर आधारित सूचना",
    water: "पाण्याची उपलब्धता वाढवा",
    waterDesc: "पाण्याची उपलब्धता कमी असल्यामुळे परिणामावर परिणाम होऊ शकतो.",
    planting: "योग्य वेळेची लागवड निवडा",
    plantingDesc: "योग्य लागवड वेळ जोखीम कमी करण्यास मदत करू शकते.",
    fertilizer: "शिफारस केलेले खत वापरा",
    fertilizerDesc: "सध्याच्या खताच्या वापराची शिफारस केलेल्या पातळीशी तुलना करा.",
    weather: "सामान्य हवामानाची तुलना करा",
    weatherDesc: "निर्णय घेण्यापूर्वी सामान्य हवामान परिस्थिती तपासा.",
    apply: "लागू करा आणि सिम्युलेट करा",
    good: "सध्याच्या सेटअपमध्ये स्पष्ट बदल आवश्यक दिसत नाही.",
    goodDesc: "पर्यायी परिस्थिती तपासण्यासाठी What-If वापरा.",
  },
  hi: {
    title: "स्मार्ट सुझाव",
    subtitle: "आपके सिमुलेशन इनपुट पर आधारित सुझाव",
    water: "पानी की उपलब्धता बढ़ाएँ",
    waterDesc: "कम पानी की उपलब्धता सिमुलेशन परिणाम को प्रभावित कर सकती है।",
    planting: "उचित समय पर बुवाई करें",
    plantingDesc: "उचित बुवाई समय जोखिम कम करने में मदद कर सकता है।",
    fertilizer: "अनुशंसित उर्वरक इस्तेमाल करें",
    fertilizerDesc: "वर्तमान उर्वरक उपयोग की अनुशंसित स्तर से तुलना करें।",
    weather: "सामान्य मौसम की तुलना करें",
    weatherDesc: "निर्णय लेने से पहले सामान्य मौसम की स्थिति जाँचें।",
    apply: "लागू करें और सिमुलेट करें",
    good: "वर्तमान सेटअप में कोई स्पष्ट बदलाव आवश्यक नहीं दिखता।",
    goodDesc: "वैकल्पिक परिस्थितियाँ देखने के लिए What-If का उपयोग करें।",
  },
};

export default function Suggestions({ inputs, language, onApply }: Props) {
  const t = text[language];
  const suggestions: { title: string; desc: string; changes: Partial<FarmInputs> }[] = [];
  const water = Number(inputs.water_availability);

  if (water < 90) {
    suggestions.push({
      title: t.water,
      desc: t.waterDesc,
      changes: { water_availability: Math.min(100, water + 20) },
    });
  }

  if (inputs.planting_date !== "optimal") {
    suggestions.push({
      title: t.planting,
      desc: t.plantingDesc,
      changes: { planting_date: "optimal", planting_schedule: "optimal" },
    });
  }

  if (inputs.fertilizer !== "recommended") {
    suggestions.push({
      title: t.fertilizer,
      desc: t.fertilizerDesc,
      changes: { fertilizer: "recommended", input_usage: "recommended" },
    });
  }

  if (inputs.weather !== "normal") {
    suggestions.push({
      title: t.weather,
      desc: t.weatherDesc,
      changes: { weather: "normal" },
    });
  }

  return (
    <section className="card fw-suggestions">
      <div className="head">
        <div><em>03</em><h2>💡 {t.title}</h2></div>
        <p>{t.subtitle}</p>
      </div>

      {suggestions.length === 0 ? (
        <div className="fw-suggestion-good">
          <strong>✓ {t.good}</strong>
          <p>{t.goodDesc}</p>
        </div>
      ) : (
        <div className="fw-suggestion-list">
          {suggestions.map((s, i) => (
            <div className="fw-suggestion" key={i}>
              <div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
              <button className="primary" onClick={() => onApply(s.changes)}>
                {t.apply}
              </button>
            </div>
          ))}
        </div>
      )}

      <small className="muted">
        Suggestions use transparent rule-based conditions; they do not generate new simulation numbers.
      </small>
    </section>
  );
}
