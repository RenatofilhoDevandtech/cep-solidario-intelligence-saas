import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  MapPin,
  Globe2,
  BarChart3,
  Layers,
  ShoppingBag,
  Code2,
  Download,
  Building2,
  LogOut,
  CreditCard,
  Lock,
  Eye,
  Type,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CompanyUser } from '../types.js';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface HeaderProps {
  activeTab: 'search' | 'map' | 'dashboard' | 'batch' | 'widget' | 'docs';
  setActiveTab: (tab: 'search' | 'map' | 'dashboard' | 'batch' | 'widget' | 'docs') => void;
  openPricing: () => void;
  loggedCompany: CompanyUser | null;
  onOpenAuth: () => void;
  onLogoutCompany: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openPricing,
  loggedCompany,
  onOpenAuth,
  onLogoutCompany,
}) => {
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const toggleHighContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const toggleLargeFont = () => {
    const next = !largeFont;
    setLargeFont(next);
    if (next) {
      document.body.classList.add('large-font');
    } else {
      document.body.classList.remove('large-font');
    }
  };

  const handleSpeakOverview = () => {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não possui suporte a síntese de voz.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const textToRead =
      'Plataforma CEP Solidário. Mapeamento nacional colaborativo de acessibilidade urbana e infraestrutura de endereços para pessoas com deficiência motora, visual, auditiva e neurodivergente.';
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <header className="sticky top-0 z-30 apple-liquid-glass border-b border-slate-200/70 transition-colors">
      {/* Top Capsule Status - Apple Style Subtle Indicator & Accessibility Quick Controls */}
      <div className="bg-slate-900/95 text-slate-200 text-[11px] py-1.5 px-3 sm:px-8 border-b border-slate-800/80">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="font-semibold text-slate-100 truncate hidden sm:inline">
              Plataforma Nacional de Endereçamento & Acessibilidade PCD
            </span>
            <span className="font-semibold text-slate-100 truncate sm:hidden">CEP Solidário</span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-slate-400 text-[11px] hidden md:inline truncate">
              Inclusão motora, visual, auditiva e neurodivergente
            </span>
          </div>

          {/* Quick Accessibility Toggles for Inclusion */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleHighContrast}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                highContrast ? 'bg-amber-400 text-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Alternar modo de alto contraste para baixa visão"
              aria-label="Alternar Alto Contraste"
            >
              <Eye className="w-3 h-3" />
              <span className="hidden sm:inline">Alto Contraste</span>
            </button>

            <button
              onClick={toggleLargeFont}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                largeFont ? 'bg-indigo-400 text-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Aumentar tamanho das letras para leitura confortável"
              aria-label="Aumentar Fonte"
            >
              <Type className="w-3 h-3" />
              <span className="hidden sm:inline">Texto A+</span>
            </button>

            <button
              onClick={handleSpeakOverview}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                speaking ? 'bg-emerald-400 text-black animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Ouvir descrição por áudio"
              aria-label="Ouvir Descrição em Áudio"
            >
              {speaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span className="hidden sm:inline">{speaking ? 'Parar Voz' : 'Leitor de Voz'}</span>
            </button>

            <a
              href="/api/export/csv"
              className="text-slate-300 hover:text-white flex items-center gap-1 font-medium text-[10px] pl-2 border-l border-slate-700"
              title="Download dos dados públicos em CSV"
            >
              <Download className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Apple-style Bar */}
      <div className="header-main max-w-screen-2xl mx-auto px-3 sm:px-8 flex min-w-0 items-center justify-between gap-3 sm:gap-8 lg:grid lg:grid-cols-[minmax(220px,1fr)_auto_minmax(220px,1fr)]">
        {/* Brand Identity */}
        <div
          onClick={() => setActiveTab('search')}
          className="header-brand min-w-0 flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <HeartHandshake className="w-5 h-5 text-emerald-400 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-[#102a43] truncate">
                CEP <span className="text-indigo-600 font-extrabold">Solidário</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Inteligência de CEP & Acessibilidade Urbana
            </p>
          </div>
        </div>

        {/* Apple Segmented Control Navigation (Visible on Large Tablet & Desktop) */}
        <nav
          className="hidden lg:flex items-center justify-center bg-slate-200/60 p-1 rounded-2xl backdrop-blur-md border border-slate-300/40 shadow-inner justify-self-center"
          aria-label="Segmented Navigation"
        >
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Consultar</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              activeTab === 'map'
                ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mapa Brasil PCD</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            {loggedCompany ? (
              <BarChart3 className="w-3.5 h-3.5 text-slate-800" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Empresa</span>
            {!loggedCompany && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-300/60 text-slate-700">
                B2B
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              activeTab === 'batch'
                ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            <span>Lote</span>
          </button>

          <button
            onClick={() => setActiveTab('widget')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              activeTab === 'widget'
                ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
            <span>Widget</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs transition-all duration-200 ${
              activeTab === 'docs'
                ? 'bg-white text-slate-900 shadow-sm font-bold scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-slate-700" />
            <span>API Docs</span>
          </button>
        </nav>

        {/* Actions & Account (Apple Pill Buttons) */}
        <div className="header-actions flex min-w-0 items-center justify-end gap-1.5 sm:gap-2.5 lg:justify-self-end">
          {loggedCompany ? (
            <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/80 rounded-full pl-2 sm:pl-3 pr-1.5 py-1 shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="hidden sm:block text-xs font-bold text-slate-900 truncate max-w-27.5 sm:max-w-35">
                {loggedCompany.name}
              </span>
              <span className="hidden md:inline text-[10px] text-indigo-800 font-bold bg-indigo-100/80 px-2 py-0.5 rounded-full">
                {loggedCompany.plan}
              </span>
              <button
                onClick={onLogoutCompany}
                aria-label="Sair da conta"
                title="Sair da conta"
                className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 text-slate-800 border border-slate-300/70 px-3.5 py-2 rounded-full text-xs font-semibold transition-all shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Portal B2B</span>
              <span className="sm:hidden">Entrar</span>
            </button>
          )}

          {installPrompt && (
            <button
              onClick={handleInstall}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-full text-xs font-bold transition-all"
              title="Instalar o CEP Solidário neste dispositivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </button>
          )}

          <button
            onClick={openPricing}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-2.5 sm:px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Planos</span>
          </button>
        </div>
      </div>
    </header>
  );
};

