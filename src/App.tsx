import { useMemo, useState } from "react";
import { simulate } from "./api";
import type { FarmInputs, SimulationResult } from "./types";

export type Lang = "en" | "mr" | "hi";

export interface Translations {
    dashboard: string;
    create: string;
    scenarios: string;
    compare: string;
    insights: string;
    tryDemo: string;
    heroKicker: string;
    heroTitle: string;
    heroText: string;
    start: string;
    demo: string;
    continue: string;
    welcome: string;
    welcomeText: string;
    setup: string;
    setupSubtitle: string;
    crop: string;
    scenarioName: string;
    scenarioNamePlaceholder: string;
    state: string;
    statePlaceholder: string;
    region: string;
    regionPlaceholder: string;
    soil: string;
    size: string;
    water: string;
    waterWord: string;
    weather: string;
    planting: string;
    fertilizer: string;
    run: string;
    simulating: string;
    reset: string;
    results: string;
    yield: string;
    cost: string;
    resource: string;
    risk: string;
    factors: string;
    noFactorBreakdown: string;
    why: string;
    defaultExplanation: string;
    disclaimer: string;
    whatif: string;
    live: string;
    runWhatIf: string;
    base: string;
    scenario: string;
    whatifScenarioName: string;
    compareTitle: string;
    compareSubtitle: string;
    scenarioCol: string;
    suggestions: string;
    ruleBased: string;
    apply: string;
    noScenario: string;
    noSuggestions: string;
    sugWater: string;
    sugPlanting: string;
    sugFertilizer: string;
    sugWeather: string;
    sugWaterName: string;
    sugPlantingName: string;
    sugFertilizerName: string;
    sugWeatherName: string;
    baseScenario: string;
    demoScenario: string;
    defaultScenarioName: string;
    saved: string;
    open: string;
    statFeatures: string;
    statLanguages: string;
    statRules: string;
    language: string;
    logout: string;
    low: string;
    medium: string;
    high: string;
    unknown: string;
    yieldUnit: string;
    waterUnit: string;
    factorSoil: string;
    factorWater: string;
    factorWeather: string;
    factorPlanting: string;
    factorFertilizer: string;
    directionPositive: string;
    directionNegative: string;
    directionNeutral: string;
    explanationPrefix: string;
    explanationCost: string;
    explanationRisk: string;
    insightsTitle: string;
    factorAnalysisTitle: string;
    insightsText: string;
    resourceAwarenessTitle: string;
    resourceAwarenessText: string;
    riskAwarenessTitle: string;
    riskAwarenessText: string;
    explainableDecisionsTitle: string;
    explainableDecisionsText: string;
    footerText: string;
    networkError: string;
}

