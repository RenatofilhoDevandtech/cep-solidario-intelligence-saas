import React from 'react';
import {
  Search,
  MapPin,
  Globe2,
  Building2,
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { CompanyUser } from '../types.js';

interface MobileBottomNavProps {
  activeTab: 'search' | 'map' | 'dashboard' | 'batch' | 'widget' | 'docs';
  setActiveTab: (tab: 'search' | 'map' | 'dashboard' | 'batch' | 'widget' | 'docs') => void;
  loggedCompany: CompanyUser | null;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  loggedCompany,
}) => {
  return (
    <nav
      aria-label="Navegação móvel inferior estilo iOS"
      className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 apple-liquid-glass border-t border-slate-200/80 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] pb-safe"
    >
      <div className="w-full max-w-xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between relative">
        {/* Tab 1: Consulta */}
        <button
          onClick={() => {
            setActiveTab('search');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-95 ${
            activeTab === 'search'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <Search
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'search' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.75]'
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">Consulta</span>
        </button>

        {/* Tab 2: Mapa Brasil */}
        <button
          onClick={() => {
            setActiveTab('map');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-95 ${
            activeTab === 'map'
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <Globe2
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'map' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.75]'
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">Brasil</span>
        </button>

        {/* CENTER ELEVATED FLOATING ACTION BUTTON (Inspired by Reference 1 & 2) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-6">
          <button
            onClick={() => {
              setActiveTab('search');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const input = document.getElementById('input-cep-search') as HTMLInputElement;
                if (input) {
                  input.focus();
                  input.select();
                }
              }, 200);
            }}
            aria-label="Ação rápida: Consultar novo CEP"
            title="Consultar CEP"
            className="w-14 h-14 rounded-full bg-linear-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white flex items-center justify-center apple-fab-glow active:scale-90 transition-transform duration-200 shadow-xl cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </button>
          <span className="text-[9px] font-bold text-indigo-700 mt-1 uppercase tracking-wider">
            Consultar
          </span>
        </div>

        {/* Tab 4: Empresa B2B */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-95 relative ${
            activeTab === 'dashboard'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <div className="relative">
            {loggedCompany ? (
              <Building2
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'dashboard' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.75]'
                }`}
              />
            ) : (
              <Lock
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'dashboard' ? 'scale-110 stroke-[2.4]' : 'stroke-[1.75]'
                }`}
              />
            )}
            {!loggedCompany && (
              <span className="absolute -top-1 -right-2 text-[8px] font-black px-1 py-0.2 bg-slate-900 text-white rounded-full leading-tight">
                B2B
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Empresa</span>
        </button>

        {/* Tab 5: Lote & Ferramentas */}
        <button
          onClick={() => {
            setActiveTab(activeTab === 'batch' ? 'widget' : activeTab === 'widget' ? 'docs' : 'batch');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-95 ${
            activeTab === 'batch' || activeTab === 'widget' || activeTab === 'docs'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          style={{ minHeight: '48px', minWidth: '48px' }}
        >
          <Layers
            className={`w-5 h-5 transition-transform duration-200 ${
              activeTab === 'batch' || activeTab === 'widget' || activeTab === 'docs'
                ? 'scale-110 stroke-[2.4]'
                : 'stroke-[1.75]'
            }`}
          />
          <span className="text-[10px] mt-1 tracking-tight">
            {activeTab === 'batch' ? 'Lote' : activeTab === 'widget' ? 'Widget' : activeTab === 'docs' ? 'API' : 'Lote'}
          </span>
        </button>
      </div>
    </nav>
  );
};

