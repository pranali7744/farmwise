import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CropId, RainfallLevel, TemperatureLevel, InputLevel, ScenarioInput } from '../types';
import { CROPS_DATA, CROP_LIST } from '../data/crops';
import { PRESET_TEMPLATES } from '../data/presets';
import { evaluatePlantingSchedule } from '../services/simulationEngine';
import { 
  getCropName, 
  getPlantingWindowLabel, 
  getRainfallName, 
  getTemperatureName, 
  getInputLevelName 
} from '../utils/localization';
import { 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ScenarioFormProps {
  initialData?: ScenarioInput;
  onSubmitSuccess?: () => void;
}

export const ScenarioForm: React.FC<ScenarioFormProps> = ({ initialData, onSubmitSuccess }) => {
  const { createScenario, updateScenario, runScenario, t, language, setCurrentTab } = useApp();

  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || 'My Sugarcane Plan');
  const [cropId, setCropId] = useState<CropId>(initialData?.cropId || 'sugarcane');
  const [landAreaAcres, setLandAreaAcres] = useState<number>(initialData?.landAreaAcres ?? 2);
  const [waterAvailabilityPct, setWaterAvailabilityPct] = useState<number>(initialData?.waterAvailabilityPct ?? 100);
  const [plantingDate, setPlantingDate] = useState<string>(initialData?.plantingDate || '2026-06-15');
  const [rainfall, setRainfall] = useState<RainfallLevel>(initialData?.rainfall || 'normal');
  const [temperature, setTemperature] = useState<TemperatureLevel>(initialData?.temperature || 'normal');
  const [fertilizerLevel, setFertilizerLevel] = useState<InputLevel>(initialData?.fertilizerLevel || 'normal');
  const [pesticideLevel, setPesticideLevel] = useState<InputLevel>(initialData?.pesticideLevel || 'normal');

  // Costs
  const selectedCrop = CROPS_DATA[cropId];
  const [seedCost, setSeedCost] = useState<number>(
    initialData?.seedCost ?? selectedCrop.typicalCostsPerAcre.seed * (initialData?.landAreaAcres ?? 2)
  );
  const [fertilizerCost, setFertilizerCost] = useState<number>(
    initialData?.fertilizerCost ?? selectedCrop.typicalCostsPerAcre.fertilizer * (initialData?.landAreaAcres ?? 2)
  );
  const [pesticideCost, setPesticideCost] = useState<number>(
    initialData?.pesticideCost ?? selectedCrop.typicalCostsPerAcre.pesticide * (initialData?.landAreaAcres ?? 2)
  );
  const [irrigationCost, setIrrigationCost] = useState<number>(
    initialData?.irrigationCost ?? selectedCrop.typicalCostsPerAcre.irrigation * (initialData?.landAreaAcres ?? 2)
  );
  const [labourCost, setLabourCost] = useState<number>(
    initialData?.labourCost ?? selectedCrop.typicalCostsPerAcre.labour * (initialData?.landAreaAcres ?? 2)
  );
  const [otherCost, setOtherCost] = useState<number>(
    initialData?.otherCost ?? selectedCrop.typicalCostsPerAcre.other * (initialData?.landAreaAcres ?? 2)
  );
  const [marketPricePerTonne, setMarketPricePerTonne] = useState<number>(
    initialData?.marketPricePerTonne ?? selectedCrop.marketPricePerTonne
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCropChange = (id: CropId) => {
    setCropId(id);
    const crop = CROPS_DATA[id];
    setSeedCost(crop.typicalCostsPerAcre.seed * landAreaAcres);
    setFertilizerCost(crop.typicalCostsPerAcre.fertilizer * landAreaAcres);
    setPesticideCost(crop.typicalCostsPerAcre.pesticide * landAreaAcres);
    setIrrigationCost(crop.typicalCostsPerAcre.irrigation * landAreaAcres);
    setLabourCost(crop.typicalCostsPerAcre.labour * landAreaAcres);
    setOtherCost(crop.typicalCostsPerAcre.other * landAreaAcres);
    setMarketPricePerTonne(crop.marketPricePerTonne);
    setName(`My ${crop.name} Scenario`);
  };

  const handleLandAreaChange = (acres: number) => {
    const validAcres = Math.max(0.1, acres);
    setLandAreaAcres(validAcres);
    const crop = CROPS_DATA[cropId];
    setSeedCost(Math.round(crop.typicalCostsPerAcre.seed * validAcres));
    setFertilizerCost(Math.round(crop.typicalCostsPerAcre.fertilizer * validAcres));
    setPesticideCost(Math.round(crop.typicalCostsPerAcre.pesticide * validAcres));
    setIrrigationCost(Math.round(crop.typicalCostsPerAcre.irrigation * validAcres));
    setLabourCost(Math.round(crop.typicalCostsPerAcre.labour * validAcres));
    setOtherCost(Math.round(crop.typicalCostsPerAcre.other * validAcres));
  };

  const totalWaterRequired = Math.round(selectedCrop.waterRequirementLitersPerAcre * landAreaAcres);
  const totalWaterAvailable = Math.round((totalWaterRequired * waterAvailabilityPct) / 100);
  const waterDeficit = Math.max(0, 100 - waterAvailabilityPct);

  const plantingEval = evaluatePlantingSchedule(cropId, plantingDate, language);

  const totalCost = seedCost + fertilizerCost + pesticideCost + irrigationCost + labourCost + otherCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landAreaAcres || landAreaAcres <= 0) {
      setErrorMessage(language === 'mr' ? 'कृपया ० पेक्षा जास्त योग्य जमीन क्षेत्र टाका.' : language === 'hi' ? 'कृपया ० से अधिक मान्य जमीन रकबा दर्ज करें।' : 'Please enter a valid land area greater than 0 acres.');
      return;
    }
    if (totalCost < 0) {
      setErrorMessage(language === 'mr' ? 'एकूण खर्च ऋण असू शकत नाही.' : language === 'hi' ? 'कुल लागत नकारात्मक नहीं हो सकती।' : 'Total costs cannot be negative.');
      return;
    }
    setErrorMessage(null);

    const scenarioData: Omit<ScenarioInput, 'id'> = {
      name: name.trim() || `Farming Scenario (${selectedCrop.name})`,
      cropId,
      landAreaAcres,
      waterAvailabilityPct,
      plantingDate,
      rainfall,
      temperature,
      fertilizerLevel,
      pesticideLevel,
      seedCost,
      fertilizerCost,
      pesticideCost,
      irrigationCost,
      labourCost,
      otherCost,
      marketPricePerTonne
    };

    if (isEditing && initialData) {
      updateScenario(initialData.id, scenarioData);
      runScenario(initialData.id);
    } else {
      const newId = createScenario(scenarioData);
      runScenario(newId);
    }

    if (onSubmitSuccess) {
      onSubmitSuccess();
    } else {
      setCurrentTab('results');
    }
  };

  const handleApplyPreset = (templateId: string) => {
    const tmpl = PRESET_TEMPLATES.find((p) => p.id === templateId);
    if (!tmpl) return;
    const dummy: ScenarioInput = {
      id: 'temp',
      name,
      cropId,
      landAreaAcres,
      waterAvailabilityPct,
      plantingDate,
      rainfall,
      temperature,
      fertilizerLevel,
      pesticideLevel,
      seedCost,
      fertilizerCost,
      pesticideCost,
      irrigationCost,
      labourCost,
      otherCost,
      marketPricePerTonne
    };
    const mod = tmpl.apply(dummy);
    if (mod.name) setName(mod.name);
    if (mod.waterAvailabilityPct !== undefined) setWaterAvailabilityPct(mod.waterAvailabilityPct);
    if (mod.rainfall) setRainfall(mod.rainfall);
    if (mod.temperature) setTemperature(mod.temperature);
    if (mod.plantingDate) setPlantingDate(mod.plantingDate);
    if (mod.fertilizerCost !== undefined) setFertilizerCost(mod.fertilizerCost);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Form Header */}
      <div className="bg-gradient-to-r from-farm-800 to-farm-700 text-white rounded-3xl p-6 sm:p-8 shadow-farmer-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-farm-200">
              {t.home.heroTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-serif">
              {isEditing ? t.form.editTitle : t.form.title}
            </h2>
            <p className="text-xs sm:text-sm text-farm-100 max-w-2xl">
              {t.form.desc}
            </p>
          </div>

          <div className="w-full md:w-72">
            <label className="text-xs font-bold text-farm-200 block mb-1">
              {t.form.scenarioLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold border border-farm-400 focus:outline-hidden focus:ring-2 focus:ring-farm-300"
              placeholder="e.g. Sugarcane Baseline"
              required
            />
          </div>
        </div>

        {/* Presets Bar */}
        <div className="mt-6 pt-5 border-t border-farm-600/70">
          <div className="flex items-center space-x-2 text-xs font-bold text-farm-200 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t.form.presetsTitle}:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PRESET_TEMPLATES.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className="px-2.5 py-1.5 bg-farm-900/50 hover:bg-farm-900 text-farm-100 hover:text-white rounded-xl text-xs font-medium border border-farm-600 transition-all truncate"
                title={p.description}
              >
                {p.icon} {language === 'mr' ? p.marathiName.replace(/^[^\s]+\s/, '') : language === 'hi' ? p.hindiName.replace(/^[^\s]+\s/, '') : p.name.replace(/^[^\s]+\s/, '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner if any */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-sm font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: CROP & LAND */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-farm-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-farm-100 text-farm-800 flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t.form.step1Title}
            </h3>
            <p className="text-xs text-gray-500">
              {t.form.step1Desc}
            </p>
          </div>
        </div>

        {/* Crop Selection Tiles */}
        <div>
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
            {t.form.cropLabel}:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CROP_LIST.map((c) => {
              const isSelected = cropId === c.id;
              const displayName = getCropName(c, language);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => handleCropChange(c.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-farm-50 border-farm-600 ring-2 ring-farm-500 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-farm-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-3xl block mb-2">{c.icon}</span>
                  <p className="font-bold text-sm text-gray-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    ~{c.baseYieldPerAcreTonnes} {t.common.tonnes} / {t.form.acres}
                  </p>
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-farm-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Land Area Input */}
        <div className="pt-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
            {t.form.landAreaLabel} ({t.form.acres}):
          </label>
          <div className="flex items-center space-x-3 max-w-sm">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              value={landAreaAcres}
              onChange={(e) => handleLandAreaChange(parseFloat(e.target.value) || 1)}
              className="px-4 py-3 rounded-2xl border border-gray-300 text-lg font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-farm-500 w-32 text-center"
              required
            />
            <div className="flex space-x-1.5">
              {[1, 2, 5, 10].map((acres) => (
                <button
                  type="button"
                  key={acres}
                  onClick={() => handleLandAreaChange(acres)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    landAreaAcres === acres
                      ? 'bg-farm-600 text-white border-farm-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {acres} {t.form.acres}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WATER PARAMETERS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-farm-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t.form.step2Title}
            </h3>
            <p className="text-xs text-gray-500">
              {t.form.step2Desc}
            </p>
          </div>
        </div>

        {/* Visual Water Slider & Calculations */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-gray-700">
              {t.whatIf.waterSliderLabel}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-black font-serif text-sky-800">
                {waterAvailabilityPct}%
              </span>
              {waterDeficit > 0 ? (
                <span className="text-xs font-bold px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-full">
                  ⚠️ {t.form.waterDeficit}: {waterDeficit}%
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                  ✓ {t.common.sufficient}
                </span>
              )}
            </div>
          </div>

          <input
            type="range"
            min="20"
            max="120"
            step="5"
            value={waterAvailabilityPct}
            onChange={(e) => setWaterAvailabilityPct(Number(e.target.value))}
            className="w-full h-3.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
          />

          <div className="flex justify-between text-xs font-semibold text-gray-500">
            <span>{t.whatIf.drought}</span>
            <span>{t.whatIf.stress}</span>
            <span>{t.whatIf.normalReq}</span>
            <span>{t.whatIf.surplus}</span>
          </div>

          {/* Transparent Water Volumetric Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100">
              <span className="text-[11px] text-gray-500 font-medium block">
                {t.form.requiredWater}
              </span>
              <p className="text-lg font-black text-sky-900 font-serif mt-0.5">
                {(totalWaterRequired / 100000).toFixed(2)} {t.common.lakhLiters}
              </p>
              <p className="text-[10px] text-gray-400">
                {totalWaterRequired.toLocaleString('en-IN')} L ({landAreaAcres} {t.form.acres})
              </p>
            </div>

            <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100">
              <span className="text-[11px] text-gray-500 font-medium block">
                {t.form.availableWater}
              </span>
              <p className="text-lg font-black text-sky-900 font-serif mt-0.5">
                {(totalWaterAvailable / 100000).toFixed(2)} {t.common.lakhLiters}
              </p>
              <p className="text-[10px] text-gray-400">
                {totalWaterAvailable.toLocaleString('en-IN')} L {language === 'mr' ? 'उपलब्ध' : language === 'hi' ? 'उपलब्ध' : 'calculated'}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              waterDeficit > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <span className="text-[11px] text-gray-500 font-medium block">
                {t.form.waterDeficit}
              </span>
              <p className={`text-lg font-black font-serif mt-0.5 ${
                waterDeficit > 0 ? 'text-rose-900' : 'text-emerald-900'
              }`}>
                {waterDeficit}%
              </p>
              <p className="text-[10px] text-gray-500">
                {waterDeficit > 0 ? (language === 'mr' ? 'पिकावर पाण्याचा ताण संभवतो' : language === 'hi' ? 'फसल पर जल तनाव संभव' : 'Causes estimated moisture stress') : (language === 'mr' ? 'पाण्याची कोणतीही तूट नाही' : language === 'hi' ? 'पानी की कोई कमी नहीं' : 'Zero moisture deficit')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: PLANTING SCHEDULE & WEATHER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-farm-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t.form.step3Title}
            </h3>
            <p className="text-xs text-gray-500">
              {t.form.step3Desc}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Planting Date Picker */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              {t.form.plantingDateLabel}:
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-gray-300 text-sm font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-farm-500 w-full"
              required
            />

            <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-purple-900">
                  {t.form.recommendedWindow}:
                </span>
                <span className="font-extrabold text-purple-800 bg-purple-200/70 px-2 py-0.5 rounded-md">
                  {getPlantingWindowLabel(selectedCrop, language)}
                </span>
              </div>
              <p className={`text-xs font-semibold mt-1 flex items-start space-x-1.5 ${
                plantingEval.status === 'optimal' ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {plantingEval.status === 'optimal' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                )}
                <span>{plantingEval.message}</span>
              </p>
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="space-y-4">
            
            {/* Rainfall */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                {t.form.rainfallLabel}:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'normal', 'high'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRainfall(r)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      rainfall === r
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {getRainfallName(r, language)}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                {t.form.temperatureLabel}:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['low', 'normal', 'high', 'heatwave'] as const).map((tmp) => (
                  <button
                    type="button"
                    key={tmp}
                    onClick={() => setTemperature(tmp)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all truncate ${
                      temperature === tmp
                        ? tmp === 'heatwave'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {getTemperatureName(tmp, language)}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* SECTION 4: INPUT USAGE & PRODUCTION COSTS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-farm-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            4
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t.form.step4Title}
            </h3>
            <p className="text-xs text-gray-500">
              {t.form.step4Desc} ({landAreaAcres} {t.form.acres})
            </p>
          </div>
        </div>

        {/* Input Level Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              {t.form.fertilizerLabel}:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'normal', 'high'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setFertilizerLevel(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border capitalize transition-all ${
                    fertilizerLevel === lvl
                      ? 'bg-farm-600 text-white border-farm-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {getInputLevelName(lvl, language)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              {t.form.pesticideLabel}:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'normal', 'high'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setPesticideLevel(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border capitalize transition-all ${
                    pesticideLevel === lvl
                      ? 'bg-farm-600 text-white border-farm-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {getInputLevelName(lvl, language)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Itemized Cost Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1 truncate">
              {t.form.seedCost} (₹)
            </label>
            <input
              type="number"
              min="0"
              value={seedCost}
              onChange={(e) => setSeedCost(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1 truncate">
              {t.form.fertilizerCost} (₹)
            </label>
            <input
              type="number"
              min="0"
              value={fertilizerCost}
              onChange={(e) => setFertilizerCost(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1 truncate">
              {t.form.pesticideCost} (₹)
            </label>
            <input
              type="number"
              min="0"
              value={pesticideCost}
              onChange={(e) => setPesticideCost(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1 truncate">
              {t.form.irrigationCost} (₹)
            </label>
            <input
              type="number"
              min="0"
              value={irrigationCost}
              onChange={(e) => setIrrigationCost(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1 truncate">
              {t.form.labourCost} (₹)
            </label>
            <input
              type="number"
              min="0"
              value={labourCost}
              onChange={(e) => setLabourCost(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1 truncate">
              {t.form.otherCost} (₹)
            </label>
            <input
              type="number"
              min="0"
              value={otherCost}
              onChange={(e) => setOtherCost(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900"
            />
          </div>
        </div>

        {/* Cost Summary & Market Price Input */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-farm-50/70 p-4 rounded-2xl border border-farm-200">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">
              {t.form.totalCost}:
            </span>
            <span className="text-2xl font-black text-gray-900 font-serif">
              ₹{totalCost.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block truncate">
                {t.form.marketPriceLabel}:
              </label>
              <input
                type="number"
                min="100"
                value={marketPricePerTonne}
                onChange={(e) => setMarketPricePerTonne(Number(e.target.value) || 0)}
                className="px-3 py-1.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-900 w-44"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Submit Button */}
      <div className="flex items-center justify-end space-x-4 pt-2">
        <button
          type="button"
          onClick={() => setCurrentTab('results')}
          className="px-6 py-4 rounded-2xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-all text-sm"
        >
          {t.common.cancel}
        </button>

        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-farm-700 to-farm-600 hover:from-farm-800 hover:to-farm-700 text-white font-extrabold text-base rounded-2xl shadow-farmer-lg hover:shadow-xl active:scale-95 transition-all flex items-center space-x-2"
        >
          <span>{t.form.runSimulationBtn}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </form>
  );
};
