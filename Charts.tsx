import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { FactorImpact, SimulationResult } from '../types';
import { useApp } from '../context/AppContext';
import { getCropName } from '../utils/localization';

interface FactorImpactChartProps {
  factorImpacts: FactorImpact[];
}

export const FactorImpactChart: React.FC<FactorImpactChartProps> = ({ factorImpacts }) => {
  const { language } = useApp();

  const data = factorImpacts.map((f) => ({
    name: f.name,
    contribution: f.contributionPct,
    pctChange: f.pctChange,
    status: f.status
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#dc2626'; // rose-600
      case 'negative':
        return '#f97316'; // orange-500
      case 'positive':
        return '#16a34a'; // green-600
      default:
        return '#0284c7'; // sky-600
    }
  };

  const getTooltipText = (value: any, item: any) => {
    const sign = item.payload.pctChange > 0 ? '+' : '';
    if (language === 'mr') {
      return `${value}% प्रभाव (${sign}${item.payload.pctChange}% उत्पादनावर परिणाम)`;
    }
    if (language === 'hi') {
      return `${value}% प्रभाव (${sign}${item.payload.pctChange}% उपज पर असर)`;
    }
    return `${value}% contribution (${sign}${item.payload.pctChange}% impact on yield)`;
  };

  const factorWeightLabel = language === 'mr' ? 'घटकाचा भार' : language === 'hi' ? 'घटक भार' : 'Factor Weight';

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, left: 90, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
          <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
            width={95}
          />
          <Tooltip
            formatter={(value: any, _: any, item: any) => [
              getTooltipText(value, item),
              factorWeightLabel
            ]}
            contentStyle={{ borderRadius: '12px', border: '1px solid #d1d5db', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Bar dataKey="contribution" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface FinancialBreakdownChartProps {
  result: SimulationResult;
}

export const FinancialBreakdownChart: React.FC<FinancialBreakdownChartProps> = ({ result }) => {
  const { language, t } = useApp();

  const data = [
    {
      name: t.form.seedCost.split('/')[0].trim(),
      cost: result.costs.seed
    },
    {
      name: t.form.fertilizerCost.split('&')[0].trim(),
      cost: result.costs.fertilizer
    },
    {
      name: t.form.pesticideCost.split('&')[0].trim(),
      cost: result.costs.pesticide
    },
    {
      name: t.form.irrigationCost.split('&')[0].trim(),
      cost: result.costs.irrigation
    },
    {
      name: t.form.labourCost.split(' ')[0].trim(),
      cost: result.costs.labour
    },
    {
      name: t.form.otherCost.split('&')[0].trim(),
      cost: result.costs.other
    }
  ];

  const costLabel = language === 'mr' ? 'खर्च' : language === 'hi' ? 'लागत' : 'Cost';

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }} />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, costLabel]}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="cost" fill="#059669" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ScenarioComparisonChartProps {
  scenarios: SimulationResult[];
}

export const ScenarioComparisonChart: React.FC<ScenarioComparisonChartProps> = ({ scenarios }) => {
  const { language, t } = useApp();

  const data = scenarios.map((s, idx) => {
    const cropTitle = getCropName(s.crop, language);
    return {
      name: cropTitle + (scenarios.length > 1 ? ` (${String.fromCharCode(65 + idx)})` : ''),
      yield: s.expectedYieldTonnes,
      cost: Math.round(s.costs.total / 1000), // in Thousands ₹
      revenue: Math.round(s.estimatedRevenue / 1000),
      profit: Math.round(s.estimatedProfit / 1000),
      risk: s.risk.totalRiskScore
    };
  });

  const yieldLabel = `${t.results.expectedYield} (${t.common.tonnes})`;
  const profitLabel = `${t.results.profit} (k ₹)`;
  const costLabel = `${t.results.totalCost} (k ₹)`;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#1f2937', fontWeight: 700 }} />
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 11, fill: '#059669' }}
            unit={` ${t.common.tonnes}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11, fill: '#d97706' }}
            unit="k ₹"
          />
          <Tooltip
            formatter={(val: any, name: any) => {
              if (name === yieldLabel) return [`${val} ${t.common.tonnes}`, name];
              return [`₹${val}k (₹${(val * 1000).toLocaleString('en-IN')})`, name];
            }}
            contentStyle={{ borderRadius: '12px', border: '1px solid #d1d5db' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar
            yAxisId="left"
            dataKey="yield"
            name={yieldLabel}
            fill="#10b981"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="profit"
            name={profitLabel}
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="cost"
            name={costLabel}
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface WaterComparisonChartProps {
  result: SimulationResult;
}

export const WaterComparisonChart: React.FC<WaterComparisonChartProps> = ({ result }) => {
  const { language } = useApp();

  const reqName = language === 'mr' ? 'पाण्याची गरज' : language === 'hi' ? 'आवश्यक पानी' : 'Required Water';
  const availName = language === 'mr' ? 'उपलब्ध पाणी' : language === 'hi' ? 'उपलब्ध पानी' : 'Available Water';
  const lakhLitresLabel = language === 'mr' ? 'लाख लिटर' : language === 'hi' ? 'लाख लीटर' : 'Lakh Litres';
  const waterVolumeLabel = language === 'mr' ? 'पाण्याचे प्रमाण' : language === 'hi' ? 'पानी की मात्रा' : 'Water Volume';

  const data = [
    {
      name: reqName,
      liters: Number((result.waterRequiredLiters / 100000).toFixed(2)),
      fill: '#0284c7'
    },
    {
      name: availName,
      liters: Number((result.waterAvailableLiters / 100000).toFixed(2)),
      fill: result.waterDeficitPct > 20 ? '#ef4444' : result.waterDeficitPct > 0 ? '#f59e0b' : '#10b981'
    }
  ];

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} />
          <YAxis unit={` ${lakhLitresLabel}`} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            formatter={(val: any) => [`${val} ${lakhLitresLabel} (${(Number(val) * 100000).toLocaleString('en-IN')} L)`, waterVolumeLabel]}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="liters" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

