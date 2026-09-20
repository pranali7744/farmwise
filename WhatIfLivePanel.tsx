import React from 'react';
import { useApp } from '../context/AppContext';
import { PRESET_TEMPLATES } from '../data/presets';
import { 
  getRainfallName, 
  getTemperatureName, 
  getInputLevelName,
  getRiskLevelName
} from '../utils/localization';
import { 
  Sliders, 
  Droplets, 
  Sun, 
  CloudRain, 
  ArrowDownRight, 
  ArrowUpRight, 
  Minus,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface WhatIfLivePanelProps {
  onDuplicateAsNew?: () => void;
}

export const WhatIfLivePanel: React.FC<WhatIfLivePanelProps> = ({ onDuplicateAsNew }) => {
  const { 
    activeScenario, 
    updateScenario, 
    activeResult, 
    t, 
    language,
    duplicateScenario,
    setCurrentTab
  } = useApp();

  const handleWaterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    updateScenario(activeScenario.id, { waterAvailabilityPct: val });
  };

  const handleRainfallChange = (val: 'low' | 'normal' | 'high') => {
    updateScenario(activeScenario.id, { rainfall: val });
  };

  const handleTempChange = (val: 'low' | 'normal' | 'high' | 'heatwave') => {
    updateScenario(activeScenario.id, { temperature: val });
  };

  const handleFertilizerToggle = () => {
    const next = activeScenario.fertilizerLevel === 'normal' ? 'high' : activeScenario.fertilizerLevel === 'high' ? 'low' : 'normal';
    updateScenario(activeScenario.id, { fertilizerLevel: next });
  };

  const handlePresetApply = (templateId: string) => {
    const tmpl = PRESET_TEMPLATES.find((p) => p.id === templateId);
    if (tmpl) {
      const updates = tmpl.apply(activeScenario);
      updateScenario(activeScenario.id, updates);
    }
  };

  const handleReset = () => {
    updateScenario(activeScenario.id, {
      waterAvailabilityPct: 100,
      rainfall: 'normal',
      temperature: 'normal',
      fertilizerLevel: 'normal',
      pesticideLevel: 'normal'
    });
  };

  const handleSaveAsScenario = () => {
    const newId = duplicateScenario(activeScenario.id);
    const copySuffix = language === 'mr' ? '(सिम्युलेट केलेला बदल)' : language === 'hi' ? '(सिमुलेटेड बदलाव)' : '(Simulated What-If)';
    updateScenario(newId, { name: `${activeScenario.name} ${copySuffix}` });
    if (onDuplicateAsNew) {
      onDuplicateAsNew();
    } else {
      setCurrentTab('scenarios');
    }
  };

  const waterPct = activeScenario.waterAvailabilityPct ?? 100;
  const deficitPct = activeResult.waterDeficitPct;

  return (
    <div className="bg-gradient-to-br from-emerald-950 to-farm-900 text-white rounded-3xl p-6 sm:p-8 shadow-farmer-lg border border-emerald-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/80 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-emerald-100 flex items-center space-x-2">
              <span>{t.whatIf.title}</span>
              <span className="text-xs bg-emerald-500 text-emerald-950 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {t.whatIf.liveBadge}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-0.5">
              {t.whatIf.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold rounded-xl border border-emerald-700 transition-all flex items-center space-x-1.5"
            title="Reset sliders to 100% normal"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.whatIf.resetBtn}</span>
          </button>

          <button
            onClick={handleSaveAsScenario}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-farm-950 text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.whatIf.saveAsNewBtn}</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Click Scenario Preset Buttons */}
      <div>
        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block mb-2">
          ⚡ {t.whatIf.presetsTitle}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESET_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handlePresetApply(tmpl.id)}
              className="px-3 py-2.5 bg-emerald-900/40 hover:bg-emerald-800/80 active:scale-95 border border-emerald-700/60 rounded-2xl text-left transition-all group"
            >
              <div className="text-sm font-bold text-emerald-100 group-hover:text-white truncate">
                {tmpl.icon} {language === 'mr' ? tmpl.marathiName.replace(/^[^\s]+\s/, '') : language === 'hi' ? tmpl.hindiName.replace(/^[^\s]+\s/, '') : tmpl.name.replace(/^[^\s]+\s/, '')}
              </div>
              <p className="text-[10px] text-emerald-300/70 truncate mt-0.5">
                {tmpl.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Sliders and Modifiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Slider 1: Water Availability */}
        <div className="bg-emerald-900/40 p-5 rounded-2xl border border-emerald-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-200">
              <Droplets className="w-5 h-5 text-sky-400" />
              <label className="text-sm font-bold text-emerald-100">
                {t.form.waterLabel}
              </label>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black font-serif text-white">
                {waterPct}%
              </span>
              {deficitPct > 0 ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {deficitPct}% {t.common.deficit}
                </span>
              ) : (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {t.common.sufficient}
                </span>
              )}
            </div>
          </div>

          {/* Large Slider */}
          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={waterPct}
            onChange={handleWaterChange}
            className="w-full h-3 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-sky-400 border border-emerald-700"
          />

          <div className="flex justify-between text-[11px] font-semibold text-emerald-300/80">
            <span>{t.whatIf.drought}</span>
            <span>{t.whatIf.stress}</span>
            <span>{t.whatIf.normalReq}</span>
            <span>{t.whatIf.surplus}</span>
          </div>

          <div className="pt-2 border-t border-emerald-800/60 flex justify-between text-xs text-emerald-200">
            <span>{t.whatIf.available}: <strong>{(activeResult.waterAvailableLiters / 100000).toFixed(2)} {t.common.lakhLiters}</strong></span>
            <span>{t.whatIf.required}: <strong>{(activeResult.waterRequiredLiters / 100000).toFixed(2)} {t.common.lakhLiters}</strong></span>
          </div>
        </div>

        {/* Controls: Weather & Input Selectors */}
        <div className="bg-emerald-900/40 p-5 rounded-2xl border border-emerald-800 space-y-4">
          
          {/* Rainfall Selection */}
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 mb-2">
              <CloudRain className="w-4 h-4 text-sky-400" />
              <label className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                {t.whatIf.rainfallLabel}
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'normal', 'high'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => handleRainfallChange(r)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    activeScenario.rainfall === r
                      ? 'bg-sky-500 text-sky-950 border-sky-300 shadow'
                      : 'bg-emerald-950/60 text-emerald-200 border-emerald-700 hover:bg-emerald-900'
                  }`}
                >
                  {getRainfallName(r, language)}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Selection */}
          <div>
            <div className="flex items-center space-x-2 text-emerald-200 mb-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                {t.whatIf.tempLabel}
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'normal', 'high', 'heatwave'] as const).map((tmp) => (
                <button
                  key={tmp}
                  onClick={() => handleTempChange(tmp)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border truncate ${
                    activeScenario.temperature === tmp
                      ? tmp === 'heatwave'
                        ? 'bg-rose-500 text-white border-rose-300 shadow'
                        : 'bg-amber-400 text-amber-950 border-amber-300 shadow'
                      : 'bg-emerald-950/60 text-emerald-200 border-emerald-700 hover:bg-emerald-900'
                  }`}
                >
                  {getTemperatureName(tmp, language)}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Fertilizer Toggle */}
          <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between">
            <span className="text-xs text-emerald-200">
              {t.whatIf.fertilizerLabel} <strong className="uppercase text-white">{getInputLevelName(activeScenario.fertilizerLevel, language)}</strong>
            </span>
            <button
              onClick={handleFertilizerToggle}
              className="text-xs font-bold px-3 py-1 bg-emerald-800 hover:bg-emerald-700 rounded-lg text-emerald-100 border border-emerald-600 transition-all"
            >
              {t.whatIf.toggleBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Live Delta Summary (Before vs After) */}
      <div className="bg-emerald-950/90 rounded-2xl p-5 border border-emerald-700/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.whatIf.beforeAfterTitle}</span>
          </span>
          <span className="text-[11px] text-emerald-400 font-mono">
            {t.whatIf.instantActive}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          
          {/* Yield */}
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800">
            <p className="text-[11px] text-emerald-300 font-medium">{t.whatIf.expectedYield}</p>
            <p className="text-xl sm:text-2xl font-black font-serif text-white mt-0.5">
              {activeResult.expectedYieldTonnes} <span className="text-xs font-normal">{t.common.tonnes}</span>
            </p>
            <div className="flex items-center justify-center space-x-1 mt-1 text-xs font-bold">
              {activeResult.yieldChangePct < 0 ? (
                <span className="text-rose-400 flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {activeResult.yieldChangePct}%
                </span>
              ) : activeResult.yieldChangePct > 0 ? (
                <span className="text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{activeResult.yieldChangePct}%
                </span>
              ) : (
                <span className="text-gray-400 flex items-center">
                  <Minus className="w-3.5 h-3.5" />
                  {t.common.baseline}
                </span>
              )}
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800">
            <p className="text-[11px] text-emerald-300 font-medium">{t.whatIf.netProfit}</p>
            <p className={`text-xl sm:text-2xl font-black font-serif mt-0.5 ${
              activeResult.estimatedProfit < 0 ? 'text-rose-400' : 'text-emerald-300'
            }`}>
              ₹{activeResult.estimatedProfit.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-emerald-400 mt-1">
              {activeResult.profitMarginPct}% {t.whatIf.margin}
            </p>
          </div>

          {/* Risk */}
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800">
            <p className="text-[11px] text-emerald-300 font-medium">{t.whatIf.riskScore}</p>
            <p className="text-xl sm:text-2xl font-black font-serif mt-0.5 text-white">
              {activeResult.risk.totalRiskScore} <span className="text-xs font-normal">/ 100</span>
            </p>
            <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
              activeResult.risk.level === 'low'
                ? 'bg-emerald-500 text-emerald-950'
                : activeResult.risk.level === 'medium'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-rose-500 text-white'
            }`}>
              {getRiskLevelName(activeResult.risk.level, language)}
            </span>
          </div>

          {/* Water Deficit */}
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800">
            <p className="text-[11px] text-emerald-300 font-medium">{t.whatIf.waterDeficit}</p>
            <p className="text-xl sm:text-2xl font-black font-serif mt-0.5 text-white">
              {activeResult.waterDeficitPct}%
            </p>
            <p className="text-[10px] text-emerald-300 mt-1">
              {(activeResult.waterAvailableLiters / 100000).toFixed(1)}L / {(activeResult.waterRequiredLiters / 100000).toFixed(1)}L
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
