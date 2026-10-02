import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { answerFarmerQuestion, AnswerResponse } from '../services/explanationService';
import { getCropName } from '../utils/localization';
import { SupportedLanguage } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Database
} from 'lucide-react';

const sampleQuestionsByLang: Record<SupportedLanguage, string[]> = {
  mr: [
    'माझे उत्पादन का कमी झाले?',
    'पाणी २०% कमी केल्यास काय परिणाम होईल?',
    'या नियोजनाला असा जोखीम गुण का मिळाला?',
    'दुसऱ्या नियोजनात आणि यात काय फरक आहे?',
    'मी माझा नफा कसा वाढवू शकेन?'
  ],
  hi: [
    'मेरी उपज क्यों कम हुई?',
    'अगर पानी २०% कम हो जाए तो क्या होगा?',
    'इस योजना में इतना जोखिम क्यों है?',
    'दूसरी योजना और इसमें क्या अंतर है?',
    'मैं अपना मुनाफा कैसे बढ़ा सकता हूं?'
  ],
  en: [
    'Why did my yield decrease?',
    'What happens if water decreases by 20%?',
    'Why is this scenario marked as this risk level?',
    'How does Scenario B differ from Scenario A?',
    'How can I improve my profit margin?'
  ]
};

export const AskKrushiSimPanel: React.FC = () => {
  const { activeResult, baselineResult, scenarios, allResults, language, t } = useApp();

  const [inputQuestion, setInputQuestion] = useState('');
  const initialQ = sampleQuestionsByLang[language][0];
  const [history, setHistory] = useState<{
    question: string;
    response: AnswerResponse;
  }[]>(() => [
    {
      question: initialQ,
      response: answerFarmerQuestion(initialQ, activeResult, baselineResult, language)
    }
  ]);

  const sampleQuestions = sampleQuestionsByLang[language] || sampleQuestionsByLang.en;

  const handleAsk = (qText: string) => {
    if (!qText.trim()) return;
    // Check if comparison scenario is available
    const otherScenario = scenarios.find((s) => s.id !== activeResult.scenarioId);
    const comparisonResult = otherScenario ? allResults[otherScenario.id] : baselineResult;

    const resp = answerFarmerQuestion(qText, activeResult, comparisonResult, language);
    setHistory((prev) => [...prev, { question: qText, response: resp }]);
    setInputQuestion('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(inputQuestion);
  };

  return (
    <div className="bg-white rounded-3xl border border-farm-200 shadow-farmer max-w-4xl mx-auto overflow-hidden">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-farm-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif flex items-center space-x-2">
              <span>{t.askAi.title}</span>
              <span className="text-[10px] bg-emerald-500 text-emerald-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {t.askAi.groundedBadge}
              </span>
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              {t.askAi.subtitle}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.askAi.analyzing} {getCropName(activeResult.crop, language)}</span>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-4 sm:p-6 bg-farm-50/50 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          {t.askAi.quickQuestionsTitle}
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="px-3 py-1.5 bg-white hover:bg-farm-100 hover:text-farm-900 text-gray-700 text-xs font-semibold rounded-xl border border-farm-200 shadow-2xs transition-all flex items-center space-x-1 active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-farm-600" />
              <span>{q}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="p-6 space-y-6 max-h-[480px] overflow-y-auto">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-3">
            {/* User Question */}
            <div className="flex justify-end">
              <div className="bg-farm-700 text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm font-semibold max-w-lg shadow-xs">
                {item.question}
              </div>
            </div>

            {/* AI Grounded Answer */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-farm-100 text-farm-800 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-5 h-5 text-farm-700" />
              </div>
              <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 border border-gray-200 text-sm text-gray-800 leading-relaxed max-w-2xl space-y-3 shadow-2xs">
                <p>{item.response.answer}</p>

                {/* Grounded Source Metrics Citation */}
                {item.response.sourceMetrics.length > 0 && (
                  <div className="pt-2 border-t border-gray-200/80 text-xs text-gray-600">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-gray-500 block mb-1">
                      {t.askAi.verificationBasis}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.response.sourceMetrics.map((metric, mIdx) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 bg-white rounded-md border border-gray-200 font-mono text-[11px] text-gray-700 flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{metric}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={t.askAi.placeholder}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-farm-500 text-gray-900"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim()}
            className="px-5 py-3 bg-farm-700 hover:bg-farm-800 disabled:opacity-50 text-white rounded-2xl font-bold text-sm transition-all flex items-center space-x-1 shadow-sm active:scale-95"
          >
            <span>{t.askAi.askBtn}</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-2 text-center">
          {t.askAi.guaranteeNote}
        </p>
      </form>

    </div>
  );
};
