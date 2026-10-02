import React from "react";
import { useApp } from "../context/AppContext";
import { ScenarioHistoryItem } from "../types";
import { getCropName } from "../utils/localization";
import { X, History, RotateCcw, Trash2, Clock } from "lucide-react";

interface ScenarioHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScenarioHistoryDrawer: React.FC<ScenarioHistoryDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    scenarioHistory,
    restoreScenario,
    clearHistory,
    language,
    activeScenarioId,
  } = useApp();

  if (!isOpen) return null;

  const handleRestore = (item: ScenarioHistoryItem) => {
    restoreScenario(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 bg-gradient-to-r from-farm-800 to-farm-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <History className="w-5 h-5 text-farm-200" />
              </div>
              <div>
                <h3 className="font-black text-lg font-serif">
                  {language === "mr"
                    ? "निर्णय इतिहास (History)"
                    : language === "hi"
                      ? "निर्णय इतिहास"
                      : "Scenario Decision History"}
                </h3>
                <p className="text-xs text-farm-200">
                  {scenarioHistory.length}{" "}
                  {language === "mr"
                    ? "नोंदवलेले बदल"
                    : language === "hi"
                      ? "दर्ज किए गए बदलाव"
                      : "recorded decisions"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-farm-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body: Timeline */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {scenarioHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Clock className="w-10 h-10 mx-auto text-gray-300" />
                <p className="text-sm font-semibold text-gray-500">
                  {language === "mr"
                    ? "अद्याप कोणताही इतिहास नाही"
                    : language === "hi"
                      ? "अभी कोई इतिहास नहीं है"
                      : "No decisions recorded yet"}
                </p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  {language === "mr"
                    ? "सिम्युलेटरमधील पॅरामीटर्स बदलल्यावर येथे इतिहास आपोआप नोंदवला जाईल."
                    : language === "hi"
                      ? "सिम्युलेटर में बदलाव करने पर इतिहास यहां दर्ज होता जाएगा।"
                      : "Adjust water, date, or weather in simulator to see past states here."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {scenarioHistory.map((item) => {
                  const isActive = item.scenario.id === activeScenarioId;
                  const cropName = getCropName(item.result.crop, language);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive
                          ? "border-farm-500 bg-farm-50/50 shadow-sm ring-1 ring-farm-400"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {item.result.crop.icon}
                          </span>
                          <div>
                            <span className="font-bold text-gray-900 text-xs block">
                              {cropName} ({item.scenario.landAreaAcres} एकर)
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3 inline" />
                              <span>{item.timestamp}</span>
                            </span>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="text-[10px] font-bold bg-farm-600 text-white px-2 py-0.5 rounded-full">
                            {language === "mr"
                              ? "सध्या सक्रिय"
                              : language === "hi"
                                ? "सक्रिय"
                                : "Active"}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRestore(item)}
                            className="px-2.5 py-1 bg-farm-100 hover:bg-farm-200 text-farm-900 text-xs font-bold rounded-lg flex items-center space-x-1 transition-all"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>
                              {language === "mr"
                                ? "पुन्हा निवडा"
                                : language === "hi"
                                  ? "चुनें"
                                  : "Restore"}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Diff summary */}
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100 mb-2.5">
                        {item.changeSummary}
                      </p>

                      {/* Snapshot Metrics */}
                      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                        <div className="p-1.5 rounded-lg bg-gray-100/70">
                          <span className="text-[10px] text-gray-500 block">
                            {language === "mr"
                              ? "उत्पादन"
                              : language === "hi"
                                ? "पैदावार"
                                : "Yield"}
                          </span>
                          <span className="font-bold text-gray-900">
                            {item.result.expectedYieldTonnes} T
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-900">
                          <span className="text-[10px] text-emerald-700 block">
                            {language === "mr"
                              ? "नफा"
                              : language === "hi"
                                ? "मुनाफा"
                                : "Profit"}
                          </span>
                          <span className="font-bold">
                            ₹{(item.result.estimatedProfit / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div
                          className={`p-1.5 rounded-lg ${
                            item.result.risk.totalRiskScore > 50
                              ? "bg-rose-50 text-rose-900"
                              : "bg-gray-100/70 text-gray-800"
                          }`}
                        >
                          <span className="text-[10px] text-gray-500 block">
                            {language === "mr"
                              ? "जोखीम"
                              : language === "hi"
                                ? "जोखिम"
                                : "Risk"}
                          </span>
                          <span className="font-bold">
                            {item.result.risk.totalRiskScore}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {scenarioHistory.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <button
                onClick={clearHistory}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center space-x-1 p-2 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {language === "mr"
                    ? "इतिहास साफ करा"
                    : language === "hi"
                      ? "इतिहास साफ करें"
                      : "Clear History"}
                </span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold transition-all"
              >
                {language === "mr"
                  ? "बंद करा"
                  : language === "hi"
                    ? "बंद करें"
                    : "Close"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