export const copy: Record<Lang, Translations> = {
    en: {
        dashboard: "Dashboard",
        create: "Create Scenario",
        scenarios: "My Scenarios",
        compare: "Compare",
        insights: "Insights",
        tryDemo: "Try Demo",
        heroKicker: "SCENARIO & DECISION SIMULATOR",
        heroTitle: "What if your farming conditions change?",
        heroText: "Explore different farming situations, compare expected outcomes, and understand financial, resource and weather risks before making decisions.",
        start: "Create Farming Scenario",
        demo: "Try Demo Scenario",
        continue: "Continue",
        welcome: "Welcome to FarmWise",
        welcomeText: "Test your farming decisions before you make them.",
        setup: "Farm Scenario Setup",
        setupSubtitle: "Set the conditions you want to test.",
        crop: "Crop",
        scenarioName: "Scenario Name",
        scenarioNamePlaceholder: "e.g. Kharif Crop Plan",
        state: "State",
        statePlaceholder: "e.g. Maharashtra",
        region: "Region / District",
        regionPlaceholder: "e.g. Kolhapur",
        soil: "Soil Type",
        size: "Farm Size (acres)",
        water: "Water Availability (%)",
        waterWord: "water",
        weather: "Weather Condition",
        planting: "Planting Schedule",
        fertilizer: "Fertilizer / Inputs",
        run: "Run Simulation",
        simulating: "Simulating...",
        reset: "Reset",
        results: "Simulation Results",
        yield: "Expected Yield",
        cost: "Estimated Cost",
        resource: "Water / Resource Use",
        risk: "Risk Level",
        factors: "Major Factors & Attributions",
        noFactorBreakdown: "No factor breakdown returned.",
        why: "Why this result?",
        defaultExplanation: "The simulation engine returned the scenario outcome based on the selected inputs.",
        disclaimer: "FarmWise displays deterministic calculations from the backend SimulationEngine.",
        whatif: "What-If Simulator",
        live: "Live",
        runWhatIf: "Run What-If",
        base: "Base",
        scenario: "What-If",
        whatifScenarioName: "What-If Scenario",
        compareTitle: "Scenario Comparison",
        compareSubtitle: "Compare saved farming decisions side-by-side to understand trade-offs.",
        scenarioCol: "Scenario",
        suggestions: "Smart Suggestions",
        ruleBased: "Rule-based",
        apply: "Apply & Simulate",
        noScenario: "Run a simulation to see results.",
        noSuggestions: "No immediate suggestion for these conditions.",
        sugWater: "Water availability is low. Increase water allocation to reduce moisture stress.",
        sugPlanting: "Try the optimal planting schedule to compare simulated yield improvements.",
        sugFertilizer: "Switch to recommended fertilizer level to optimize nutrient efficiency.",
        sugWeather: "Compare with normal seasonal weather conditions to test baseline stability.",
        sugWaterName: "Suggested Water",
        sugPlantingName: "Suggested Planting",
        sugFertilizerName: "Suggested Inputs",
        sugWeatherName: "Normal Weather",
        baseScenario: "Base Scenario",
        demoScenario: "Demo Scenario",
        defaultScenarioName: "Scenario",
        saved: "Saved scenarios",
        open: "Open",
        statFeatures: "Decision features",
        statLanguages: "Languages",
        statRules: "Transparent rules",
        language: "Language",
        logout: "Back to welcome",
        low: "Low",
        medium: "Medium",
        high: "High",
        unknown: "Unknown",
        yieldUnit: "t/ha",
        waterUnit: "m³",
        factorSoil: "Soil Compatibility",
        factorWater: "Water Availability",
        factorWeather: "Weather Condition",
        factorPlanting: "Planting Schedule",
        factorFertilizer: "Fertilizer / Inputs",
        directionPositive: "positive",
        directionNegative: "negative",
        directionNeutral: "neutral",
        explanationPrefix: "Based on selected farm conditions, the simulation estimates an expected yield of",
        explanationCost: "with an estimated cost of",
        explanationRisk: "Risk is evaluated as",
        insightsTitle: "Understand your simulation",
        factorAnalysisTitle: "Factor Analysis",
        insightsText: "Change one condition at a time and compare how the simulated outcome and factor attributions change.",
        resourceAwarenessTitle: "Resource Awareness",
        resourceAwarenessText: "Compare water and resource consumption alongside expected yield and cost instead of looking at yield alone.",
        riskAwarenessTitle: "Multi-Factor Risk Assessment",
        riskAwarenessText: "Risk is evaluated across water stress, weather anomalies, planting schedule, soil compatibility, and fertilizer intensity.",
        explainableDecisionsTitle: "Explainable Decisions",
        explainableDecisionsText: "FarmWise provides deterministic, auditable factor attributions and transparent trade-off metrics.",
        footerText: "Test your farming decisions before you make them.",
        networkError: "Unable to connect to the backend simulation engine. Please ensure FastAPI is running on port 8000.",
    },
    mr: {
        dashboard: "डॅशबोर्ड",
        create: "परिस्थिती तयार करा",
        scenarios: "माझ्या परिस्थिती",
        compare: "तुलना",
        insights: "अंतर्दृष्टी",
        tryDemo: "डेमो वापरा",
        heroKicker: "परिस्थिती व निर्णय सिम्युलेटर",
        heroTitle: "तुमच्या शेतीच्या परिस्थितीत बदल झाला तर?",
        heroText: "वेगवेगळ्या शेती परिस्थिती तपासा, अपेक्षित परिणामांची तुलना करा आणि आर्थिक, संसाधन व हवामान जोखीम समजून घ्या.",
        start: "शेतीची परिस्थिती तयार करा",
        demo: "डेमो परिस्थिती वापरा",
        continue: "पुढे जा",
        welcome: "FarmWise मध्ये स्वागत",
        welcomeText: "निर्णय घेण्यापूर्वी शेतीचे निर्णय तपासा.",
        setup: "शेती परिस्थिती सेटअप",
        setupSubtitle: "तुम्हाला तपासायच्या असलेल्या शेती परिस्थिती निश्चित करा.",
        crop: "पीक",
        scenarioName: "परिस्थितीचे नाव",
        scenarioNamePlaceholder: "उदा. खरीप पीक नियोजन",
        state: "राज्य",
        statePlaceholder: "उदा. महाराष्ट्र",
        region: "प्रदेश / जिल्हा",
        regionPlaceholder: "उदा. कोल्हापूर",
        soil: "मातीचा प्रकार",
        size: "शेताचे क्षेत्रफळ (एकर)",
        water: "पाण्याची उपलब्धता (%)",
        waterWord: "पाणी",
        weather: "हवामान स्थिती",
        planting: "लागवड वेळापत्रक",
        fertilizer: "खते / इनपुट",
        run: "सिम्युलेशन करा",
        simulating: "सिम्युलेशन सुरू आहे...",
        reset: "रीसेट",
        results: "सिम्युलेशन निकाल",
        yield: "अपेक्षित उत्पादन",
        cost: "अंदाजे खर्च",
        resource: "पाणी / संसाधन वापर",
        risk: "जोखीम पातळी",
        factors: "मुख्य घटक व विश्लेषण",
        noFactorBreakdown: "कोणतेही घटक विश्लेषण मिळालेले नाही.",
        why: "हा निकाल का आला?",
        defaultExplanation: "सिम्युलेशन इंजिनने निवडलेल्या इनपुटच्या आधारे परिस्थितीचा निकाल दिला आहे.",
        disclaimer: "FarmWise बॅकएंड सिम्युलेशन इंजिनमधील निश्चित गणना प्रदर्शित करते.",
        whatif: "What-If सिम्युलेटर",
        live: "थेट",
        runWhatIf: "What-If चालवा",
        base: "मूळ",
        scenario: "What-If",
        whatifScenarioName: "What-If परिस्थिती",
        compareTitle: "परिस्थिती तुलना",
        compareSubtitle: "तडजोड समजून घेण्यासाठी जतन केलेल्या शेती निर्णयांची समोरासमोर तुलना करा.",
        scenarioCol: "परिस्थिती",
        suggestions: "स्मार्ट सूचना",
        ruleBased: "नियम-आधारित",
        apply: "लागू करा व सिम्युलेट करा",
        noScenario: "निकाल पाहण्यासाठी सिम्युलेशन करा.",
        noSuggestions: "या परिस्थितीसाठी सध्या विशेष सूचना नाही.",
        sugWater: "पाण्याची उपलब्धता कमी आहे. पाण्याचा ताण कमी करण्यासाठी पाण्याची उपलब्धता वाढवा.",
        sugPlanting: "सिम्युलेटेड परिणामांची तुलना करण्यासाठी योग्य लागवड वेळापत्रक निवडा.",
        sugFertilizer: "खतांची कार्यक्षमता वाढवण्यासाठी शिफारस केलेल्या खताची पातळी निवडा.",
        sugWeather: "अपेक्षित मूळ परिणाम पाहण्यासाठी सामान्य हंगामी हवामानाशी तुलना करा.",
        sugWaterName: "सुचवलेले पाणी",
        sugPlantingName: "सुचवलेली लागवड",
        sugFertilizerName: "सुचवलेली खते",
        sugWeatherName: "सामान्य हवामान",
        baseScenario: "मूळ परिस्थिती",
        demoScenario: "डेमो परिस्थिती",
        defaultScenarioName: "परिस्थिती",
        saved: "जतन केलेल्या परिस्थिती",
        open: "उघडा",
        statFeatures: "निर्णय वैशिष्ट्ये",
        statLanguages: "भाषा",
        statRules: "पारदर्शक नियम",
        language: "भाषा",
        logout: "स्वागत पृष्ठावर जा",
        low: "कमी",
        medium: "मध्यम",
        high: "जास्त",
        unknown: "अज्ञात",
        yieldUnit: "टन/हे.",
        waterUnit: "m³",
        factorSoil: "माती अनुकूलता",
        factorWater: "पाण्याची उपलब्धता",
        factorWeather: "हवामान स्थिती",
        factorPlanting: "लागवड वेळापत्रक",
        factorFertilizer: "खते / इनपुट",
        directionPositive: "वाढ (+)",
        directionNegative: "घट (-)",
        directionNeutral: "स्थिर",
        explanationPrefix: "निवडलेल्या शेती परिस्थितीनुसार, सिम्युलेशनने अंदाजे उत्पादन नोंदवले आहे:",
        explanationCost: "आणि अंदाजे खर्च:",
        explanationRisk: "जोखीम पातळी:",
        insightsTitle: "तुमचे सिम्युलेशन समजून घ्या",
        factorAnalysisTitle: "घटक विश्लेषण",
        insightsText: "एकावेळी एक परिस्थिती बदला आणि सिम्युलेटेड परिणामांची तुलना करा.",
        resourceAwarenessTitle: "संसाधन जागरूकता",
        resourceAwarenessText: "केवळ उत्पादनाकडे पाहण्याऐवजी अपेक्षित उत्पादन आणि खर्चासोबत पाणी/संसाधन वापराची तुलना करा.",
        riskAwarenessTitle: "बहु-घटक जोखीम मूल्यांकन",
        riskAwarenessText: "पाण्याचा ताण, हवामानातील तफावत, लागवड वेळ, माती अनुकूलता आणि खत प्रमाणावर जोखीम मोजली जाते.",
        explainableDecisionsTitle: "स्पष्टीकरणात्मक निर्णय",
        explainableDecisionsText: "FarmWise निश्चित आणि पारदर्शक नियमांच्या आधारे निर्णयांचे स्पष्टीकरण देते.",
        footerText: "निर्णय घेण्यापूर्वी शेतीचे निर्णय तपासा.",
        networkError: "बॅकएंड सिम्युलेशन इंजिनशी संपर्क साधता आला नाही. कृपया खात्री करा की FastAPI सर्व्हर पोर्ट ८००० वर सुरू आहे.",
    },
    hi: {
        dashboard: "डैशबोर्ड",
        create: "परिदृश्य बनाएं",
        scenarios: "मेरे परिदृश्य",
        compare: "तुलना",
        insights: "जानकारी",
        tryDemo: "डेमो चलाएं",
        heroKicker: "परिदृश्य और निर्णय सिम्युलेटर",
        heroTitle: "अगर आपकी खेती की परिस्थितियां बदल जाएं तो?",
        heroText: "अलग-अलग खेती की परिस्थितियों को जांचें, परिणामों की तुलना करें और वित्तीय, संसाधन तथा मौसम जोखिम समझें।",
        start: "खेती का परिदृश्य बनाएं",
        demo: "डेमो परिदृश्य चलाएं",
        continue: "आगे बढ़ें",
        welcome: "FarmWise में आपका स्वागत है",
        welcomeText: "निर्णय लेने से पहले अपनी खेती के फैसलों को जांचें।",
        setup: "खेती परिदृश्य सेटअप",
        setupSubtitle: "वे परिस्थितियां निर्धारित करें जिनका आप परीक्षण करना चाहते हैं।",
        crop: "फसल",
        scenarioName: "परिदृश्य का नाम",
        scenarioNamePlaceholder: "उदा. खरीफ फसल योजना",
        state: "राज्य",
        statePlaceholder: "उदा. महाराष्ट्र",
        region: "क्षेत्र / जिला",
        regionPlaceholder: "उदा. कोल्हापुर",
        soil: "मिट्टी का प्रकार",
        size: "खेत का आकार (एकड़)",
        water: "पानी उपलब्धता (%)",
        waterWord: "पानी",
        weather: "मौसम की स्थिति",
        planting: "बुवाई का समय",
        fertilizer: "उर्वरक / इनपुट",
        run: "सिमुलेशन चलाएं",
        simulating: "सिमुलेशन जारी है...",
        reset: "रीसेट",
        results: "सिमुलेशन परिणाम",
        yield: "अपेक्षित उपज",
        cost: "अनुमानित लागत",
        resource: "पानी / संसाधन उपयोग",
        risk: "जोखिम का स्तर",
        factors: "मुख्य कारक और विश्लेषण",
        noFactorBreakdown: "कोई कारक विश्लेषण उपलब्ध नहीं।",
        why: "यह परिणाम क्यों आया?",
        defaultExplanation: "सिमुलेशन इंजन ने चुने गए इनपुट के आधार पर परिदृश्य परिणाम दिया है।",
        disclaimer: "FarmWise बैकएंड सिमुलेशन इंजन की सटीक गणनाएं प्रदर्शित करता है।",
        whatif: "What-If सिम्युलेटर",
        live: "लाइव",
        runWhatIf: "What-If चलाएं",
        base: "मूल",
        scenario: "What-If",
        whatifScenarioName: "What-If परिदृश्य",
        compareTitle: "परिदृश्य तुलना",
        compareSubtitle: "सहेजे गए कृषि निर्णयों की साथ-साथ तुलना करें और सही निर्णय लें।",
        scenarioCol: "परिदृश्य",
        suggestions: "स्मार्ट सुझाव",
        ruleBased: "नियम-आधारित",
        apply: "लागू करें और सिमुलेट करें",
        noScenario: "परिणाम देखने के लिए सिमुलेशन चलाएं।",
        noSuggestions: "इन परिस्थितियों के लिए अभी कोई विशेष सुझाव नहीं।",
        sugWater: "पानी की उपलब्धता कम है। नमी का तनाव कम करने के लिए पानी की मात्रा बढ़ाएं।",
        sugPlanting: "सिमुलेटेड परिणामों की तुलना करने के लिए उचित बुवाई समय चुनें।",
        sugFertilizer: "पोषक तत्वों की दक्षता बढ़ाने के लिए अनुशंसित उर्वरक स्तर चुनें।",
        sugWeather: "अपेक्षित आधारभूत परिणाम देखने के लिए सामान्य मौसमी परिस्थितियों से तुलना करें।",
        sugWaterName: "सुझाया गया पानी",
        sugPlantingName: "सुझाई गई बुवाई",
        sugFertilizerName: "सुझाए गए उर्वरक",
        sugWeatherName: "सामान्य मौसम",
        baseScenario: "मूल परिदृश्य",
        demoScenario: "डेमो परिदृश्य",
        defaultScenarioName: "परिदृश्य",
        saved: "सहेजे गए परिदृश्य",
        open: "खोलें",
        statFeatures: "निर्णय विशेषताएं",
        statLanguages: "भाषाएं",
        statRules: "पारदर्शी नियम",
        language: "भाषा",
        logout: "स्वागत पृष्ठ पर जाएं",
        low: "कम",
        medium: "मध्यम",
        high: "अधिक",
        unknown: "अज्ञात",
        yieldUnit: "टन/हे.",
        waterUnit: "m³",
        factorSoil: "मिट्टी अनुकूलता",
        factorWater: "पानी की उपलब्धता",
        factorWeather: "मौसम की स्थिति",
        factorPlanting: "बुवाई का समय",
        factorFertilizer: "उर्वरक / इनपुट",
        directionPositive: "वृद्धि (+)",
        directionNegative: "कमी (-)",
        directionNeutral: "स्थिर",
        explanationPrefix: "चयनित परिस्थितियों के आधार पर, सिमुलेशन ने अनुमानित उपज आंकी है:",
        explanationCost: "और अनुमानित लागत:",
        explanationRisk: "जोखिम का स्तर:",
        insightsTitle: "अपना सिमुलेशन समझें",
        factorAnalysisTitle: "कारक विश्लेषण",
        insightsText: "एक समय में एक स्थिति बदलें और सिमुलेटेड परिणामों व कारकों की तुलना करें।",
        resourceAwarenessTitle: "संसाधन जागरूकता",
        resourceAwarenessText: "केवल उपज देखने के बजाय अपेक्षित उपज और लागत के साथ पानी/संसाधन उपयोग की तुलना करें।",
        riskAwarenessTitle: "बहु-कारक जोखिम मूल्यांकन",
        riskAwarenessText: "पानी का तनाव, मौसम की विसंगति, बुवाई का समय, मिट्टी की अनुकूलता और उर्वरक उपयोग पर जोखिम आंका जाता है।",
        explainableDecisionsTitle: "पारदर्शी और स्पष्ट निर्णय",
        explainableDecisionsText: "FarmWise सटीक सिमुलेशन द्वारा प्राप्त कारक और स्पष्टीकरण प्रदान करता है।",
        footerText: "निर्णय लेने से पहले अपनी खेती के फैसलों को जांचें।",
        networkError: "बैकएंड सिमुलेशन इंजन से कनेक्ट नहीं हो सका। कृपया सुनिश्चित करें कि FastAPI सर्वर पोर्ट 8000 पर चल रहा है।",
    },
};

