import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupportedLanguage } from '../types';
import { 
  Sprout, 
  Layers, 
  GitCompare, 
  Bot, 
  Sparkles, 
  Menu, 
  X, 
  PlusCircle, 
  Calculator, 
  History, 
  Sliders 
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    t, 
    currentTab, 
    setCurrentTab, 
    scenarios, 
    loadDemoScenarios,
    setIsCalculationModalOpen,
    setIsCropProfileOpen,
    setIsHistoryDrawerOpen
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages: { code: SupportedLanguage; label: string }[] = [
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'en', label: 'English' }
  ];

  const handleNav = (tab: any) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-farm-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Product Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none group"
            onClick={() => handleNav('simulator')}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-farm-700 to-farm-500 flex items-center justify-center text-white shadow-farmer group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-farm-950 font-serif">
                  {t.appName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-farm-100 text-farm-800 border border-farm-300 uppercase tracking-wide">
                  Decision Sim
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Core Simulator Button (Highlighted as primary) */}
            <button
              onClick={() => handleNav('simulator')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1.5 ${
                currentTab === 'simulator'
                  ? 'bg-farm-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-farm-50 hover:text-farm-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{language === 'mr' ? 'सिम्युलेटर (Before / After)' : language === 'hi' ? 'सिम्युलेटर (Before / After)' : 'Simulator (Before / After)'}</span>
            </button>

            <button
              onClick={() => handleNav('compare')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'compare'
                  ? 'bg-farm-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-farm-50 hover:text-farm-900'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>{t.nav.compare}</span>
            </button>

            <button
              onClick={() => handleNav('scenarios')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 relative ${
                currentTab === 'scenarios'
                  ? 'bg-farm-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-farm-50 hover:text-farm-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.nav.myScenarios}</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-farm-100 text-farm-800 border border-farm-200">
                {scenarios.length}
              </span>
            </button>

            <button
              onClick={() => handleNav('ask')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'ask'
                  ? 'bg-farm-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-farm-50 hover:text-farm-900'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>{t.nav.askAi}</span>
            </button>

            <button
              onClick={() => handleNav('builder')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'builder'
                  ? 'bg-farm-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-farm-50 hover:text-farm-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.nav.createScenario}</span>
            </button>
          </nav>

          {/* Right Action Bar: Quick Modals, Demo Button, Language Switcher */}
          <div className="hidden sm:flex items-center space-x-2">
            
            {/* Crop Profile Modal trigger */}
            <button
              onClick={() => setIsCropProfileOpen(true)}
              className="p-2 text-farm-800 hover:bg-farm-50 rounded-xl transition-colors border border-transparent hover:border-farm-200"
              title="View ICAR benchmark & MSP standards"
            >
              <Sprout className="w-5 h-5 text-farm-600" />
            </button>

            {/* Arithmetic Ledger trigger */}
            <button
              onClick={() => setIsCalculationModalOpen(true)}
              className="p-2 text-farm-800 hover:bg-farm-50 rounded-xl transition-colors border border-transparent hover:border-farm-200"
              title="How is this calculated?"
            >
              <Calculator className="w-5 h-5 text-farm-600" />
            </button>

            {/* History Drawer trigger */}
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="p-2 text-farm-800 hover:bg-farm-50 rounded-xl transition-colors border border-transparent hover:border-farm-200"
              title="Decision history"
            >
              <History className="w-5 h-5 text-farm-600" />
            </button>

            {/* Quick Demo Button */}
            <button
              onClick={loadDemoScenarios}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow hover:brightness-105 active:scale-95 transition-all flex items-center space-x-1.5"
              title="Loads ready-to-evaluate scenarios for Sugarcane"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.nav.demo}</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200 text-xs font-semibold">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    language === l.code
                      ? 'bg-white text-farm-900 shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={loadDemoScenarios}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs"
            >
              ⚡ Demo
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-farm-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {/* Mobile Language Selector */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500">Language / भाषा:</span>
            <div className="flex space-x-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    language === l.code ? 'bg-farm-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleNav('simulator')}
              className={`p-3 rounded-xl text-left font-semibold text-sm flex items-center space-x-2 ${
                currentTab === 'simulator' ? 'bg-farm-700 text-white' : 'bg-farm-50 text-farm-900'
              }`}
            >
              <Sliders className="w-5 h-5" />
              <span>{language === 'mr' ? 'सिम्युलेटर' : language === 'hi' ? 'सिम्युलेटर' : 'Simulator'}</span>
            </button>

            <button
              onClick={() => handleNav('compare')}
              className={`p-3 rounded-xl text-left font-semibold text-sm flex items-center space-x-2 ${
                currentTab === 'compare' ? 'bg-farm-700 text-white' : 'bg-farm-50 text-farm-900'
              }`}
            >
              <GitCompare className="w-5 h-5" />
              <span>{t.nav.compare}</span>
            </button>

            <button
              onClick={() => handleNav('ask')}
              className={`p-3 rounded-xl text-left font-semibold text-sm flex items-center space-x-2 ${
                currentTab === 'ask' ? 'bg-farm-700 text-white' : 'bg-farm-50 text-farm-900'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>{t.nav.askAi}</span>
            </button>

            <button
              onClick={() => handleNav('builder')}
              className={`p-3 rounded-xl text-left font-semibold text-sm flex items-center space-x-2 ${
                currentTab === 'builder' ? 'bg-farm-700 text-white' : 'bg-farm-50 text-farm-900'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t.nav.createScenario}</span>
            </button>
          </div>

          {/* Quick Tools on Mobile */}
          <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
            <button
              onClick={() => { setIsCropProfileOpen(true); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold"
            >
              📋 {language === 'mr' ? 'पीक माहिती' : 'Crop Profile'}
            </button>
            <button
              onClick={() => { setIsCalculationModalOpen(true); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold"
            >
              📐 {language === 'mr' ? 'कसे मोजले?' : 'Formula'}
            </button>
            <button
              onClick={() => { setIsHistoryDrawerOpen(true); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold"
            >
              ⏱️ {language === 'mr' ? 'इतिहास' : 'History'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
