import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCropName } from '../utils/localization';
import { 
  X, 
  Calculator, 
  Scale, 
  Coins, 
  TrendingUp, 
  ShieldAlert, 
  HelpCircle,
  Database
} from 'lucide-react';

interface CalculationExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculationExplainerModal: React.FC<CalculationExplainerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { activeResult, activeScenario, language } = useApp();
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const ledger = activeResult.calculationLedger;
  const crop = activeResult.crop;
  const cropName = getCropName(crop, language);

  const steps = [
    { id: 1, title: language === 'mr' ? '१. उत्पादन गणित' : language === 'hi' ? '१. पैदावार गणना' : '1. Yield Formula', icon: Scale },
    { id: 2, title: language === 'mr' ? '२. उत्पन्न (Revenue)' : language === 'hi' ? '२. कुल आमदनी' : '2. Revenue', icon: Coins },
    { id: 3, title: language === 'mr' ? '३. लागवड खर्च' : language === 'hi' ? '३. उत्पादन लागत' : '3. Costs Breakdown', icon: Calculator },
    { id: 4, title: language === 'mr' ? '४. निव्वळ नफा' : language === 'hi' ? '४. शुद्ध मुनाफा' : '4. Net Profit', icon: TrendingUp },
    { id: 5, title: language === 'mr' ? '५. ब्रेक-इव्हन व जोखीम' : language === 'hi' ? '५. ब्रेक-ईवन व अनिश्चितता' : '5. Break-Even & Certainty', icon: ShieldAlert },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-farm-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-farm-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black font-serif">
                  {language === 'mr' ? 'हे गणित कसे केले जाते?' : language === 'hi' ? 'यह गणना कैसे की जाती है?' : 'How is this calculated?'}
                </h3>
                <span className="text-[11px] bg-emerald-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full uppercase">
                  {language === 'mr' ? 'पारदर्शक हिशोब' : language === 'hi' ? 'पारदर्शी बहीखाता' : 'Audit Ledger'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                {language === 'mr'
                  ? `${cropName} • ${activeScenario.landAreaAcres} एकर • कोणतेही छुपे अंदाज नाहीत`
                  : language === 'hi'
                  ? `${cropName} • ${activeScenario.landAreaAcres} एकड़ • शून्य अस्पष्टता`
                  : `${cropName} on ${activeScenario.landAreaAcres} Acres • Fully deterministic agronomic arithmetic`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50/80 px-4 sm:px-6 overflow-x-auto scrollbar-none shrink-0">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'border-farm-600 text-farm-900 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-farm-600' : 'text-gray-400'}`} />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-gray-800 text-sm">
          {/* Step 1: Yield Calculation */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-farm-50/60 p-4 rounded-2xl border border-farm-200">
                <span className="text-xs font-bold text-farm-800 uppercase tracking-wider block mb-1">
                  {language === 'mr' ? 'मूलभूत कृषी सूत्र (ICAR / FAO-56)' : language === 'hi' ? 'मूल कृषि सूत्र (ICAR / FAO-56)' : 'Agronomic Yield Formula'}
                </span>
                <code className="text-xs sm:text-sm font-mono text-farm-950 font-bold block bg-white p-3 rounded-xl border border-farm-300">
                  {ledger?.yieldFormula || 'Expected Yield = Base Yield × Water Factor × Weather Factor × Planting Factor × Input Factor'}
                </code>
              </div>

              {/* Plugged in numbers */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  {language === 'mr' ? 'आपल्या शेताची प्रत्यक्ष आकडेवारी:' : language === 'hi' ? 'आपके खेत के वास्तविक आंकड़े:' : 'Plugged-in Simulation Numbers:'}
                </span>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">{language === 'mr' ? 'मूळ उत्पादन क्षमता (Base Yield):' : language === 'hi' ? 'मानक आधार उपज:' : 'Base Yield:'}</span>
                    <span className="font-bold text-gray-900">{activeResult.baseYieldQuintals} क्विंटल ({activeResult.baseYieldTonnes} टन)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">{language === 'mr' ? 'पाण्याचा गुणक (Water Factor):' : language === 'hi' ? 'जल कारक (Water Factor):' : 'Water Factor:'}</span>
                    <span className="font-bold text-gray-900">× {activeResult.factors.waterFactor} ({activeScenario.waterAvailabilityPct}% पाणी)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">{language === 'mr' ? 'हवामानाचा गुणक (Weather Factor):' : language === 'hi' ? 'मौसम कारक (Weather Factor):' : 'Weather Factor:'}</span>
                    <span className="font-bold text-gray-900">× {activeResult.factors.weatherFactor ?? Number((activeResult.factors.rainfallFactor * activeResult.factors.temperatureFactor).toFixed(2))} (पाऊस: {activeScenario.rainfallMm || activeScenario.rainfall}, तापमान: {activeScenario.temperatureCelsius || activeScenario.temperature}°C)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">{language === 'mr' ? 'पेरणी वेळेचा गुणक (Planting Factor):' : language === 'hi' ? 'बुवाई समय कारक (Planting Factor):' : 'Planting Factor:'}</span>
                    <span className="font-bold text-gray-900">× {activeResult.factors.plantingFactor} ({activeScenario.plantingDate})</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">{language === 'mr' ? 'खत व औषध गुणक (Input Factor):' : language === 'hi' ? 'उर्वरक/कीटनाशक कारक:' : 'Input Factor:'}</span>
                    <span className="font-bold text-gray-900">× {activeResult.factors.inputFactor}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-farm-100/70 px-3 rounded-lg border border-farm-200 text-farm-900 font-bold text-sm">
                    <span>{language === 'mr' ? 'एकत्रित गुणक (Combined Multiplier):' : language === 'hi' ? 'कुल गुणक (Combined Multiplier):' : 'Combined Multiplier:'}</span>
                    <span>= {activeResult.factors.combinedFactor}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-emerald-100 px-3 rounded-lg border border-emerald-300 text-emerald-950 font-bold text-sm">
                    <span>{language === 'mr' ? 'अपेक्षित अंतिम उत्पादन (Expected Yield):' : language === 'hi' ? 'अपेक्षित अंतिम पैदावार:' : 'Final Expected Yield:'}</span>
                    <span>= {activeResult.expectedYieldQuintals} क्विंटल ({activeResult.expectedYieldTonnes} टन)</span>
                  </div>
                </div>
              </div>

              {/* Unit explanation */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{language === 'mr' ? 'प्रमाण:' : language === 'hi' ? 'इकाई प्रमाण:' : 'Unit Standard:'}</strong> 1 टन = 10 क्विंटल = 1,000 किलो. कृषी उत्पन्न बाजार समिती (APMC) मध्ये भाव क्विंटलमध्ये दिला जातो.
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Revenue Calculation */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-farm-50/60 p-4 rounded-2xl border border-farm-200">
                <span className="text-xs font-bold text-farm-800 uppercase tracking-wider block mb-1">
                  {language === 'mr' ? 'उत्पन्न सूत्र (Gross Revenue Formula)' : language === 'hi' ? 'कुल आमदनी सूत्र' : 'Gross Revenue Formula'}
                </span>
                <code className="text-xs sm:text-sm font-mono text-farm-950 font-bold block bg-white p-3 rounded-xl border border-farm-300">
                  {ledger?.revenueFormula || 'Revenue = Expected Yield (Tonnes) × Market Price (₹/Tonne)'}
                </code>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">{language === 'mr' ? 'अपेक्षित उत्पादन (टन):' : language === 'hi' ? 'अपेक्षित उपज (टन):' : 'Expected Yield (Tonnes):'}</span>
                    <span className="font-bold text-gray-900">{activeResult.expectedYieldTonnes} टन</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200">
                    <span className="text-gray-600">{language === 'mr' ? 'बाजारभाव / हमीभाव प्रति टन:' : language === 'hi' ? 'बाजार मूल्य प्रति टन:' : 'Market Price per Tonne:'}</span>
                    <span className="font-bold text-gray-900">× ₹{activeResult.marketPricePerTonne.toLocaleString('en-IN')}/टन</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 text-gray-500">
                    <span>{language === 'mr' ? '(क्विंटल प्रमाणे भाव):' : language === 'hi' ? '(क्विंटल के अनुसार भाव):' : '(Per Quintal Price):'}</span>
                    <span>₹{activeResult.marketPricePerQuintal.toLocaleString('en-IN')}/क्विंटल</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-emerald-100 px-3 rounded-lg border border-emerald-300 text-emerald-950 font-bold text-sm">
                    <span>{language === 'mr' ? 'एकूण स्थूल उत्पन्न (Total Revenue):' : language === 'hi' ? 'कुल आमदनी (Total Revenue):' : 'Total Revenue:'}</span>
                    <span>= ₹{activeResult.estimatedRevenue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Market citation */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900 flex items-start space-x-2">
                <Database className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{language === 'mr' ? 'बाजारभाव स्त्रोत व तारीख:' : language === 'hi' ? 'बाजार भाव स्रोत व दिनांक:' : 'Market Price Source & Date:'}</span>
                  <p className="text-[11px] text-sky-800 mt-0.5">
                    {ledger?.marketDataSource || 'Agmarknet APMC Mandi Benchmark & CACP 2025-26 minimum support price notification.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Costs Breakdown */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-farm-50/60 p-4 rounded-2xl border border-farm-200">
                <span className="text-xs font-bold text-farm-800 uppercase tracking-wider block mb-1">
                  {language === 'mr' ? 'एकूण लागवड खर्च सूत्र' : language === 'hi' ? 'कुल उत्पादन लागत सूत्र' : 'Total Input Cost Formula'}
                </span>
                <code className="text-xs sm:text-sm font-mono text-farm-950 font-bold block bg-white p-3 rounded-xl border border-farm-300">
                  {ledger?.costFormula || 'Total Cost = Seed + Fertilizer + Pesticide + Irrigation + Labour + Other'}
                </code>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3">{language === 'mr' ? 'खर्चाची बाब' : language === 'hi' ? 'लागत मद' : 'Cost Item'}</th>
                      <th className="p-3 text-right">{language === 'mr' ? 'एकूण रक्कम' : language === 'hi' ? 'कुल राशि' : 'Total Amount'}</th>
                      <th className="p-3 text-right">{language === 'mr' ? 'दर एकरी' : language === 'hi' ? 'प्रति एकड़' : 'Per Acre'}</th>
                      <th className="p-3 text-right">{language === 'mr' ? 'टक्केवारी' : language === 'hi' ? 'हिस्सा' : 'Share'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    <tr>
                      <td className="p-3 font-sans font-medium">{language === 'mr' ? 'बियाणे / रोपे' : language === 'hi' ? 'बीज / पौधे' : 'Seed / Seedlings'}</td>
                      <td className="p-3 text-right font-bold">₹{activeResult.costs.seed.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">₹{Math.round(activeResult.costs.seed / activeResult.landAreaAcres).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">{((activeResult.costs.seed / activeResult.costs.total) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-medium">{language === 'mr' ? 'रासायनिक व सेंद्रिय खते' : language === 'hi' ? 'उर्वरक' : 'Fertilizers'}</td>
                      <td className="p-3 text-right font-bold">₹{activeResult.costs.fertilizer.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">₹{Math.round(activeResult.costs.fertilizer / activeResult.landAreaAcres).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">{((activeResult.costs.fertilizer / activeResult.costs.total) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-medium">{language === 'mr' ? 'कीटकनाशके व तणनाशके' : language === 'hi' ? 'कीटनाशक व खरपतवार' : 'Pesticides & Weeding'}</td>
                      <td className="p-3 text-right font-bold">₹{activeResult.costs.pesticide.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">₹{Math.round(activeResult.costs.pesticide / activeResult.landAreaAcres).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">{((activeResult.costs.pesticide / activeResult.costs.total) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-medium">{language === 'mr' ? 'सिंचन व वीज खर्च' : language === 'hi' ? 'सिंचाई व बिजली' : 'Irrigation & Electricity'}</td>
                      <td className="p-3 text-right font-bold">₹{activeResult.costs.irrigation.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">₹{Math.round(activeResult.costs.irrigation / activeResult.landAreaAcres).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">{((activeResult.costs.irrigation / activeResult.costs.total) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-medium">{language === 'mr' ? 'मजुरी व कापणी खर्च' : language === 'hi' ? 'मजदूरी एवं कटाई' : 'Labour & Harvesting'}</td>
                      <td className="p-3 text-right font-bold">₹{activeResult.costs.labour.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">₹{Math.round(activeResult.costs.labour / activeResult.landAreaAcres).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">{((activeResult.costs.labour / activeResult.costs.total) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans font-medium">{language === 'mr' ? 'वाहतूक व इतर खर्च' : language === 'hi' ? 'परिवहन व अन्य' : 'Transport & Misc'}</td>
                      <td className="p-3 text-right font-bold">₹{activeResult.costs.other.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">₹{Math.round(activeResult.costs.other / activeResult.landAreaAcres).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-gray-500">{((activeResult.costs.other / activeResult.costs.total) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr className="bg-farm-50 text-farm-900 font-bold text-sm">
                      <td className="p-3 font-sans">{language === 'mr' ? 'एकूण खर्च (Total Cost)' : language === 'hi' ? 'कुल लागत' : 'Total Cost'}</td>
                      <td className="p-3 text-right">₹{activeResult.costs.total.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right">₹{Math.round(activeResult.costs.total / activeResult.landAreaAcres).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step 4: Net Profit Calculation */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-farm-50/60 p-4 rounded-2xl border border-farm-200">
                <span className="text-xs font-bold text-farm-800 uppercase tracking-wider block mb-1">
                  {language === 'mr' ? 'निव्वळ नफा सूत्र (Net Profit Formula)' : language === 'hi' ? 'शुद्ध मुनाफा सूत्र' : 'Net Profit Formula'}
                </span>
                <code className="text-xs sm:text-sm font-mono text-farm-950 font-bold block bg-white p-3 rounded-xl border border-farm-300">
                  {ledger?.profitFormula || 'Net Profit = Estimated Revenue - Total Costs'}
                </code>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-600 font-sans">{language === 'mr' ? 'एकूण उत्पन्न (Revenue):' : language === 'hi' ? 'कुल आमदनी (Revenue):' : 'Total Revenue:'}</span>
                  <span className="font-bold text-emerald-700 text-sm">₹{activeResult.estimatedRevenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-600 font-sans">{language === 'mr' ? 'वजा: एकूण खर्च (Less Costs):' : language === 'hi' ? 'घटाएं: कुल लागत (Costs):' : 'Less: Total Costs:'}</span>
                  <span className="font-bold text-rose-700 text-sm">- ₹{activeResult.costs.total.toLocaleString('en-IN')}</span>
                </div>
                <div className={`flex justify-between items-center py-2 px-3 rounded-xl border text-base font-bold ${
                  activeResult.estimatedProfit >= 0
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                    : 'bg-rose-100 border-rose-300 text-rose-950'
                }`}>
                  <span className="font-sans">{language === 'mr' ? 'अंतिम निव्वळ नफा (Net Profit):' : language === 'hi' ? 'शुद्ध मुनाफा (Net Profit):' : 'Net Farmer Profit:'}</span>
                  <span>= ₹{activeResult.estimatedProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1 text-gray-600 font-sans">
                  <span>{language === 'mr' ? 'नफ्याचे प्रमाण (Profit Margin %):' : language === 'hi' ? 'मुनाफा प्रतिशत:' : 'Profit Margin %:'}</span>
                  <span className="font-bold text-gray-900 font-mono">{activeResult.profitMarginPct}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Break-Even & Confidence Range */}
          {activeStep === 5 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Break-even box */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
                  {language === 'mr' ? 'ब्रेक-इव्हन विश्लेषण (नफा नाही, तोटा नाही)' : language === 'hi' ? 'ब्रेक-ईवन विश्लेषण (नो लॉस, नो प्रॉफिट)' : 'Break-Even Thresholds (Zero Loss)'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block mb-0.5">{language === 'mr' ? 'किमान आवश्यक उत्पादन (Break-Even Yield):' : language === 'hi' ? 'न्यूनतम जरूरी पैदावार:' : 'Break-Even Yield:'}</span>
                    <span className="font-bold text-base text-gray-900 font-mono">
                      {ledger?.breakEvenYieldTonnes || (activeResult.costs.total / activeResult.marketPricePerTonne).toFixed(2)} टन
                    </span>
                    <span className="text-gray-500 block text-[11px] mt-0.5">
                      ({Number(((activeResult.costs.total / activeResult.marketPricePerTonne) * 10).toFixed(1))} क्विंटल)
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block mb-0.5">{language === 'mr' ? 'किमान आवश्यक बाजारभाव (Break-Even Price):' : language === 'hi' ? 'न्यूनतम जरूरी भाव:' : 'Break-Even Price:'}</span>
                    <span className="font-bold text-base text-gray-900 font-mono">
                      ₹{activeResult.costPerTonne.toLocaleString('en-IN')}/टन
                    </span>
                    <span className="text-gray-500 block text-[11px] mt-0.5">
                      (₹{activeResult.costPerQuintal.toLocaleString('en-IN')}/क्विंटल)
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence Band Box */}
              <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs text-sky-900 font-bold">
                  <ShieldAlert className="w-4 h-4 text-sky-600" />
                  <span>{language === 'mr' ? '९०% सांख्यिकीय निश्चितता मर्यादा (Confidence Band)' : language === 'hi' ? '९०% सांख्यिकीय सटीकता सीमा' : '90% Statistical Confidence Interval'}</span>
                </div>
                <p className="text-xs text-sky-800 leading-relaxed">
                  {language === 'mr'
                    ? 'हवामानातील अनपेक्षित बदलांमुळे (उदा. उशिरा पाऊस, उष्ण वारे) प्रत्यक्ष उत्पादन व नफा या मर्यादेत राहण्याची ९०% शक्यता आहे:'
                    : language === 'hi'
                    ? 'मौसम के उतार-चढ़ाव के कारण वास्तविक उपज एवं मुनाफा इस सीमा के भीतर रहने की ९०% संभावना है:'
                    : 'Accounting for real-world micro-climate variance, expected outcomes fall within this 90% confidence envelope:'}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-sky-200">
                    <span className="text-gray-500 block">{language === 'mr' ? 'उत्पादन मर्यादा:' : language === 'hi' ? 'पैदावार सीमा:' : 'Yield Range:'}</span>
                    <span className="font-bold text-gray-900 font-mono">
                      {activeResult.confidenceInterval.yieldMinQuintals} - {activeResult.confidenceInterval.yieldMaxQuintals} Q
                    </span>
                    <span className="text-gray-500 block text-[11px]">
                      ({activeResult.confidenceInterval.yieldMinTonnes} - {activeResult.confidenceInterval.yieldMaxTonnes} T)
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-sky-200">
                    <span className="text-gray-500 block">{language === 'mr' ? 'नफा मर्यादा:' : language === 'hi' ? 'मुनाफा सीमा:' : 'Profit Range:'}</span>
                    <span className="font-bold text-emerald-800 font-mono">
                      ₹{activeResult.confidenceInterval.profitMin.toLocaleString('en-IN')} - ₹{activeResult.confidenceInterval.profitMax.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            {language === 'mr' ? 'स्टेप ' : language === 'hi' ? 'चरण ' : 'Step '} {activeStep} / {steps.length}
          </span>
          <div className="flex items-center space-x-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100"
              >
                {language === 'mr' ? 'मागे' : language === 'hi' ? 'पीछे' : 'Back'}
              </button>
            )}
            {activeStep < steps.length ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-4 py-1.5 rounded-xl bg-farm-700 hover:bg-farm-800 text-white text-xs font-bold transition-all"
              >
                {language === 'mr' ? 'पुढील स्टेप' : language === 'hi' ? 'अगला चरण' : 'Next Step'}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all"
              >
                {language === 'mr' ? 'पूर्ण समजले' : language === 'hi' ? 'समझ गया' : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
