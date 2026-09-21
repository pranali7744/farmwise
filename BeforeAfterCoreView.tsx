import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CROPS_DATA } from '../data/crops';
import { CropId } from '../types';
import { compareScenarios } from '../services/factorAnalysis';
import { getCropName } from '../utils/localization';
import { 
  Sprout, 
  Droplets, 
  CloudRain, 
  Thermometer, 
  Calendar, 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  Calculator, 
  History, 
  Scale, 
  BarChart3,
  Bot
} from 'lucide-react';

export const BeforeAfterCoreView: React.FC = () => {
  const { 
    activeScenario, 
    activeResult, 
    baselineScenario, 
    baselineResult, 
    updateScenario, 
    applyRecommendation, 
    resetToBaseline,
    setIsCalculationModalOpen,
    setIsCropProfileOpen,
    setIsHistoryDrawerOpen,
    setCurrentTab,
    language,
    t
  } = useApp();

  const comparison = compareScenarios(baselineResult, activeResult, language);
  const crop = activeResult.crop;
  const cropName = getCropName(crop, language);

  // Local state for acreage helper
  const [acresInput, setAcresInput] = useState<number>(activeScenario.landAreaAcres || 2);
  const [gunthasInput, setGunthasInput] = useState<number>(activeScenario.landAreaGunthas || 0);

  const handleCropChange = (cropId: CropId) => {
    const newCrop = CROPS_DATA[cropId];
    updateScenario(activeScenario.id, {
      cropId,
      rainfallMm: newCrop.normalRainfallMm,
      temperatureCelsius: newCrop.optimalTempCelsius,
      marketPricePerTonne: newCrop.marketPricePerTonne
    });
  };

  const handleAcresChange = (acres: number, gunthas: number) => {
    setAcresInput(acres);
    setGunthasInput(gunthas);
    const total = acres + (gunthas / 40);
    updateScenario(activeScenario.id, {
      landAreaAcres: Number(total.toFixed(2)),
      landAreaGunthas: gunthas
    });
  };

  const profitDiff = activeResult.estimatedProfit - baselineResult.estimatedProfit;
  const yieldDiffQuintals = activeResult.expectedYieldQuintals - baselineResult.expectedYieldQuintals;
  const activeRiskScore = activeResult.risk.totalRiskScore ?? 0;
  const baselineRiskScore = baselineResult.risk.totalRiskScore ?? 0;
  const riskDiff = activeRiskScore - baselineRiskScore;

  const rec = activeResult.actionRecommendation;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* 1. Hero AI Recommendation Banner (Prominent & Farmer-Actionable) */}
      {rec && (
        <div className={`p-4 sm:p-6 rounded-3xl border shadow-farmer transition-all ${
          rec.type === 'success' 
            ? 'bg-gradient-to-r from-emerald-900 to-farm-900 border-emerald-500 text-white' 
            : rec.type === 'warning'
            ? 'bg-gradient-to-r from-amber-950 via-farm-950 to-stone-900 border-amber-500/80 text-white'
            : 'bg-gradient-to-r from-rose-950 via-farm-950 to-stone-900 border-rose-500/80 text-white'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  rec.type === 'success' 
                    ? 'bg-emerald-400 text-emerald-950' 
                    : rec.type === 'warning'
                    ? 'bg-amber-400 text-amber-950'
                    : 'bg-rose-400 text-rose-950'
                }`}>
                  {language === 'mr' ? 'कृषी सल्लागार शिफारस' : language === 'hi' ? 'कृषि सलाहकार सिफ़ारिश' : 'AI Action Recommendation'}
                </span>
                {rec.profitImpactEstimate !== undefined && rec.profitImpactEstimate !== 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    rec.profitImpactEstimate > 0 
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30' 
                      : 'bg-rose-500/30 text-rose-300 border border-rose-400/30'
                  }`}>
                    {rec.profitImpactEstimate > 0 ? '+' : ''}₹{rec.profitImpactEstimate.toLocaleString('en-IN')} {language === 'mr' ? 'नफा फरक' : language === 'hi' ? 'मुनाफा असर' : 'profit impact'}
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black font-serif tracking-tight text-white">
                {rec.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                {rec.message}
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => applyRecommendation(rec)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-gray-100 text-gray-950 font-black text-xs sm:text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{rec.actionLabel}</span>
              </button>

              <button
                onClick={resetToBaseline}
                title={language === 'mr' ? 'मूळ ICAR सामान्य स्थितीत परत जा' : language === 'hi' ? 'मानक ICAR स्थिति में रीसेट करें' : 'Reset to ICAR Baseline'}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all text-xs font-bold flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Action Bar: Crop Switcher + Quick Tool Buttons */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-farm-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Crop Selection Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 mr-1">
            {language === 'mr' ? 'पीक निवडा:' : language === 'hi' ? 'फसल चुनें:' : 'Crop:'}
          </span>
          {(Object.keys(CROPS_DATA) as CropId[]).map((cId) => {
            const c = CROPS_DATA[cId];
            const isSelected = activeScenario.cropId === cId;
            return (
              <button
                key={cId}
                onClick={() => handleCropChange(cId)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-farm-700 text-white shadow-md ring-2 ring-farm-500 ring-offset-1'
                    : 'bg-farm-50 hover:bg-farm-100 text-gray-700 border border-farm-200'
                }`}
              >
                <span className="text-base">{c.icon}</span>
                <span>{getCropName(c, language)}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Utility Buttons: Crop Profile, Arithmetic Ledger, History, Ask AI */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsCropProfileOpen(true)}
            className="px-3 py-2 rounded-xl bg-farm-50 hover:bg-farm-100 border border-farm-300 text-farm-900 text-xs font-bold flex items-center space-x-1.5 transition-all"
            title="View ICAR benchmark standards & MSP"
          >
            <Sprout className="w-4 h-4 text-farm-700" />
            <span>{t.core?.cropProfileBtn || 'Crop Profile'}</span>
          </button>

          <button
            onClick={() => setIsCalculationModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-farm-50 hover:bg-farm-100 border border-farm-300 text-farm-900 text-xs font-bold flex items-center space-x-1.5 transition-all"
            title="Step-by-step arithmetic formulas"
          >
            <Calculator className="w-4 h-4 text-farm-700" />
            <span>{t.core?.howCalculatedBtn || 'How Calculated?'}</span>
          </button>

          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center space-x-1.5 transition-all"
            title="Timeline of simulated decisions"
          >
            <History className="w-4 h-4 text-gray-600" />
            <span>{t.core?.historyBtn || 'History'}</span>
          </button>

          <button
            onClick={() => setCurrentTab('ask')}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs"
            title="Ask AI questions about this simulation"
          >
            <Bot className="w-4 h-4" />
            <span>{t.nav.askAi}</span>
          </button>
        </div>
      </div>

      {/* 3. CORE BEFORE / AFTER SIDE-BY-SIDE HERO COMPARISON CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: BASELINE CONDITION (ICAR Benchmark Normal) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gray-100 text-gray-700 text-[11px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-wider border-b border-l border-gray-300">
            {language === 'mr' ? 'अधिकृत आधारभूत प्रमाण (ICAR)' : language === 'hi' ? 'आधिकारिक मानक स्थिति (ICAR)' : 'ICAR Optimal Benchmark'}
          </div>

          <div className="mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              {language === 'mr' ? 'मूळ संदर्भ (Before / Normal)' : language === 'hi' ? 'आधार संदर्भ (Before / Normal)' : 'Reference Baseline'}
            </span>
            <h3 className="text-xl font-black font-serif text-gray-900 mt-0.5">
              {cropName} • {baselineScenario.landAreaAcres} {language === 'mr' ? 'एकर' : language === 'hi' ? 'एकड़' : 'Acres'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'mr' 
                ? '१००% पाणी • वेळेवर पेरणी • सरासरी पाऊस • आदर्श तापमान' 
                : language === 'hi' 
                ? '१००% पानी • समय पर बुवाई • सामान्य बारिश • अनुकूल तापमान' 
                : '100% Water • Optimal Sowing • Normal Rain • Optimal Temp'}
            </p>
          </div>

          {/* Baseline Metric Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">
                {language === 'mr' ? 'अपेक्षित उत्पादन' : language === 'hi' ? 'अपेक्षित पैदावार' : 'Expected Yield'}
              </span>
              <div className="text-xl font-black text-gray-900 font-mono mt-0.5">
                {baselineResult.expectedYieldQuintals} <span className="text-xs font-semibold text-gray-600">Q</span>
              </div>
              <span className="text-[11px] text-gray-500 block">
                ({baselineResult.expectedYieldTonnes} T)
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 block uppercase">
                {language === 'mr' ? 'निव्वळ नफा' : language === 'hi' ? 'शुद्ध मुनाफा' : 'Net Profit'}
              </span>
              <div className="text-xl font-black text-emerald-950 font-mono mt-0.5">
                ₹{baselineResult.estimatedProfit.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-700 block">
                ({baselineResult.profitMarginPct}% मार्जिन)
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">
                {language === 'mr' ? 'एकूण खर्च' : language === 'hi' ? 'कुल लागत' : 'Total Cost'}
              </span>
              <div className="text-xl font-black text-gray-900 font-mono mt-0.5">
                ₹{baselineResult.costs.total.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-gray-500 block">
                (₹{baselineResult.costPerQuintal}/Q)
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-[10px] font-bold text-gray-500 block uppercase">
                {language === 'mr' ? 'जोखीम गुण' : language === 'hi' ? 'जोखिम स्कोर' : 'Risk Score'}
              </span>
              <div className="text-xl font-black text-gray-900 font-mono mt-0.5">
                {baselineResult.risk.overallScore} <span className="text-xs font-normal text-gray-500">/100</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                {language === 'mr' ? 'कमी धोका' : language === 'hi' ? 'कम जोखिम' : 'Low Risk'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{language === 'mr' ? 'बाजारभाव:' : language === 'hi' ? 'बाजार भाव:' : 'Price:'} ₹{baselineResult.marketPricePerQuintal}/क्विंटल (₹{baselineResult.marketPricePerTonne}/टन)</span>
            <span>{language === 'mr' ? 'पाणी गरज:' : language === 'hi' ? 'जल आवश्यकता:' : 'Water:'} {(baselineResult.waterRequiredLiters / 100000).toFixed(1)} लाख लिटर</span>
          </div>
        </div>

        {/* RIGHT: WHAT-IF SIMULATED CONDITION (Active Farmer Decisions) */}
        <div className="bg-white rounded-3xl p-6 border-2 border-farm-500 shadow-md relative overflow-hidden ring-2 ring-farm-100">
          <div className="absolute top-0 right-0 bg-farm-600 text-white text-[11px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-wider">
            {language === 'mr' ? 'आपला बदल (What-If Decision)' : language === 'hi' ? 'आपका सिमुलेशन (What-If)' : 'Simulated Scenario'}
          </div>

          <div className="mb-4">
            <span className="text-xs font-bold text-farm-700 uppercase tracking-wider block">
              {language === 'mr' ? 'नवीन नियोजन (After / Scenario)' : language === 'hi' ? 'नया परिदृश्य (After / Scenario)' : 'What-If Scenario'}
            </span>
            <h3 className="text-xl font-black font-serif text-farm-950 mt-0.5">
              {cropName} • {activeScenario.landAreaAcres} {language === 'mr' ? 'एकर' : language === 'hi' ? 'एकड़' : 'Acres'}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {activeScenario.waterAvailabilityPct}% {language === 'mr' ? 'पाणी' : language === 'hi' ? 'पानी' : 'Water'} • {activeScenario.rainfallMm || activeScenario.rainfall} mm {language === 'mr' ? 'पाऊस' : language === 'hi' ? 'बारिश' : 'Rain'} • {activeScenario.temperatureCelsius || activeScenario.temperature}°C • {activeScenario.plantingDate}
            </p>
          </div>

          {/* What-If Metric Matrix with Clear Deltas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            
            {/* Yield Metric with Delta */}
            <div className={`p-3 rounded-2xl border ${
              yieldDiffQuintals >= 0 
                ? 'bg-emerald-50/60 border-emerald-200' 
                : 'bg-rose-50/60 border-rose-200'
            }`}>
              <span className="text-[10px] font-bold text-gray-600 block uppercase">
                {language === 'mr' ? 'अपेक्षित उत्पादन' : language === 'hi' ? 'अपेक्षित पैदावार' : 'Expected Yield'}
              </span>
              <div className="text-xl font-black text-gray-900 font-mono mt-0.5">
                {activeResult.expectedYieldQuintals} <span className="text-xs font-semibold text-gray-600">Q</span>
              </div>
              
              {/* Delta Tag */}
              <div className={`text-[11px] font-bold flex items-center space-x-0.5 mt-0.5 ${
                yieldDiffQuintals >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {yieldDiffQuintals >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                <span>
                  {yieldDiffQuintals >= 0 ? '+' : ''}{yieldDiffQuintals.toFixed(1)} Q ({activeResult.yieldChangePct}%)
                </span>
              </div>
            </div>

            {/* Profit Metric with Delta */}
            <div className={`p-3 rounded-2xl border ${
              profitDiff >= 0 
                ? 'bg-emerald-50 border-emerald-300' 
                : 'bg-rose-50 border-rose-300'
            }`}>
              <span className="text-[10px] font-bold text-gray-600 block uppercase">
                {language === 'mr' ? 'निव्वळ नफा' : language === 'hi' ? 'शुद्ध मुनाफा' : 'Net Profit'}
              </span>
              <div className="text-xl font-black text-gray-950 font-mono mt-0.5">
                ₹{activeResult.estimatedProfit.toLocaleString('en-IN')}
              </div>

              {/* Delta Tag */}
              <div className={`text-[11px] font-bold flex items-center space-x-0.5 mt-0.5 ${
                profitDiff >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {profitDiff >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                <span>
                  {profitDiff >= 0 ? '+' : ''}₹{profitDiff.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Cost Metric */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-[10px] font-bold text-gray-600 block uppercase">
                {language === 'mr' ? 'एकूण खर्च' : language === 'hi' ? 'कुल लागत' : 'Total Cost'}
              </span>
              <div className="text-xl font-black text-gray-900 font-mono mt-0.5">
                ₹{activeResult.costs.total.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-gray-500 block">
                (₹{activeResult.costPerQuintal}/Q)
              </span>
            </div>

            {/* Risk Metric with Delta */}
            <div className={`p-3 rounded-2xl border ${
              activeResult.risk.totalRiskScore > 40 ? 'bg-rose-50 border-rose-200' : 'bg-farm-50 border-farm-200'
            }`}>
              <span className="text-[10px] font-bold text-gray-600 block uppercase">
                {language === 'mr' ? 'जोखीम गुण' : language === 'hi' ? 'जोखिम स्कोर' : 'Risk Score'}
              </span>
              <div className="text-xl font-black text-gray-900 font-mono mt-0.5">
                {activeResult.risk.totalRiskScore} <span className="text-xs font-normal text-gray-500">/100</span>
              </div>
              
              {/* Risk Delta */}
              <span className={`text-[11px] font-bold block ${
                riskDiff <= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {riskDiff > 0 ? `+${riskDiff} गुण धोका` : riskDiff < 0 ? `${riskDiff} कमी धोका` : 'धोक्यात बदल नाही'}
              </span>
            </div>
          </div>

          {/* Confidence interval info */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {language === 'mr' ? '९०% निश्चितता मर्यादा:' : language === 'hi' ? '९०% निश्चितता सीमा:' : '90% Confidence:'} {activeResult.confidenceInterval.yieldMinQuintals} - {activeResult.confidenceInterval.yieldMaxQuintals} Q
            </span>
            <span className="text-farm-700 font-bold">
              ₹{activeResult.confidenceInterval.profitMin.toLocaleString('en-IN')} ~ ₹{activeResult.confidenceInterval.profitMax.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

      </div>

      {/* 4. "WHAT CHANGED?" PARAMETER DIFF BAR */}
      <div className="bg-white rounded-3xl p-5 border border-farm-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-farm-600" />
            <h4 className="font-bold text-gray-900 text-sm">
              {language === 'mr' ? 'काय बदलले? (What Changed Between Baseline & Your Scenario)' : language === 'hi' ? 'क्या बदला? (Baseline vs Scenario Diff)' : 'What Changed? (Baseline vs Scenario Parameters)'}
            </h4>
          </div>
          <span className="text-xs text-gray-500">
            {comparison.inputDifferences.length} {language === 'mr' ? 'घटकांमध्ये फरक' : language === 'hi' ? 'कारकों में बदलाव' : 'parameter changes'}
          </span>
        </div>

        {comparison.inputDifferences.length === 0 ? (
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'mr' 
                ? 'सध्या सर्व पॅरामीटर्स ICAR च्या आदर्श सामान्य स्थितीनुसार आहेत. खालील स्लाइडर्स हलवून बदल तपासा!' 
                : language === 'hi' 
                ? 'वर्तमान में सभी पैरामीटर्स ICAR की आदर्श सामान्य स्थिति के समान हैं। नीचे दिए गए स्लाइडर्स से बदलाव करें!' 
                : 'All parameters match official ICAR baseline conditions. Adjust sliders below to test what-if scenarios!'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {comparison.inputDifferences.map((diff: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-farm-50/60 border border-farm-200 text-xs space-y-1">
                <span className="font-bold text-gray-800 block">{diff.field || diff.label}</span>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-gray-500 line-through">{diff.baselineValue || diff.baseVal}</span>
                  <ArrowRight className="w-3 h-3 text-farm-600" />
                  <span className="font-bold text-farm-900">{diff.targetValue || diff.targetVal}</span>
                </div>
                <span className={`text-[10px] font-bold block ${
                  diff.isPenalty ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  {diff.impactNote || diff.difference}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. MEASURABLE WHAT-IF DECISION CONTROLS (Interactive Sliders) */}
      <div className="bg-white rounded-3xl p-6 border border-farm-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-black font-serif text-gray-900">
              {language === 'mr' ? 'शेती निर्णय बदला व परिणाम पाहा (What-If Sliders)' : language === 'hi' ? 'कृषि निर्णय बदलें व परिणाम देखें' : 'Test Farming Decisions (Measurable Controls)'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'mr' ? 'पाणी, पाऊस (मिमी), तापमान (°C), क्षेत्र (एकर व गुंठे) बदलून त्वरित परिणाम पाहा' : language === 'hi' ? 'पानी, बारिश (मिमी), तापमान (°C) और रकबा बदलकर तुरंत प्रभाव देखें' : 'Sliders update all yields, profits, and risk scores deterministically in real-time.'}
            </p>
          </div>

          <button
            onClick={resetToBaseline}
            className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'सामान्य करा' : language === 'hi' ? 'रीसेट करें' : 'Reset to Normal'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Control 1: Acreage Input (Acres + Gunthas) */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-farm-600" />
                <span>{language === 'mr' ? 'शेताचे क्षेत्र (एकर व गुंठे)' : language === 'hi' ? 'खेत का रकबा (एकड़ व गुंठा)' : 'Land Acreage'}</span>
              </span>
              <span className="text-xs font-bold text-farm-800 font-mono">
                {activeScenario.landAreaAcres} {language === 'mr' ? 'एकर' : language === 'hi' ? 'एकड़' : 'Acres'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 block font-semibold">{language === 'mr' ? 'एकर (Acres):' : language === 'hi' ? 'एकड़:' : 'Acres:'}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={acresInput}
                  onChange={(e) => handleAcresChange(Math.max(0, parseInt(e.target.value) || 0), gunthasInput)}
                  className="w-full p-2 rounded-xl border border-gray-300 font-mono font-bold text-sm bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 block font-semibold">{language === 'mr' ? 'गुंठे (0-39):' : language === 'hi' ? 'गुंठा (0-39):' : 'Gunthas (0-39):'}</label>
                <input
                  type="number"
                  min="0"
                  max="39"
                  step="1"
                  value={gunthasInput}
                  onChange={(e) => handleAcresChange(acresInput, Math.min(39, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full p-2 rounded-xl border border-gray-300 font-mono font-bold text-sm bg-white"
                />
              </div>
            </div>

            {/* Quick Acreage Chips */}
            <div className="flex items-center space-x-1.5 pt-1">
              <button
                onClick={() => handleAcresChange(1, 0)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-100"
              >
                1 {language === 'mr' ? 'एकर' : language === 'hi' ? 'एकड़' : 'Acre'}
              </button>
              <button
                onClick={() => handleAcresChange(2, 20)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-100"
              >
                2.5 {language === 'mr' ? 'एकर (20 गुंठे)' : language === 'hi' ? 'एकड़ (20 गुंठा)' : 'Ac (20 Gunthe)'}
              </button>
              <button
                onClick={() => handleAcresChange(5, 0)}
                className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-700 hover:bg-gray-100"
              >
                5 {language === 'mr' ? 'एकर' : language === 'hi' ? 'एकड़' : 'Acres'}
              </button>
            </div>
            <span className="text-[10px] text-gray-400 block italic">
              {language === 'mr' ? 'प्रमाण: ४० गुंठे = १ एकर' : language === 'hi' ? 'प्रमाण: ४० गुंठा = १ एकड़' : 'Conversion: 40 Gunthas = 1 Acre'}
            </span>
          </div>

          {/* Control 2: Water Availability Slider */}
          <div className="space-y-2 p-4 bg-sky-50/50 rounded-2xl border border-sky-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 flex items-center space-x-1.5">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>{language === 'mr' ? 'पाण्याची उपलब्धता (%)' : language === 'hi' ? 'पानी की उपलब्धता (%)' : 'Water Availability (%)'}</span>
              </span>
              <span className="text-sm font-black text-sky-950 font-mono">
                {activeScenario.waterAvailabilityPct}%
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="120"
              step="5"
              value={activeScenario.waterAvailabilityPct}
              onChange={(e) => updateScenario(activeScenario.id, { waterAvailabilityPct: parseInt(e.target.value) })}
              className="w-full accent-sky-600 h-2 bg-sky-200 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-sky-700 font-semibold">
              <span>20% (तीव्र टंचाई)</span>
              <span>100% (सामान्य)</span>
              <span>120% (मुबलक)</span>
            </div>

            <div className="text-[11px] text-sky-900 bg-white/80 p-2 rounded-xl border border-sky-200">
              {language === 'mr' ? 'उपलब्ध पाणी:' : language === 'hi' ? 'उपलब्ध पानी:' : 'Water Available:'} <strong>{(activeResult.waterAvailableLiters / 100000).toFixed(1)} {language === 'mr' ? 'लाख लिटर' : language === 'hi' ? 'लाख लीटर' : 'Lakh Liters'}</strong>
              <span className="text-gray-500 block text-[10px]">
                (एकूण गरज: {(activeResult.waterRequiredLiters / 100000).toFixed(1)} लाख लिटर)
              </span>
            </div>
          </div>

          {/* Control 3: Measurable Rainfall (mm) */}
          <div className="space-y-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span>{language === 'mr' ? 'हंगामातील पाऊस (मिमी)' : language === 'hi' ? 'मौसमी वर्षा (मिमी)' : 'Rainfall (mm)'}</span>
              </span>
              <span className="text-sm font-black text-blue-950 font-mono">
                {activeScenario.rainfallMm || crop.normalRainfallMm} mm
              </span>
            </div>

            <input
              type="range"
              min="200"
              max="1500"
              step="25"
              value={activeScenario.rainfallMm || crop.normalRainfallMm}
              onChange={(e) => {
                const mm = parseInt(e.target.value);
                const rainCategory = mm < crop.normalRainfallMm * 0.75 ? 'low' : mm > crop.normalRainfallMm * 1.3 ? 'high' : 'normal';
                updateScenario(activeScenario.id, { rainfallMm: mm, rainfall: rainCategory });
              }}
              className="w-full accent-blue-600 h-2 bg-blue-200 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-blue-700 font-semibold">
              <span>200 mm</span>
              <span className="text-blue-900 font-bold">सामान्य: {crop.normalRainfallMm} mm</span>
              <span>1500 mm</span>
            </div>

            <span className="text-[10px] text-gray-500 block">
              {activeScenario.rainfallMm && activeScenario.rainfallMm < crop.normalRainfallMm 
                ? `सामान्यपेक्षा ${crop.normalRainfallMm - activeScenario.rainfallMm} मिमी कमी पाऊस (तुटवडा)` 
                : activeScenario.rainfallMm && activeScenario.rainfallMm > crop.normalRainfallMm
                ? `सामान्यपेक्षा ${activeScenario.rainfallMm - crop.normalRainfallMm} मिमी जास्त पाऊस (अतिवृष्टी)`
                : 'ICAR सरासरी पावसाचे प्रमाण'}
            </span>
          </div>

          {/* Control 4: Measurable Temperature (°C) */}
          <div className="space-y-2 p-4 bg-orange-50/50 rounded-2xl border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-900 flex items-center space-x-1.5">
                <Thermometer className="w-4 h-4 text-orange-600" />
                <span>{language === 'mr' ? 'हवामानाचे तापमान (°C)' : language === 'hi' ? 'मौसम का तापमान (°C)' : 'Temperature (°C)'}</span>
              </span>
              <span className="text-sm font-black text-orange-950 font-mono">
                {activeScenario.temperatureCelsius || crop.optimalTempCelsius}°C
              </span>
            </div>

            <input
              type="range"
              min="15"
              max="45"
              step="1"
              value={activeScenario.temperatureCelsius || crop.optimalTempCelsius}
              onChange={(e) => {
                const temp = parseInt(e.target.value);
                const tempCat = temp >= 40 ? 'heatwave' : temp >= 34 ? 'high' : temp < 20 ? 'low' : 'normal';
                updateScenario(activeScenario.id, { temperatureCelsius: temp, temperature: tempCat });
              }}
              className="w-full accent-orange-600 h-2 bg-orange-200 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-orange-700 font-semibold">
              <span>15°C (थंडी)</span>
              <span className="text-orange-900 font-bold">अनुकूल: {crop.optimalTempCelsius}°C</span>
              <span>45°C (उष्ण लाट)</span>
            </div>

            <span className="text-[10px] text-gray-500 block">
              {(activeScenario.temperatureCelsius || 0) >= 40 
                ? '⚠️ तीव्र उष्ण लाट (Heatwave) — परागसिंचनावर वाईट परिणाम' 
                : (activeScenario.temperatureCelsius || 0) >= 35 
                ? 'उच्च तापमान — पाण्याचा बाष्पीभवन वेग वाढेल' 
                : 'वाढीसाठी अनुकूल तापमान'}
            </span>
          </div>

          {/* Control 5: Sowing / Planting Date */}
          <div className="space-y-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{language === 'mr' ? 'पेरणी / लागवड तारीख' : language === 'hi' ? 'बुवाई की तारीख' : 'Planting Date'}</span>
              </span>
              <span className="text-xs font-bold text-emerald-900 font-mono">
                {activeScenario.plantingDate}
              </span>
            </div>

            <input
              type="date"
              value={activeScenario.plantingDate}
              onChange={(e) => updateScenario(activeScenario.id, { plantingDate: e.target.value })}
              className="w-full p-2 rounded-xl border border-emerald-300 font-mono font-bold text-xs bg-white text-gray-800"
            />

            <div className="text-[11px] text-emerald-900 bg-white/80 p-2 rounded-xl border border-emerald-200">
              <span className="text-gray-600 font-semibold block">{language === 'mr' ? 'योग्य कालावधी:' : language === 'hi' ? 'अनुशंसित समय:' : 'Recommended:'}</span>
              <span className="font-bold text-emerald-950">
                {language === 'mr' ? crop.recommendedPlanting.marathiLabel : language === 'hi' ? crop.recommendedPlanting.hindiLabel : crop.recommendedPlanting.label}
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">
                {activeResult.plantingStatus.message}
              </span>
            </div>
          </div>

          {/* Control 6: Market Price (₹/Quintal & ₹/Tonne) */}
          <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>{language === 'mr' ? 'अपेक्षित बाजारभाव' : language === 'hi' ? 'अपेक्षित बाजार भाव' : 'Market Price'}</span>
              </span>
              <span className="text-xs font-bold text-amber-950 font-mono">
                ₹{activeResult.marketPricePerQuintal}/Q
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 block font-semibold">{language === 'mr' ? 'भाव प्रति टन (₹/Tonne):' : language === 'hi' ? 'भाव प्रति टन:' : 'Price per Tonne:'}</label>
              <input
                type="number"
                step="50"
                min="500"
                value={activeScenario.marketPricePerTonne || crop.marketPricePerTonne}
                onChange={(e) => updateScenario(activeScenario.id, { marketPricePerTonne: parseInt(e.target.value) || crop.marketPricePerTonne })}
                className="w-full p-2 rounded-xl border border-amber-300 font-mono font-bold text-sm bg-white"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-amber-800 pt-1">
              <span>{language === 'mr' ? 'शासकीय हमीभाव (MSP):' : language === 'hi' ? 'सरकारी एमएसपी:' : 'Govt MSP:'} <strong>₹{crop.MSPPerQuintal}/Q</strong></span>
              <span>(₹{crop.MSPPerTonne}/T)</span>
            </div>
          </div>

        </div>
      </div>

      {/* 6. DETAILED COMPARISON TABLE (All Metrics at a Glance) */}
      <div className="bg-white rounded-3xl p-6 border border-farm-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-farm-600" />
            <h3 className="text-base sm:text-lg font-black font-serif text-gray-900">
              {language === 'mr' ? 'तुलना तक्ता (Scenario Comparison Table)' : language === 'hi' ? 'तुलना तालिका' : 'Comprehensive Scenario Comparison Table'}
            </h3>
          </div>
          <span className="text-xs font-bold text-farm-700 bg-farm-100 px-3 py-1 rounded-full border border-farm-300">
            {cropName}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3.5">{language === 'mr' ? 'घटक / मोजमाप' : language === 'hi' ? 'मापदंड' : 'Metric'}</th>
                <th className="p-3.5 text-gray-600">{language === 'mr' ? 'ICAR सामान्य संदर्भ' : language === 'hi' ? 'सामान्य आधार' : 'ICAR Baseline'}</th>
                <th className="p-3.5 text-farm-900 bg-farm-50/70 font-black">{language === 'mr' ? 'आपला बदल (What-If)' : language === 'hi' ? 'आपका सिमुलेशन' : 'What-If Scenario'}</th>
                <th className="p-3.5 text-right">{language === 'mr' ? 'फरक (Delta)' : language === 'hi' ? 'अंतर (Delta)' : 'Difference (Delta)'}</th>
                <th className="p-3.5">{language === 'mr' ? 'परिणाम' : language === 'hi' ? 'असर' : 'Impact / Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {/* Expected Yield */}
              <tr>
                <td className="p-3 font-sans font-bold text-gray-900">{language === 'mr' ? 'एकूण उत्पादन (क्विंटल)' : language === 'hi' ? 'कुल पैदावार (क्विंटल)' : 'Expected Yield (Quintals)'}</td>
                <td className="p-3 text-gray-600">{baselineResult.expectedYieldQuintals} Q ({baselineResult.expectedYieldTonnes} T)</td>
                <td className="p-3 bg-farm-50/40 font-bold text-gray-900">{activeResult.expectedYieldQuintals} Q ({activeResult.expectedYieldTonnes} T)</td>
                <td className={`p-3 text-right font-bold ${yieldDiffQuintals >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {yieldDiffQuintals >= 0 ? '+' : ''}{yieldDiffQuintals.toFixed(1)} Q ({activeResult.yieldChangePct}%)
                </td>
                <td className="p-3 font-sans text-[11px] text-gray-600">
                  {activeResult.yieldChangePct < -15 ? '⚠️ गंभीर घट' : activeResult.yieldChangePct < 0 ? 'मध्यम घट' : 'उत्कृष्ट उत्पादन'}
                </td>
              </tr>

              {/* Per Acre Yield */}
              <tr>
                <td className="p-3 font-sans font-medium text-gray-700">{language === 'mr' ? 'दर एकरी उत्पादन' : language === 'hi' ? 'प्रति एकड़ पैदावार' : 'Yield per Acre'}</td>
                <td className="p-3 text-gray-600">{baselineResult.yieldPerAcreQuintals} Q/एकर</td>
                <td className="p-3 bg-farm-50/40 font-bold text-gray-900">{activeResult.yieldPerAcreQuintals} Q/एकर</td>
                <td className="p-3 text-right font-bold text-gray-700">
                  {(activeResult.yieldPerAcreQuintals - baselineResult.yieldPerAcreQuintals).toFixed(1)} Q
                </td>
                <td className="p-3 font-sans text-[11px] text-gray-500">ICAR मानक: {crop.baseYieldPerAcreQuintals || (crop.baseYieldPerAcreTonnes * 10)} Q</td>
              </tr>

              {/* Gross Revenue */}
              <tr>
                <td className="p-3 font-sans font-medium text-gray-700">{language === 'mr' ? 'एकूण स्थूल उत्पन्न' : language === 'hi' ? 'कुल आमदनी' : 'Gross Revenue'}</td>
                <td className="p-3 text-gray-600">₹{baselineResult.estimatedRevenue.toLocaleString('en-IN')}</td>
                <td className="p-3 bg-farm-50/40 font-bold text-gray-900">₹{activeResult.estimatedRevenue.toLocaleString('en-IN')}</td>
                <td className={`p-3 text-right font-bold ${
                  activeResult.estimatedRevenue >= baselineResult.estimatedRevenue ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {activeResult.estimatedRevenue >= baselineResult.estimatedRevenue ? '+' : ''}₹{(activeResult.estimatedRevenue - baselineResult.estimatedRevenue).toLocaleString('en-IN')}
                </td>
                <td className="p-3 font-sans text-[11px] text-gray-500">बाजारभाव ₹{activeResult.marketPricePerQuintal}/Q</td>
              </tr>

              {/* Total Costs */}
              <tr>
                <td className="p-3 font-sans font-medium text-gray-700">{language === 'mr' ? 'एकूण लागवड खर्च' : language === 'hi' ? 'कुल उत्पादन लागत' : 'Total Costs'}</td>
                <td className="p-3 text-gray-600">₹{baselineResult.costs.total.toLocaleString('en-IN')}</td>
                <td className="p-3 bg-farm-50/40 font-bold text-gray-900">₹{activeResult.costs.total.toLocaleString('en-IN')}</td>
                <td className="p-3 text-right font-bold text-gray-700">
                  {activeResult.costs.total - baselineResult.costs.total >= 0 ? '+' : ''}₹{(activeResult.costs.total - baselineResult.costs.total).toLocaleString('en-IN')}
                </td>
                <td className="p-3 font-sans text-[11px] text-gray-500">दर एकरी ₹{Math.round(activeResult.costs.total / activeResult.landAreaAcres).toLocaleString('en-IN')}</td>
              </tr>

              {/* Net Profit */}
              <tr className="bg-farm-50/80 font-bold text-sm">
                <td className="p-3 font-sans text-farm-950">{language === 'mr' ? 'निव्वळ नफा (Net Farmer Profit)' : language === 'hi' ? 'शुद्ध किसान मुनाफा' : 'Net Farmer Profit'}</td>
                <td className="p-3 text-gray-700">₹{baselineResult.estimatedProfit.toLocaleString('en-IN')}</td>
                <td className={`p-3 font-black ${activeResult.estimatedProfit >= 0 ? 'text-emerald-950' : 'text-rose-950'}`}>
                  ₹{activeResult.estimatedProfit.toLocaleString('en-IN')}
                </td>
                <td className={`p-3 text-right font-black ${profitDiff >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {profitDiff >= 0 ? '+' : ''}₹{profitDiff.toLocaleString('en-IN')}
                </td>
                <td className="p-3 font-sans text-xs">
                  {profitDiff >= 0 ? '✅ उत्तम आर्थिक परतावा' : '⚠️ नफ्यात नुकसान'}
                </td>
              </tr>

              {/* Risk Score */}
              <tr>
                <td className="p-3 font-sans font-medium text-gray-700">{language === 'mr' ? 'जोखीम गुण (Risk Score /100)' : language === 'hi' ? 'जोखिम स्कोर' : 'Risk Score (/100)'}</td>
                <td className="p-3 text-gray-600">{baselineResult.risk.totalRiskScore}/100</td>
                <td className="p-3 bg-farm-50/40 font-bold text-gray-900">{activeResult.risk.totalRiskScore}/100</td>
                <td className={`p-3 text-right font-bold ${riskDiff <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {riskDiff > 0 ? `+${riskDiff}` : riskDiff}
                </td>
                <td className="p-3 font-sans text-[11px] font-bold">
                  <span className={`px-2 py-0.5 rounded-full ${
                    activeResult.risk.level === 'low' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : activeResult.risk.level === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {activeResult.risk.level.toUpperCase()}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. 4-PILLAR RISK BREAKDOWN CARDS */}
      <div className="bg-white rounded-3xl p-6 border border-farm-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-farm-700" />
          <h3 className="text-base sm:text-lg font-black font-serif text-gray-900">
            {language === 'mr' ? '४-स्तंभ जोखीम विश्लेषण (4-Pillar Risk Breakdown)' : language === 'hi' ? '४-स्तंभ जोखिम विश्लेषण' : '4-Pillar Risk Breakdown'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Water Risk */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900">{language === 'mr' ? 'पाण्याचा धोका' : language === 'hi' ? 'जल जोखिम' : 'Water Risk'}</span>
              <span className="text-xs font-bold text-sky-950 font-mono">{activeResult.risk.waterRisk} / 35</span>
            </div>
            <div className="w-full bg-sky-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${activeResult.risk.waterRisk > 20 ? 'bg-rose-500' : 'bg-sky-600'}`}
                style={{ width: `${(activeResult.risk.waterRisk / 35) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-600">
              {activeResult.waterDeficitPct > 0 ? `${activeResult.waterDeficitPct}% पाण्याचा तुटवडा` : 'पाणी १००% पुरेसे आहे'}
            </p>
          </div>

          {/* Weather Risk */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-900">{language === 'mr' ? 'हवामान धोका' : language === 'hi' ? 'मौसम जोखिम' : 'Weather Risk'}</span>
              <span className="text-xs font-bold text-orange-950 font-mono">{activeResult.risk.weatherRisk} / 25</span>
            </div>
            <div className="w-full bg-orange-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${activeResult.risk.weatherRisk > 15 ? 'bg-rose-500' : 'bg-orange-600'}`}
                style={{ width: `${(activeResult.risk.weatherRisk / 25) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-600">
              तापमान: {activeScenario.temperatureCelsius || activeScenario.temperature}°C, पाऊस: {activeScenario.rainfallMm || activeScenario.rainfall} mm
            </p>
          </div>

          {/* Sowing Date Risk */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">{language === 'mr' ? 'पेरणी वेळेचा धोका' : language === 'hi' ? 'बुवाई समय जोखिम' : 'Sowing Risk'}</span>
              <span className="text-xs font-bold text-emerald-950 font-mono">{activeResult.risk.plantingRisk} / 20</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${activeResult.risk.plantingRisk > 10 ? 'bg-rose-500' : 'bg-emerald-600'}`}
                style={{ width: `${(activeResult.risk.plantingRisk / 20) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-600">
              {activeResult.plantingStatus.message}
            </p>
          </div>

          {/* Financial Margin Risk */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">{language === 'mr' ? 'आर्थिक धोका' : language === 'hi' ? 'वित्तीय जोखिम' : 'Financial Risk'}</span>
              <span className="text-xs font-bold text-purple-950 font-mono">{activeResult.risk.costRisk} / 20</span>
            </div>
            <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${activeResult.risk.costRisk > 10 ? 'bg-rose-500' : 'bg-purple-600'}`}
                style={{ width: `${(activeResult.risk.costRisk / 20) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-600">
              नफा मार्जिन: {activeResult.profitMarginPct}%
            </p>
          </div>
        </div>

        {/* Risk Reasons Callout */}
        {activeResult.risk.reasons.length > 0 && (
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
            <span className="font-bold text-gray-800 block">
              {language === 'mr' ? 'जोखमीची मुख्य कारणे:' : language === 'hi' ? 'जोखिम के मुख्य कारण:' : 'Primary Risk Drivers:'}
            </span>
            <ul className="list-disc list-inside text-gray-600 space-y-0.5">
              {activeResult.risk.reasons.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};
