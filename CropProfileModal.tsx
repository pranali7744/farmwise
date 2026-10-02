import React from 'react';
import { useApp } from '../context/AppContext';
import { CROPS_DATA } from '../data/crops';
import { CropId } from '../types';
import { getCropName } from '../utils/localization';
import { 
  X, 
  Calendar, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  Coins, 
  Scale, 
  ShieldCheck, 
  Info
} from 'lucide-react';

interface CropProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCropId?: CropId;
  onSelectCrop?: (cropId: CropId) => void;
}

export const CropProfileModal: React.FC<CropProfileModalProps> = ({
  isOpen,
  onClose,
  selectedCropId,
  onSelectCrop
}) => {
  const { activeScenario, updateScenario, language } = useApp();

  if (!isOpen) return null;

  const currentCropId = selectedCropId || activeScenario.cropId || 'sugarcane';
  const crop = CROPS_DATA[currentCropId] || CROPS_DATA.sugarcane;

  const cropName = getCropName(crop, language);
  const plantingLabel = 
    language === 'mr' 
      ? crop.recommendedPlanting.marathiLabel 
      : language === 'hi' 
      ? crop.recommendedPlanting.hindiLabel 
      : crop.recommendedPlanting.label;

  const handleApplyCrop = (id: CropId) => {
    if (onSelectCrop) {
      onSelectCrop(id);
    } else {
      updateScenario(activeScenario.id, { cropId: id });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-farm-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-farm-800 to-farm-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-3xl p-2 bg-white/10 rounded-2xl border border-white/20">
              {crop.icon}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-black font-serif">
                  {cropName} {language === 'mr' ? 'पीक माहिती व मानके' : language === 'hi' ? 'फसल प्रोफ़ाइल व मानक' : 'Crop Profile & Standards'}
                </h3>
                {crop.scientificName && (
                  <span className="text-xs bg-farm-500/30 text-farm-200 px-2 py-0.5 rounded-full border border-farm-400/40">
                    {crop.scientificName}
                  </span>
                )}
              </div>
              <p className="text-xs text-farm-200 mt-0.5">
                {language === 'mr' 
                  ? 'भारतीय कृषी संशोधन परिषद (ICAR) आणि कृषी मूल्य आयोग (CACP) अधिकृत मानके' 
                  : language === 'hi' 
                  ? 'भारतीय कृषि अनुसंधान परिषद (ICAR) एवं CACP द्वारा सत्यापित मानक' 
                  : 'Official agronomy benchmarks from ICAR & Govt MSP CACP 2025-26'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-farm-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-gray-800 text-sm">
          {/* Crop Switcher Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
              {language === 'mr' ? 'इतर पिके:' : language === 'hi' ? 'अन्य फसलें:' : 'Switch Crop:'}
            </span>
            {(Object.keys(CROPS_DATA) as CropId[]).map((cId) => {
              const c = CROPS_DATA[cId];
              const isSelected = cId === currentCropId;
              return (
                <button
                  key={cId}
                  onClick={() => handleApplyCrop(cId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-farm-700 text-white shadow-sm ring-2 ring-farm-500 ring-offset-1'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{getCropName(c, language)}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-farm-50/70 p-3.5 rounded-2xl border border-farm-200">
              <div className="flex items-center space-x-1.5 text-xs text-farm-800 font-bold mb-1">
                <Scale className="w-4 h-4 text-farm-600" />
                <span>{language === 'mr' ? 'प्रमाणित उत्पादन (ICAR)' : language === 'hi' ? 'मानक पैदावार (ICAR)' : 'Benchmark Yield'}</span>
              </div>
              <div className="text-lg font-black text-gray-900">
                {crop.baseYieldPerAcreQuintals || (crop.baseYieldPerAcreTonnes * 10)} <span className="text-xs font-semibold text-gray-600">क्विंटल/एकर</span>
              </div>
              <div className="text-xs text-gray-500">
                ({crop.baseYieldPerAcreTonnes} टन/एकर)
              </div>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
              <div className="flex items-center space-x-1.5 text-xs text-amber-800 font-bold mb-1">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>{language === 'mr' ? 'हमीभाव (MSP 2025-26)' : language === 'hi' ? 'एमएसपी (MSP 2025-26)' : 'Govt MSP / FRP'}</span>
              </div>
              <div className="text-lg font-black text-amber-950">
                ₹{crop.MSPPerQuintal.toLocaleString('en-IN')} <span className="text-xs font-semibold text-amber-800">/क्विंटल</span>
              </div>
              <div className="text-xs text-amber-700">
                (₹{crop.MSPPerTonne.toLocaleString('en-IN')}/टन)
              </div>
            </div>

            <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200">
              <div className="flex items-center space-x-1.5 text-xs text-sky-800 font-bold mb-1">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>{language === 'mr' ? 'पाण्याची एकूण गरज' : language === 'hi' ? 'कुल जल आवश्यकता' : 'Water Need'}</span>
              </div>
              <div className="text-lg font-black text-sky-950">
                {(crop.waterRequirementLitersPerAcre / 100000).toFixed(1)} <span className="text-xs font-semibold text-sky-700">लाख लिटर</span>
              </div>
              <div className="text-xs text-sky-600">
                (दर एकरी प्रति हंगाम)
              </div>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
              <div className="flex items-center space-x-1.5 text-xs text-emerald-800 font-bold mb-1">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{language === 'mr' ? 'कालावधी व हंगाम' : language === 'hi' ? 'अवधि एवं मौसम' : 'Duration'}</span>
              </div>
              <div className="text-lg font-black text-emerald-950">
                {crop.durationDays} <span className="text-xs font-semibold text-emerald-700">{language === 'mr' ? 'दिवस' : language === 'hi' ? 'दिन' : 'days'}</span>
              </div>
              <div className="text-xs text-emerald-700 font-medium">
                {crop.season || crop.durationDays > 300 ? 'वार्षिक (Annual)' : 'खरीप/रब्बी (Kharif/Rabi)'}
              </div>
            </div>
          </div>

          {/* Sowing & Agro-climatic requirements */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-farm-600" />
              <span>{language === 'mr' ? 'हवामान व पेरणी अनुकूलता' : language === 'hi' ? 'जलवायु एवं बुवाई उपयुक्तता' : 'Agro-Climatic Requirements'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-gray-700">{language === 'mr' ? 'योग्य पेरणी कालावधी:' : language === 'hi' ? 'अनुशंसित बुवाई अवधि:' : 'Planting Window:'}</span>
                  <p className="text-gray-900 font-semibold mt-0.5">{plantingLabel}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <CloudRain className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-gray-700">{language === 'mr' ? 'सरासरी पाऊस (ICAR):' : language === 'hi' ? 'सामान्य वर्षा (ICAR):' : 'Normal Rainfall:'}</span>
                  <p className="text-gray-900 font-semibold mt-0.5">{crop.normalRainfallMm} mm</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Thermometer className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-gray-700">{language === 'mr' ? 'अनुकूल तापमान:' : language === 'hi' ? 'अनुकूल तापमान:' : 'Optimal Temp:'}</span>
                  <p className="text-gray-900 font-semibold mt-0.5">{crop.optimalTempCelsius}°C (20°C - 35°C)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Watering Stages */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>{language === 'mr' ? 'पाणी देण्याचे अतिसंवेदनशील टप्पे (Critical Growth Stages)' : language === 'hi' ? 'सिंचाई के संवेदनशील चरण (Critical Stages)' : 'Critical Irrigation Stages (Zero Stress)'}</span>
            </h4>
            <p className="text-xs text-gray-500">
              {language === 'mr' 
                ? 'या टप्प्यांवर पाण्याचा तुटवडा झाल्यास उत्पादनात सर्वात जास्त घट होते:' 
                : language === 'hi' 
                ? 'इन चरणों में पानी की कमी होने पर पैदावार में सबसे भारी गिरावट आती है:' 
                : 'Water deficits occurring at these stages cause maximum percentage yield penalties:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {crop.criticalWaterStages.map((stage, idx) => {
                const stageName = language === 'mr' ? stage.marathiStage : language === 'hi' ? stage.hindiStage : stage.stage;
                const stageDesc = language === 'mr' ? (stage.marathiDesc || stage.importance) : language === 'hi' ? (stage.hindiDesc || stage.importance) : (stage.description || stage.importance);
                return (
                  <div key={idx} className="p-3 rounded-xl border border-sky-100 bg-sky-50/40 flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-sky-200 text-sky-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-xs">{stageName}</span>
                        <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded font-semibold">
                          {stage.daysAfterSowing || `${stage.importance}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{stageDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standard Input Costs per Acre */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>{language === 'mr' ? 'प्रमाणित एकरी खर्च (ICAR Benchmark Cost/Acre)' : language === 'hi' ? 'मानक प्रति एकड़ लागत (ICAR Benchmark)' : 'Standard Input Costs per Acre'}</span>
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 block text-[10px]">{language === 'mr' ? 'बियाणे' : language === 'hi' ? 'बीज' : 'Seed'}</span>
                <span className="font-bold text-gray-900">₹{crop.typicalCostsPerAcre.seed.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 block text-[10px]">{language === 'mr' ? 'खते' : language === 'hi' ? 'उर्वरक' : 'Fertilizer'}</span>
                <span className="font-bold text-gray-900">₹{crop.typicalCostsPerAcre.fertilizer.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 block text-[10px]">{language === 'mr' ? 'कीटकनाशके' : language === 'hi' ? 'कीटनाशक' : 'Pesticide'}</span>
                <span className="font-bold text-gray-900">₹{crop.typicalCostsPerAcre.pesticide.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 block text-[10px]">{language === 'mr' ? 'सिंचन' : language === 'hi' ? 'सिंचाई' : 'Irrigation'}</span>
                <span className="font-bold text-gray-900">₹{crop.typicalCostsPerAcre.irrigation.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 block text-[10px]">{language === 'mr' ? 'मजुरी' : language === 'hi' ? 'मजदूरी' : 'Labour'}</span>
                <span className="font-bold text-gray-900">₹{crop.typicalCostsPerAcre.labour.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <span className="text-gray-500 block text-[10px]">{language === 'mr' ? 'इतर' : language === 'hi' ? 'अन्य' : 'Other'}</span>
                <span className="font-bold text-gray-900">₹{crop.typicalCostsPerAcre.other.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Official Benchmark Citation */}
          <div className="bg-farm-50 p-3.5 rounded-xl border border-farm-200 text-xs text-farm-900 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-farm-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{language === 'mr' ? 'माहितीचा अधिकृत संदर्भ:' : language === 'hi' ? 'आधिकारिक स्रोत संदर्भ:' : 'Official Data Reference:'}</span>
              <p className="text-farm-800 text-[11px] mt-0.5">
                {crop.benchmarkCitation || crop.sourceCitation || 'ICAR Agronomy Handbook 2024, Directorate of Economics and Statistics, Ministry of Agriculture & Farmers Welfare, Government of India (MSP 2025-26 notification).'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-gray-500">
            {language === 'mr' ? 'आपले सध्याचे शेत:' : language === 'hi' ? 'वर्तमान रकबा:' : 'Active Acreage:'} <span className="font-bold text-gray-800">{activeScenario.landAreaAcres} {language === 'mr' ? 'एकर' : language === 'hi' ? 'एकड़' : 'Acres'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-farm-700 hover:bg-farm-800 text-white font-bold text-xs shadow transition-all active:scale-95"
          >
            {language === 'mr' ? 'समजले / बंद करा' : language === 'hi' ? 'समझ गया / बंद करें' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