const cropOptions: { value: string; label: Record<Lang, string> }[] = [
    { value: "wheat", label: { en: "Wheat", mr: "गहू", hi: "गेहूं" } },
    { value: "rice", label: { en: "Rice", mr: "भात (तांदूळ)", hi: "चावल (धान)" } },
    { value: "maize", label: { en: "Maize", mr: "मका", hi: "मक्का" } },
    { value: "sugarcane", label: { en: "Sugarcane", mr: "ऊस", hi: "गन्ना" } },
    { value: "cotton", label: { en: "Cotton", mr: "कापूस", hi: "कपास" } },
    { value: "soybean", label: { en: "Soybean", mr: "सोयाबीन", hi: "सोयाबीन" } },
    { value: "groundnut", label: { en: "Groundnut", mr: "भुईमूग", hi: "मूंगफली" } },
    { value: "jowar", label: { en: "Jowar", mr: "ज्वारी", hi: "ज्वार" } },
];

const soilOptions: { value: string; label: Record<Lang, string> }[] = [
    { value: "black soil", label: { en: "Black soil (Vertisol)", mr: "काळी माती (रेगूर)", hi: "काली मिट्टी (रेगुर)" } },
    { value: "alluvial soil", label: { en: "Alluvial loam", mr: "गाळाची माती (दोमट)", hi: "जलोढ़ दोमट मिट्टी" } },
    { value: "red soil", label: { en: "Red sandy loam", mr: "लाल वालुकामय माती", hi: "लाल रेतीली दोमट" } },
    { value: "clay loam", label: { en: "Clay loam", mr: "चिकणमाती", hi: "चिकनी दोमट मिट्टी" } },
    { value: "sandy soil", label: { en: "Sandy soil", mr: "वालुकामय माती", hi: "रेतीली मिट्टी" } },
];

