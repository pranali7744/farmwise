import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeScenarioDifference } from '../services/factorAnalysis';
import { FactorAttributionPanel } from './FactorAttributionPanel';
import { ScenarioComparisonChart } from './Charts';
import { getCropName, getRiskLevelName, getLocalizedScenarioName } from '../utils/localization';
import { 
  GitCompare, 
  Trophy, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight
} from 'lucide-react';

export const ComparisonView: React.FC = () => {
  const { 
    scenarios, 
    allResults, 
    comparedScenarioIds, 
    setComparedScenarioIds,
    language,
    t,
    setCurrentTab
  } = useApp();

  // Active pair for "Why did results change?"
  const [baseId, setBaseId] = useState<string>(comparedScenarioIds[0] || scenarios[0]?.id || 'scenario-a');
  const [targetId, setTargetId] = useState<string>(comparedScenarioIds[1] || scenarios[1]?.id || 'scenario-b');

  const selectedScenarios = scenarios.filter((s) => comparedScenarioIds.includes(s.id));
  const selectedResults = selectedScenarios.map((s) => allResults[s.id]).filter(Boolean);

  const toggleScenario = (id: string) => {
    if (comparedScenarioIds.includes(id)) {
      if (comparedScenarioIds.length <= 2) return; // Keep at least 2
      setComparedScenarioIds(comparedScenarioIds.filter((item) => item !== id));
    } else {
      if (comparedScenarioIds.length >= 4) {
        // Replace last
        setComparedScenarioIds([...comparedScenarioIds.slice(1), id]);
      } else {
        setComparedScenarioIds([...comparedScenarioIds, id]);
      }
    }
  };

  // Best badges calculation
  const highestYield = Math.max(...selectedResults.map((r) => r.expectedYieldTonnes));
  const highestProfit = Math.max(...selectedResults.map((r) => r.estimatedProfit));
  const lowestRisk = Math.min(...selectedResults.map((r) => r.risk.totalRiskScore));

  const baseResult = allResults[baseId] || selectedResults[0];
  const targetResult = allResults[targetId] || selectedResults[1] || selectedResults[0];
  const comparison = baseResult && targetResult ? analyzeScenarioDifference(baseResult, targetResult, language) : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-farm-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-farm-700 bg-farm-100 px-3 py-1 rounded-full">
            {language === 'mr' ? 'निर्णय बुद्धिमत्ता' : language === 'hi' ? 'निर्णय बुद्धिमत्ता' : 'Decision Intelligence'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-gray-900 mt-2">
            {t.compare.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mt-1">
            {t.compare.subtitle}
          </p>
        </div>

        {/* Scenario Selection Checkbox Pills */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-gray-700 block">
            {t.compare.selectPrompt}
          </span>
          <div className="flex flex-wrap gap-2">
            {scenarios.map((s) => {
              const isSelected = comparedScenarioIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleScenario(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-farm-700 text-white border-farm-700 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {getLocalizedScenarioName(s.name, language)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl border border-farm-200 shadow-farmer overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <GitCompare className="w-5 h-5 text-farm-700" />
            <span>{t.compare.matrixTitle}</span>
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {t.compare.comparingCount}: {selectedResults.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-farm-50/70 border-b border-farm-100">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 w-1/4">
                  {t.compare.metric}
                </th>
                {selectedScenarios.map((s, idx) => (
                  <th key={s.id} className="p-4 text-xs font-extrabold uppercase tracking-wider text-gray-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-5 h-5 rounded-full bg-farm-200 text-farm-800 flex items-center justify-center text-[10px]">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{getLocalizedScenarioName(s.name, language)}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 lowercase font-medium block mt-0.5">
                      {allResults[s.id]?.crop ? getCropName(allResults[s.id].crop, language) : s.cropId} ({s.landAreaAcres} {t.common.acres})
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              
              {/* Expected Yield */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="p-4 font-bold text-gray-700 flex items-center space-x-2">
                  <span>🌾 {t.results.expectedYield}</span>
                </td>
                {selectedResults.map((r) => {
                  const isBest = r.expectedYieldTonnes === highestYield;
                  return (
                    <td key={r.scenarioId} className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-black font-serif text-gray-900">
                          {r.expectedYieldTonnes} {t.common.tonnes}
                        </span>
                        {isBest && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center space-x-0.5">
                            <Trophy className="w-3 h-3 text-emerald-600" />
                            <span>{t.common.topYield}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {r.yieldPerAcreTonnes} {t.common.tonnes}/{t.common.acres}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Water Use & Deficit */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="p-4 font-bold text-gray-700">
                  💧 {t.results.waterUse}
                </td>
                {selectedResults.map((r) => (
                  <td key={r.scenarioId} className="p-4">
                    <p className="font-bold text-gray-900">
                      {(r.waterAvailableLiters / 100000).toFixed(2)} {t.common.lakhLiters}
                    </p>
                    <span
                      className={`text-xs font-semibold ${
                        r.waterDeficitPct > 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {r.waterDeficitPct > 0 ? `${r.waterDeficitPct}% ${t.whatIf.waterDeficit || 'Deficit'}` : (language === 'mr' ? '१००% पुरेसे' : language === 'hi' ? '१००% पर्याप्त' : '100% Sufficient')}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Total Cost */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="p-4 font-bold text-gray-700">
                  💰 {t.results.totalCost}
                </td>
                {selectedResults.map((r) => (
                  <td key={r.scenarioId} className="p-4">
                    <span className="font-bold text-gray-900 text-base">
                      ₹{r.costs.total.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      ₹{r.costPerTonne.toLocaleString('en-IN')} / {t.common.tonnes}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Revenue */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="p-4 font-bold text-gray-700">
                  📈 {t.results.revenue}
                </td>
                {selectedResults.map((r) => (
                  <td key={r.scenarioId} className="p-4">
                    <span className="font-bold text-gray-900 text-base">
                      ₹{r.estimatedRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[11px] text-gray-500">
                      @ ₹{r.marketPricePerTonne.toLocaleString('en-IN')}/{t.common.tonnes}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Net Profit */}
              <tr className="hover:bg-gray-50/60 transition-colors bg-farm-50/30">
                <td className="p-4 font-bold text-gray-800">
                  💵 {t.results.profit}
                </td>
                {selectedResults.map((r) => {
                  const isBest = r.estimatedProfit === highestProfit;
                  return (
                    <td key={r.scenarioId} className="p-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-lg font-black font-serif ${
                            r.estimatedProfit < 0 ? 'text-rose-600' : 'text-farm-700'
                          }`}
                        >
                          ₹{r.estimatedProfit.toLocaleString('en-IN')}
                        </span>
                        {isBest && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center space-x-0.5">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            <span>{t.common.maxProfit}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {r.profitMarginPct}% {language === 'mr' ? 'नफा मार्जिन' : language === 'hi' ? 'लाभ मार्जिन' : 'profit margin'}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Risk Level */}
              <tr className="hover:bg-gray-50/60 transition-colors">
                <td className="p-4 font-bold text-gray-700">
                  ⚠️ {t.results.risk}
                </td>
                {selectedResults.map((r) => {
                  const isSafest = r.risk.totalRiskScore === lowestRisk;
                  return (
                    <td key={r.scenarioId} className="p-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            r.risk.level === 'low'
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.risk.level === 'medium'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {getRiskLevelName(r.risk.level, language)} ({r.risk.totalRiskScore}/100)
                        </span>
                        {isSafest && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{t.common.safest}</span>
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Comparative Visual Charts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-farm-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          {language === 'mr' ? 'तुलनात्मक व्हिज्युअल आलेख' : language === 'hi' ? 'तुलनात्मक दृश्य चार्ट' : 'Visual Multi-Scenario Comparison'}
        </h3>
        <p className="text-xs text-gray-500">
          {language === 'mr' ? 'उत्पादन (डाव्या अक्षावर टन) आणि निव्वळ नफा व खर्च (उजव्या अक्षावर ₹) ची तुलना करा' : language === 'hi' ? 'उपज (बाएं अक्ष पर टन) और शुद्ध लाभ व लागत (दाएं अक्ष पर ₹) की तुलना करें' : 'Compare Yield (Tonnes on left axis) and Net Profit & Cost (₹ on right axis)'}
        </p>
        <ScenarioComparisonChart scenarios={selectedResults} />
      </div>

      {/* SECTION: "WHY DID IT CHANGE?" WITH DYNAMIC PAIR SELECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-earth-100/60 p-4 rounded-2xl border border-earth-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-earth-900">
              {t.compare.selectPairPrompt}
            </span>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <select
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-900"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {t.compare.baseLabel}: {getLocalizedScenarioName(s.name, language)}
                </option>
              ))}
            </select>

            <ArrowRight className="w-4 h-4 text-gray-500" />

            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-900"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {t.compare.targetLabel}: {getLocalizedScenarioName(s.name, language)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {comparison && (
          <FactorAttributionPanel comparison={comparison} />
        )}
      </div>

      {/* Quick Call to Action */}
      <div className="bg-farm-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold font-serif">
            {t.compare.ctaTitle}
          </h4>
          <p className="text-xs text-farm-200 mt-1">
            {t.compare.ctaDesc}
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('builder')}
          className="px-5 py-3 bg-farm-500 hover:bg-farm-400 text-farm-950 font-extrabold rounded-2xl text-xs transition-all shadow-md active:scale-95 shrink-0"
        >
          {t.compare.ctaBtn}
        </button>
      </div>

    </div>
  );
};
