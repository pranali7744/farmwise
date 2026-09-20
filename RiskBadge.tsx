import React from 'react';
import { RiskBreakdown } from '../types';
import { useApp } from '../context/AppContext';
import { getRiskLevelName } from '../utils/localization';
import { ShieldCheck, AlertTriangle, ShieldAlert, Droplets, CloudSun, Calendar, Wallet } from 'lucide-react';

interface RiskBadgeProps {
  risk: RiskBreakdown;
  showDetails?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  risk,
  showDetails = true
}) => {
  const { t, language } = useApp();

  const isLow = risk.level === 'low';
  const isMedium = risk.level === 'medium';

  const badgeTheme = isLow
    ? {
        bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
        badge: 'bg-emerald-600 text-white',
        bar: 'bg-emerald-500',
        icon: ShieldCheck
      }
    : isMedium
    ? {
        bg: 'bg-amber-50 border-amber-300 text-amber-900',
        badge: 'bg-amber-500 text-white',
        bar: 'bg-amber-500',
        icon: AlertTriangle
      }
    : {
        bg: 'bg-rose-50 border-rose-300 text-rose-900',
        badge: 'bg-rose-600 text-white',
        bar: 'bg-rose-600',
        icon: ShieldAlert
      };

  const Icon = badgeTheme.icon;

  return (
    <div className={`p-5 rounded-3xl border shadow-sm ${badgeTheme.bg}`}>
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${badgeTheme.badge}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              {t.risk.overallAssessment}
            </span>
            <h4 className="text-base font-extrabold tracking-tight">
              {getRiskLevelName(risk.level, language)} ({risk.totalRiskScore}/100)
            </h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black font-serif">
            {risk.totalRiskScore}
          </span>
          <span className="text-xs text-gray-500 font-bold block">
            / 100
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${badgeTheme.bar}`}
            style={{ width: `${risk.totalRiskScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-gray-500 mt-1">
          <span>0 ({t.risk.safe})</span>
          <span>30 ({t.risk.low})</span>
          <span>60 ({t.risk.medium})</span>
          <span>100 ({t.risk.highRisk})</span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-5 pt-4 border-t border-gray-200/70 space-y-3">
          <span className="text-xs font-bold text-gray-700 block">
            {t.risk.whyThisScore}
          </span>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-gray-200 flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500">{t.risk.water}</p>
                <p className="font-bold text-gray-900">{risk.waterRisk} / 35</p>
              </div>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-gray-200 flex items-center space-x-2">
              <CloudSun className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500">{t.risk.weather}</p>
                <p className="font-bold text-gray-900">{risk.weatherRisk} / 25</p>
              </div>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-gray-200 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500">{t.risk.planting}</p>
                <p className="font-bold text-gray-900">{risk.plantingRisk} / 20</p>
              </div>
            </div>

            <div className="bg-white/80 p-2.5 rounded-xl border border-gray-200 flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-500">{t.risk.financial}</p>
                <p className="font-bold text-gray-900">{risk.costRisk} / 20</p>
              </div>
            </div>
          </div>

          {/* Explicit Reasons list */}
          {risk.reasons.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-xs text-gray-700 bg-white/60 p-3 rounded-2xl border border-gray-200">
              {risk.reasons.map((r, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-farm-700 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