const weatherOptions: { value: string; label: Record<Lang, string> }[] = [
    { value: "normal", label: { en: "Normal / Seasonal Average", mr: "सामान्य / सरासरी हवामान", hi: "सामान्य / मौसमी औसत" } },
    { value: "dry", label: { en: "Dry / Severe Drought", mr: "कोरडे / दुष्काळ सदृश", hi: "शुष्क / सूखा" } },
    { value: "rainy", label: { en: "Rainy / Unseasonal Rain", mr: "पावसाळी / अवकाळी पाऊस", hi: "बरसात / बेमौसम बारिश" } },
    { value: "extreme", label: { en: "Extreme / Heatwave", mr: "अतिविषम / उष्णतेची लाट", hi: "अत्यधिक / लू (तेज गर्मी)" } },
];

const plantingOptions: { value: string; label: Record<Lang, string> }[] = [
    { value: "optimal", label: { en: "Optimal (Recommended)", mr: "योग्य वेळ (शिफारस केलेली)", hi: "उचित समय (अनुशंसित)" } },
    { value: "early", label: { en: "Early Planting", mr: "लवकर लागवड", hi: "जल्दी बुवाई" } },
    { value: "late", label: { en: "Late Planting", mr: "उशिरा लागवड", hi: "देरी से बुवाई" } },
];

const fertilizerOptions: { value: string; label: Record<Lang, string> }[] = [
    { value: "recommended", label: { en: "Recommended (Balanced)", mr: "शिफारस केलेले (संतुलित)", hi: "अनुशंसित (संतुलित)" } },
    { value: "low", label: { en: "Low Inputs", mr: "कमी खते", hi: "कम उर्वरक" } },
    { value: "high", label: { en: "High Inputs", mr: "जास्त खते", hi: "अधिक उर्वरक" } },
];

function translateCrop(val: string, l: Lang): string {
    const found = cropOptions.find((c) => c.value.toLowerCase() === String(val || "").toLowerCase());
    return found ? found.label[l] : val;
}

function translateWeather(val: string, l: Lang): string {
    const v = String(val || "").toLowerCase();
    const found = weatherOptions.find((w) => w.value.toLowerCase() === v || v.includes(w.value));
    return found ? found.label[l] : val;
}

function translateFactorName(name: string, t: Translations): string {
    const lower = String(name || "").toLowerCase();
    if (lower.includes("soil")) return t.factorSoil;
    if (lower.includes("water")) return t.factorWater;
    if (lower.includes("weather")) return t.factorWeather;
    if (lower.includes("planting")) return t.factorPlanting;
    if (lower.includes("fertilizer") || lower.includes("input")) return t.factorFertilizer;
    return name;
}

function translateDirection(direction: string, t: Translations): string {
    const d = String(direction || "").toLowerCase();
    if (d.includes("pos")) return t.directionPositive;
    if (d.includes("neg")) return t.directionNegative;
    return t.directionNeutral;
}

