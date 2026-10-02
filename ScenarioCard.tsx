import React from 'react';
import { ScenarioInput, SimulationResult } from '../types';
import { useApp } from '../context/AppContext';
import { 
  getCropName, 
  getLocalizedScenarioName, 
  getRiskLevelName,
  getRainfallName,
  getTemperatureName
} from '../utils/localization';
import { 
  Play, 
  Copy, 
  Trash2, 
  Edit, 
  Droplets, 
  CloudSun, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';

interface ScenarioCardProps {
  scenario: ScenarioInput;
  result: SimulationResult;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCompareToggle?: () => void;
  isCompared?: boolean;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  result,
  isActive,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onCompareToggle,
  isCompared
}) => {
  const { t, language } = useApp();
  const isProfitPositive = result.estimatedProfit >= 0;

  return (
    <div
      className={`relative rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between ${
        isActive
          ? 'bg-farm-50/90 border-farm-500 ring-2 ring-farm-500/20 shadow-farmer'
          : 'bg-white border-gray-200 hover:border-farm-300 hover:shadow-sm'
      }`}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="text-3xl p-2 bg-white rounded-2xl border border-gray-100 shadow-2xs">
              {result.crop.icon}
            </span>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                {getLocalizedScenarioName(scenario.name, language)}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {getCropName(result.crop, language)} • {scenario.landAreaAcres} {t.common.acres}
              </p>
            </div>
          </div>

          {/* Risk Level Badge */}
          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border shrink-0 ${
              result.risk.level === 'low'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : result.risk.level === 'medium'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            {getRiskLevelName(result.risk.level, language)}
          </span>
        </div>

        {/* Quick Param Badges */}
        <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-gray-600">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white rounded-lg border border-gray-200 font-medium">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>{scenario.waterAvailabilityPct}% {t.form.waterLabel}</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white rounded-lg border border-gray-200 font-medium">
            <CloudSun className="w-3.5 h-3.5 text-amber-500" />
            <span>{getRainfallName(scenario.rainfall, language)} • {getTemperatureName(scenario.temperature, language)}</span>
          </span>
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white rounded-lg border border-gray-200 font-medium">
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span>{scenario.plantingDate}</span>
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="mt-5 grid grid-cols-3 gap-2 bg-white/80 p-3 rounded-2xl border border-gray-100 text-center">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">
              {t.results.expectedYield}
            </span>
            <span className="text-base sm:text-lg font-black font-serif text-gray-900">
              {result.expectedYieldTonnes} {t.common.tonnes}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">
              {t.results.totalCost}
            </span>
            <span className="text-base sm:text-lg font-black font-serif text-gray-900">
              ₹{(result.costs.total / 1000).toFixed(0)}k
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">
              {t.results.profit}
            </span>
            <span
              className={`text-base sm:text-lg font-black font-serif flex items-center justify-center ${
                isProfitPositive ? 'text-farm-700' : 'text-rose-600'
              }`}
            >
              {isProfitPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              ₹{(Math.abs(result.estimatedProfit) / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          {onCompareToggle && (
            <label className="flex items-center space-x-1.5 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={onCompareToggle}
                className="w-4 h-4 rounded-sm text-farm-600 focus:ring-farm-500 border-gray-300"
              />
              <span>{t.common.compare}</span>
            </label>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-farm-700 hover:bg-farm-100/50 rounded-xl transition-colors"
            title={t.common.edit}
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={onDuplicate}
            className="p-2 text-gray-500 hover:text-farm-700 hover:bg-farm-100/50 rounded-xl transition-colors"
            title={t.common.duplicate}
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title={t.common.delete}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onSelect}
            className="px-3.5 py-1.5 bg-farm-700 hover:bg-farm-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{t.common.simulate}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