function translateScenarioName(name: string, t: Translations): string {
    if (!name) return t.defaultScenarioName;
    if (name === "Base Scenario") return t.baseScenario;
    if (name === "Demo Scenario") return t.demoScenario;
    if (name === "What-If" || name === "What-If Scenario") return t.whatifScenarioName;
    if (name === "Suggested Water") return t.sugWaterName;
    if (name === "Suggested Planting") return t.sugPlantingName;
    if (name === "Suggested Inputs") return t.sugFertilizerName;
    if (name === "Normal Weather") return t.sugWeatherName;
    return name;
}

const defaults: FarmInputs = {
    crop: "wheat",
    scenario_name: "Base Scenario",
    state: "Maharashtra",
    region: "Kolhapur",
    soil: "black soil",
    farm_size_acres: 5,
    farm_size_ha: 2.023,
    water_availability: 100,
    weather: "normal",
    planting_date: "optimal",
    planting_schedule: "optimal",
    fertilizer: "recommended",
    input_usage: "recommended",
};

function num(v: unknown): number | null {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function resultValue(r: SimulationResult | null, keys: string[]) {
    if (!r) return null;
    for (const k of keys) {
        const x = num(r.raw?.[k]);
        if (x !== null) return x;
    }
    return null;
}

function metric(r: SimulationResult | null, kind: "yield" | "cost" | "water") {
    if (!r) return null;
    if (kind === "yield") return r.yieldValue ?? resultValue(r, ["yield", "expected_yield", "final_yield"]);
    if (kind === "cost") return r.cost ?? resultValue(r, ["cost", "estimated_cost", "total_cost"]);
    return r.water ?? resultValue(r, ["water", "water_used", "water_usage"]);
}

function getLocalizedExplanation(r: SimulationResult | null, lang: Lang, t: Translations): string {
    if (!r) return t.defaultExplanation;
    const y = metric(r, "yield");
    const c = metric(r, "cost");
    const riskLabel = formatRiskText(r.risk, t);

    // If explanation is the default English string or empty, produce localized explanation
    const rawExp = String(r.explanation || "");
    if (!rawExp || rawExp.includes("The simulation estimates") || rawExp.includes("based on the selected farm conditions")) {
        if (lang === "mr") {
            return `${t.explanationPrefix} ${y ?? "—"} ${t.yieldUnit}, ${t.explanationCost} ₹${c?.toLocaleString("en-IN") ?? "—"}. ${t.explanationRisk} ${riskLabel}. ${t.disclaimer}`;
        }
        if (lang === "hi") {
            return `${t.explanationPrefix} ${y ?? "—"} ${t.yieldUnit}, ${t.explanationCost} ₹${c?.toLocaleString("en-IN") ?? "—"}। ${t.explanationRisk} ${riskLabel}। ${t.disclaimer}`;
        }
        return `${t.explanationPrefix} ${y ?? "—"} ${t.yieldUnit}, ${t.explanationCost} ₹${c?.toLocaleString("en-IN") ?? "—"}. ${t.explanationRisk} ${riskLabel}. ${t.disclaimer}`;
    }
    return rawExp;
}

function formatRiskText(text: string, t: Translations): string {
    const x = String(text || "Unknown").toLowerCase();
    if (x.includes("high")) return text.replace(/high/i, t.high);
    if (x.includes("medium") || x.includes("moderate")) return text.replace(/medium|moderate/i, t.medium);
    if (x.includes("low")) return text.replace(/low/i, t.low);
    if (x.includes("unknown")) return text.replace(/unknown/i, t.unknown);
    return text;
}

export default function App() {
    const [lang, setLang] = useState<Lang>("en");
    const t = copy[lang];
    const [welcome, setWelcome] = useState(true);
    const [page, setPage] = useState<"dashboard" | "create" | "scenarios" | "compare" | "insights">("dashboard");
    const [inputs, setInputs] = useState<FarmInputs>(defaults);
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [whatIf, setWhatIf] = useState<SimulationResult | null>(null);
    const [water, setWater] = useState(120);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [history, setHistory] = useState<{ name: string; inputs: FarmInputs; result: SimulationResult }[]>([]);

    const set = (key: string, value: unknown) =>
        setInputs((p) => ({ ...p, [key]: value }));

    const run = async (next = inputs, save = true) => {
        setBusy(true);
        setError("");
        try {
            const r = await simulate(next);
            setResult(r);
            if (save) {
                const sName = String(next.scenario_name || t.defaultScenarioName);
                setHistory((h) => [
                    ...h.filter((x) => x.name !== sName),
                    { name: sName, inputs: next, result: r },
                ].slice(-6));
            }
            setPage("create");
            return r;
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
                setError(t.networkError);
            } else {
                setError(msg);
            }
            return null;
        } finally {
            setBusy(false);
        }
    };

    const demo = () => run({ ...defaults, scenario_name: "Demo Scenario", water_availability: 120 });
    const reset = () => {
        setInputs(defaults);
        setResult(null);
        setWhatIf(null);
        setError("");
    };

    const suggestions = useMemo(() => {
        const out: { text: string; next: FarmInputs }[] = [];
        const w = Number(inputs.water_availability);
        if (Number.isFinite(w) && w < 90)
            out.push({ text: t.sugWater, next: { ...inputs, water_availability: Math.min(100, w + 20), scenario_name: "Suggested Water" } });
        if (inputs.planting_date !== "optimal" && inputs.planting_schedule !== "optimal")
            out.push({ text: t.sugPlanting, next: { ...inputs, planting_date: "optimal", planting_schedule: "optimal", scenario_name: "Suggested Planting" } });
        if (inputs.fertilizer !== "recommended" && inputs.input_usage !== "recommended")
            out.push({ text: t.sugFertilizer, next: { ...inputs, fertilizer: "recommended", input_usage: "recommended", scenario_name: "Suggested Inputs" } });
        if (inputs.weather !== "normal")
            out.push({ text: t.sugWeather, next: { ...inputs, weather: "normal", scenario_name: "Normal Weather" } });
        return out;
    }, [inputs, t]);

    if (welcome) {
        return (
            <div className="fw-welcome">
                <style>{styles}</style>
                <div className="welcome-overlay">
                    <div className="welcome-card">
                        <div className="logo">🌿</div>
                        <div className="brand">Farm<span>Wise</span></div>
                        <p>{t.welcomeText}</p>
                        <button className="primary big" onClick={() => setWelcome(false)}>{t.continue} →</button>
                        <div className="langs">
                            {(["en", "mr", "hi"] as Lang[]).map((x) => (
                                <button className={lang === x ? "lang active" : "lang"} onClick={() => setLang(x)} key={x}>
                                    {x === "en" ? "English" : x === "mr" ? "मराठी" : "हिन्दी"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <style>{styles}</style>

            <header className="nav">
                <div className="brand"><span className="leaf">🌿</span> Farm<span>Wise</span></div>
                <div className="navlinks">
                    {[
                        ["dashboard", t.dashboard], ["create", t.create], ["scenarios", t.scenarios],
                        ["compare", t.compare], ["insights", t.insights],
                    ].map(([id, label]) => (
                        <button className={page === id ? "navbtn selected" : "navbtn"} onClick={() => setPage(id as typeof page)} key={id}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="navright">
                    {(["en", "mr", "hi"] as Lang[]).map((x) => (
                        <button className={lang === x ? "lang active" : "lang"} onClick={() => setLang(x)} key={x}>
                            {x === "en" ? "English" : x === "mr" ? "मराठी" : "हिन्दी"}
                        </button>
                    ))}
                    <button className="outline" onClick={() => setWelcome(true)} title={t.logout}>↩</button>
                </div>
            </header>

            {page === "dashboard" && (
                <>
                    <section className="hero">
                        <div className="hero-content">
                            <div className="kicker">{t.heroKicker}</div>
                            <h1>{t.heroTitle}</h1>
                            <p>{t.heroText}</p>
                            <div className="hero-actions">
                                <button className="primary" onClick={() => setPage("create")}>{t.start} →</button>
                                <button className="glass" onClick={demo}>{t.demo}</button>
                            </div>
                        </div>
                        <div className="hero-art">
                            <div className="sun">☀️</div><div className="hill h1" /><div className="hill h2" />
                            <div className="crop">🌾 🌾 🌾</div>
                        </div>
                    </section>

                    <section className="stats">
                        <div><b>{history.length}</b><span>{t.saved}</span></div>
                        <div><b>11</b><span>{t.statFeatures}</span></div>
                        <div><b>3</b><span>{t.statLanguages}</span></div>
                        <div><b>100%</b><span>{t.statRules}</span></div>
                    </section>

                    {result && (
                        <section className="section">
                            <div className="section-head"><h2>{t.results}</h2><button className="outline" onClick={() => setPage("create")}>{t.create} →</button></div>
                            <ResultCards r={result} t={t} lang={lang} />
                        </section>
                    )}
                </>
            )}

            {page === "create" && (
                <main className="section">
                    <div className="section-head">
                        <div>
                            <div className="kicker green">{t.create}</div>
                            <h2>{t.setup}</h2>
                            <p className="muted">{t.setupSubtitle}</p>
                        </div>
                        <button className="outline" onClick={reset}>{t.reset}</button>
                    </div>
                    <div className="grid2">
                        <div className="card">
                            <Field label={t.crop}>
                                <select value={inputs.crop} onChange={(e) => set("crop", e.target.value)}>
                                    {cropOptions.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label[lang]}</option>
                                    ))}
                                </select>
                            </Field>
                            <div className="twofields">
                                <Field label={t.state}><input value={inputs.state || ""} placeholder={t.statePlaceholder} onChange={(e) => set("state", e.target.value)} /></Field>
                                <Field label={t.region}><input value={inputs.region || ""} placeholder={t.regionPlaceholder} onChange={(e) => set("region", e.target.value)} /></Field>
                            </div>
                            <Field label={t.soil}>
                                <select value={inputs.soil || ""} onChange={(e) => set("soil", e.target.value)}>
                                    {soilOptions.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label[lang]}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label={t.size}><input type="number" min="0.1" step="0.1" value={inputs.farm_size_acres ?? ""} onChange={(e) => set("farm_size_acres", Number(e.target.value))} /></Field>
                            <label className="field"><span>{t.water}: <b>{inputs.water_availability}%</b></span><input type="range" min="0" max="150" value={Number(inputs.water_availability)} onChange={(e) => set("water_availability", Number(e.target.value))} /></label>
                        </div>
                        <div className="card">
                            <Field label={t.weather}>
                                <select value={inputs.weather} onChange={(e) => set("weather", e.target.value)}>
                                    {weatherOptions.map((w) => (
                                        <option key={w.value} value={w.value}>{w.label[lang]}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label={t.planting}>
                                <select value={inputs.planting_date} onChange={(e) => { set("planting_date", e.target.value); set("planting_schedule", e.target.value); }}>
                                    {plantingOptions.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label[lang]}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label={t.fertilizer}>
                                <select value={inputs.fertilizer} onChange={(e) => { set("fertilizer", e.target.value); set("input_usage", e.target.value); }}>
                                    {fertilizerOptions.map((f) => (
                                        <option key={f.value} value={f.value}>{f.label[lang]}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label={t.scenarioName}><input value={inputs.scenario_name || ""} placeholder={t.scenarioNamePlaceholder} onChange={(e) => set("scenario_name", e.target.value)} /></Field>
                            <button className="primary full" disabled={busy} onClick={() => run()}>{busy ? t.simulating : t.run} →</button>
                        </div>
                    </div>

                    {error && <div className="error">⚠ {error}</div>}
                    {result && <ResultCards r={result} t={t} lang={lang} />}

                    <div className="grid2 lower">
                        <div className="card">
                            <div className="card-title"><h3>{t.suggestions}</h3><span>{t.ruleBased}</span></div>
                            {suggestions.length === 0 ? <p className="muted">{t.noSuggestions}</p> : suggestions.map((s, i) => (
                                <div className="suggestion" key={i}><span>💡 {s.text}</span><button className="small" onClick={() => run(s.next)}>{t.apply}</button></div>
                            ))}
                        </div>
                        <div className="card">
                            <div className="card-title"><h3>{t.whatif}</h3><span>{t.live}</span></div>
                            <label className="field"><span>{t.water}: <b>{water}%</b></span><input type="range" min="0" max="150" value={water} onChange={(e) => setWater(Number(e.target.value))} /></label>
                            <button className="outline full" onClick={async () => {
                                const r = await run({ ...inputs, scenario_name: "What-If", water_availability: water }, false);
                                if (r) setWhatIf(r);
                            }}>{t.runWhatIf} →</button>
                            {whatIf && (
                                <div className="miniresult">
                                    <b>{t.base} → {t.scenario}</b>
                                    <span>{t.yield}: {metric(result, "yield") ?? "—"} → <b>{metric(whatIf, "yield") ?? "—"} {t.yieldUnit}</b></span>
                                    <span>{t.cost}: ₹{metric(result, "cost")?.toLocaleString("en-IN") ?? "—"} → <b>₹{metric(whatIf, "cost")?.toLocaleString("en-IN") ?? "—"}</b></span>
                                    <span>{t.resource}: {metric(result, "water") ?? "—"} → <b>{metric(whatIf, "water") ?? "—"} {t.waterUnit}</b></span>
                                    <span>{t.risk}: <Risk text={result?.risk ?? ""} t={t} /> → <b><Risk text={whatIf.risk} t={t} /></b></span>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            )}

            {page === "scenarios" && (
                <main className="section">
                    <div className="kicker green">{t.scenarios}</div><h2>{t.scenarios}</h2>
                    {history.length === 0 ? <div className="empty card">{t.noScenario}</div> :
                        <div className="scenario-list">{history.map((s) => (
                            <div className="card scenario-row" key={s.name}>
                                <div>
                                    <b>{translateScenarioName(s.name, t)}</b>
                                    <small>{translateCrop(s.inputs.crop, lang)} · {s.inputs.water_availability}% {t.waterWord} · {translateWeather(s.inputs.weather, lang)}</small>
                                </div>
                                <span>{metric(s.result, "yield") ?? "—"} {t.yieldUnit}</span>
                                <button className="small" onClick={() => { setInputs(s.inputs); setResult(s.result); setPage("create"); }}>{t.open}</button>
                            </div>
                        ))}</div>}
                </main>
            )}

            {page === "compare" && (
                <main className="section">
                    <div className="kicker green">{t.compare}</div><h2>{t.compareTitle}</h2>
                    <p className="muted">{t.compareSubtitle}</p>
                    {history.length < 1 ? <div className="empty card">{t.noScenario}</div> :
                        <div className="card tablewrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t.scenarioCol}</th>
                                        <th>{t.yield}</th>
                                        <th>{t.cost}</th>
                                        <th>{t.resource}</th>
                                        <th>{t.risk}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((s) => (
                                        <tr key={s.name}>
                                            <td><b>{translateScenarioName(s.name, t)}</b></td>
                                            <td>{metric(s.result, "yield") ?? "—"} {t.yieldUnit}</td>
                                            <td>₹{metric(s.result, "cost")?.toLocaleString("en-IN") ?? "—"}</td>
                                            <td>{metric(s.result, "water") ?? "—"} {t.waterUnit}</td>
                                            <td><Risk text={s.result.risk} t={t} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>}
                </main>
            )}

            {page === "insights" && (
                <main className="section">
                    <div className="kicker green">{t.insights}</div><h2>{t.insightsTitle}</h2>
                    <div className="insight-grid">
                        <div className="card"><div className="icon">🔍</div><h3>{t.factorAnalysisTitle}</h3><p>{t.insightsText}</p></div>
                        <div className="card"><div className="icon">💧</div><h3>{t.resourceAwarenessTitle}</h3><p>{t.resourceAwarenessText}</p></div>
                        <div className="card"><div className="icon">⚠️</div><h3>{t.riskAwarenessTitle}</h3><p>{t.riskAwarenessText}</p></div>
                        <div className="card"><div className="icon">💡</div><h3>{t.explainableDecisionsTitle}</h3><p>{t.explainableDecisionsText}</p></div>
                    </div>
                </main>
            )}

            <footer>🌿 FarmWise · {t.footerText}</footer>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="field"><span>{label}</span>{children}</label>;
}

function Risk({ text, t }: { text: string; t?: Translations }) {
    const x = String(text || "Unknown").toLowerCase();
    const cls = x.includes("high") ? "high" : x.includes("medium") || x.includes("moderate") ? "medium" : "low";
    const label = t ? formatRiskText(text, t) : text;
    return <span className={`risk ${cls}`}>{label}</span>;
}

function ResultCards({ r, t, lang }: { r: SimulationResult; t: Translations; lang: Lang }) {
    const y = metric(r, "yield");
    const c = metric(r, "cost");
    const w = metric(r, "water");
    const explanation = getLocalizedExplanation(r, lang, t);

    return (
        <section className="results">
            <div className="section-head"><h2>{t.results}</h2><Risk text={r.risk} t={t} /></div>
            <div className="metrics">
                <div className="metric"><span>🌾</span><small>{t.yield}</small><b>{y ?? "—"} {t.yieldUnit}</b></div>
                <div className="metric"><span>₹</span><small>{t.cost}</small><b>₹{c?.toLocaleString("en-IN") ?? "—"}</b></div>
                <div className="metric"><span>💧</span><small>{t.resource}</small><b>{w ?? "—"} {t.waterUnit}</b></div>
                <div className="metric"><span>⚠</span><small>{t.risk}</small><b><Risk text={r.risk} t={t} /></b></div>
            </div>
            <div className="grid2">
                <div className="card">
                    <h3>{t.factors}</h3>
                    {r.factors?.length ? r.factors.map((f, i) => (
                        <div className="factor" key={i}>
                            <span>
                                {translateFactorName(f.name, t)}
                                <small>{translateDirection(f.direction, t)} ({f.impact > 0 ? "+" : ""}{f.impact} {t.yieldUnit})</small>
                            </span>
                            <div className="bar">
                                <i style={{ width: `${Math.min(100, Math.max(5, Math.abs(Number(f.impact) || 0) * 50))}%` }} />
                            </div>
                        </div>
                    )) : <p className="muted">{t.noFactorBreakdown}</p>}
                </div>
                <div className="card">
                    <h3>{t.why}</h3>
                    <p className="reason">{explanation}</p>
                </div>
            </div>
        </section>
    );
}

const styles = `
*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#183126;background:#f4f8f3}button,input,select{font:inherit}.app{min-height:100vh;background:#f4f8f3}.fw-welcome{min-height:100vh;background:radial-gradient(circle at 75% 25%,#a9d8a0 0,transparent 30%),linear-gradient(135deg,#0b3b26,#145b36 48%,#082b1d);display:grid;place-items:center;position:relative;overflow:hidden}.fw-welcome:before{content:"🌾  🌿  🌾";position:absolute;font-size:120px;opacity:.1;bottom:5%;left:8%;transform:rotate(-8deg)}.welcome-overlay{padding:24px}.welcome-card{width:min(470px,92vw);background:#ffffffee;border-radius:28px;padding:42px;text-align:center;box-shadow:0 30px 80px #001f1238}.logo{font-size:48px}.brand{font-size:28px;font-weight:800;color:#143d2b}.brand span{color:#2f8a50}.welcome-card p{color:#62766b;margin:12px 0 28px}.langs{display:flex;gap:8px;justify-content:center;margin-top:22px}.nav{height:72px;background:#fff;border-bottom:1px solid #e2ebe4;display:flex;align-items:center;padding:0 5%;gap:28px;position:sticky;top:0;z-index:10}.nav .brand{margin-right:auto}.leaf{font-size:25px}.navlinks{display:flex;gap:4px}.navbtn,.lang{border:0;background:transparent;padding:9px 12px;border-radius:10px;color:#5e7167;cursor:pointer}.navbtn.selected,.navbtn:hover,.lang.active{background:#e7f4e9;color:#1f7b43;font-weight:700}.navright{display:flex;gap:4px;align-items:center}.hero{min-height:500px;background:linear-gradient(105deg,#0a3925 0%,#155d38 58%,#4a8f55 100%);color:#fff;display:flex;padding:70px 7%;position:relative;overflow:hidden}.hero:after{content:"";position:absolute;inset:auto -10% -55% 35%;height:500px;background:#87b96c33;border-radius:50%}.hero-content{width:min(680px);position:relative;z-index:2}.kicker{font-size:12px;letter-spacing:2px;font-weight:800;opacity:.75;margin-bottom:12px}.kicker.green{color:#2e8850;opacity:1}.hero h1{font-size:clamp(42px,6vw,74px);line-height:.98;margin:0 0 22px;letter-spacing:-3px}.hero p{font-size:18px;line-height:1.65;color:#d9e8dc;max-width:620px}.hero-actions{display:flex;gap:12px;margin-top:30px}.primary,.glass,.outline,.small{border:0;border-radius:12px;padding:12px 18px;cursor:pointer;font-weight:700}.primary{background:#2d9553;color:white;box-shadow:0 8px 20px #1d713d30}.primary:hover{background:#237e45}.primary.big{width:100%;padding:15px}.glass{background:#ffffff16;color:#fff;border:1px solid #ffffff45}.outline{background:#fff;border:1px solid #cfe0d3;color:#286c43}.hero-art{position:absolute;right:5%;bottom:0;width:40%;height:80%;opacity:.85}.sun{position:absolute;right:15%;top:5%;font-size:70px}.hill{position:absolute;border-radius:50% 50% 0 0;bottom:-25%;height:70%;width:100%}.h1{background:#2b7043;right:-20%}.h2{background:#174f32;left:-25%;bottom:-32%}.crop{position:absolute;bottom:18%;right:20%;font-size:35px;letter-spacing:10px}.stats{display:grid;grid-template-columns:repeat(4,1fr);background:#fff;box-shadow:0 8px 30px #0c40200c;margin:0 6%;transform:translateY(-30px);position:relative;z-index:3;border-radius:18px}.stats div{padding:24px;text-align:center;border-right:1px solid #e6eee8}.stats div:last-child{border:0}.stats b{display:block;font-size:25px;color:#216e40}.stats span{font-size:12px;color:#74877d}.section{padding:42px 6%;max-width:1400px;margin:auto}.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.section h2{font-size:30px;margin:4px 0 20px;color:#173c2b}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{background:#fff;border:1px solid #e2ebe4;border-radius:18px;padding:24px;box-shadow:0 8px 24px #16452a08}.field{display:block;margin-bottom:16px}.field>span{display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#4f6559;margin-bottom:7px}.field input,.field select{width:100%;border:1px solid #d5e1d8;border-radius:10px;padding:11px;background:#fbfdfb;color:#243b30;outline:none}.field input:focus,.field select:focus{border-color:#4a9c62}.twofields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.full{width:100%;margin-top:8px}.results{margin-top:30px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}.metric{background:#fff;border:1px solid #e2ebe4;border-radius:16px;padding:18px}.metric>span{font-size:25px}.metric small{display:block;color:#6c7d74;margin-top:8px}.metric b{display:block;font-size:20px;margin-top:3px;color:#1b5032}.factor{margin:14px 0}.factor>span{display:flex;justify-content:space-between;font-size:13px;font-weight:700}.factor small{color:#718177;font-weight:500}.bar{height:7px;background:#e7eee9;border-radius:10px;margin-top:7px;overflow:hidden}.bar i{display:block;height:100%;background:#55a968;border-radius:10px}.reason{line-height:1.7;color:#566960}.suggestion{display:flex;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid #edf2ee}.suggestion:last-child{border:0}.small{padding:8px 11px;background:#e8f5ea;color:#247541;white-space:nowrap}.card-title{display:flex;justify-content:space-between;align-items:center}.card-title span{font-size:11px;padding:5px 8px;border-radius:8px;background:#eef7ef;color:#438456}.miniresult{margin-top:16px;background:#f2f8f3;border-radius:12px;padding:12px;display:grid;gap:5px;font-size:13px}.risk{display:inline-block;border-radius:20px;padding:5px 10px;font-size:12px;font-weight:800;background:#e8f4ea;color:#267440}.risk.medium{background:#fff4dc;color:#a06a08}.risk.high{background:#fde8e5;color:#a53c32}.error{margin:18px 0;padding:14px;border-radius:12px;background:#fff0ee;color:#a33d33}.muted,.empty{color:#718078}.scenario-list{display:grid;gap:12px}.scenario-row{display:grid;grid-template-columns:1fr 150px 80px;align-items:center;gap:15px}.scenario-row small{display:block;color:#77857d;margin-top:4px}.tablewrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:15px;border-bottom:1px solid #e7eee8}th{font-size:12px;color:#708078;text-transform:uppercase}.insight-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.icon{font-size:30px}.insight-grid p{color:#687970;line-height:1.6}footer{text-align:center;padding:35px;color:#75857c;font-size:13px}.langs .lang{border:1px solid #d7e3da}.lower{margin-top:20px}@media(max-width:900px){.navlinks{display:none}.hero{min-height:560px;padding:55px 7%}.hero-art{opacity:.3;width:70%}.stats{grid-template-columns:repeat(2,1fr)}.metrics{grid-template-columns:repeat(2,1fr)}.grid2,.insight-grid{grid-template-columns:1fr}.scenario-row{grid-template-columns:1fr}.nav{padding:0 4%}.hero h1{letter-spacing:-1px}}@media(max-width:560px){.metrics{grid-template-columns:1fr}.stats{margin:0 4%}.hero-actions{flex-direction:column}.section{padding:30px 4%}.welcome-card{padding:30px}.twofields{grid-template-columns:1fr}}
`;
