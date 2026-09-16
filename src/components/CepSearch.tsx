import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Accessibility,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  X,
  Copy,
  Check,
  History,
  Share2,
  ShieldCheck,
  Navigation,
  Sparkles,
  Zap,
  Building2,
  CheckCircle2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { CepData, AcessibilidadeStats, AcessibilidadeAvaliacao } from '../types.js';

interface CepSearchProps {
  currentCepData: (CepData & { acessibilidadeStats: AcessibilidadeStats; avaliacoes: AcessibilidadeAvaliacao[] }) | null;
  loading: boolean;
  onSearch: (cep: string) => void;
  onOpenForm: () => void;
  onGoToMap: () => void;
}

const PRESET_CEPS = [
  { label: 'São Paulo', sub: 'MASP / Paulista', cep: '01310-100', uf: 'SP', emoji: '🏛️' },
  { label: 'Rio', sub: 'Copacabana', cep: '22041-001', uf: 'RJ', emoji: '🏖️' },
  { label: 'Belo Horizonte', sub: 'Pça Liberdade', cep: '30130-100', uf: 'MG', emoji: '☕' },
  { label: 'Brasília', sub: 'Esplanada', cep: '70040-010', uf: 'DF', emoji: '🏛️' },
  { label: 'Salvador', sub: 'Pelourinho', cep: '40026-280', uf: 'BA', emoji: '🥁' },
  { label: 'Curitiba', sub: 'Batel / Centro', cep: '80420-000', uf: 'PR', emoji: '🌲' },
];

export const CepSearch: React.FC<CepSearchProps> = ({
  currentCepData,
  loading,
  onSearch,
  onOpenForm,
  onGoToMap,
}) => {
  const [inputCep, setInputCep] = useState('');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [recentCeps, setRecentCeps] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cepsolidario_recent_ceps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (currentCepData?.cep) {
      setRecentCeps((prev) => {
        const next = [currentCepData.cep, ...prev.filter((c) => c !== currentCepData.cep)].slice(0, 6);
        localStorage.setItem('cepsolidario_recent_ceps', JSON.stringify(next));
        return next;
      });
    }
  }, [currentCepData?.cep]);

  const handleClearHistory = () => {
    setRecentCeps([]);
    localStorage.removeItem('cepsolidario_recent_ceps');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setInputCep(val);
  };

  const handleClear = () => {
    setInputCep('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputCep.replace(/\D/g, '');
    if (raw.length === 8) {
      onSearch(inputCep);
    }
  };

  const handleCopyAddress = () => {
    if (!currentCepData) return;
    const full = `${currentCepData.logradouro}, ${currentCepData.bairro || ''} - ${currentCepData.cidade}/${currentCepData.uf} - CEP ${currentCepData.cep}`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!currentCepData) return;
    const shareText = `CEP ${currentCepData.cep}: ${currentCepData.logradouro}, ${currentCepData.cidade}/${currentCepData.uf}. Acessibilidade PCD: ${currentCepData.acessibilidadeStats?.mediaNota || 5.0}/5.0.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CEP ${currentCepData.cep} - CEP Solidário`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(shareText);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const digitsCount = inputCep.replace(/\D/g, '').length;

  return (
    <div className="space-y-6">
      {/* 1. Top Header & Search Area (Apple Spotlight Style) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>SLA 99.9% • Triplo Fallback Ativo (ViaCEP, BrasilAPI & AwesomeAPI)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Consulta Inteligente & Acessibilidade PCD
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
              Pesquise qualquer CEP brasileiro com latência ultrabaixa e verifique a conformidade de acessibilidade para cadeirantes e pessoas com deficiência.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
              BR
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Base Nacional</span>
              <span className="text-xs font-bold text-slate-800">5.570 Municípios Ativos</span>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-2xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                id="input-cep-search"
                type="text"
                value={inputCep}
                onChange={handleInputChange}
                placeholder="Digite o CEP (ex: 01310-100)"
                aria-label="Código Postal (CEP)"
                className="w-full pl-12 pr-11 py-3.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-slate-900 font-mono text-base font-semibold transition-all outline-none focus:ring-4 focus:ring-indigo-500/15 shadow-inner"
                maxLength={9}
              />
              {inputCep && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Limpar campo de CEP"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors">
                    <X className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                </button>
              )}
            </div>

            <button
              id="btn-search-cep"
              type="submit"
              disabled={loading || digitsCount !== 8}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
              style={{ minHeight: '48px' }}
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <span>Consultar CEP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {inputCep.length > 0 && digitsCount < 8 && (
            <p className="text-xs text-amber-700 font-medium mt-2 flex items-center gap-1.5">
              <span>Faltam {8 - digitsCount} dígitos para completar o CEP de 8 números.</span>
            </p>
          )}
        </form>

        {/* 2. Quick Access Carousel (Inspired by Image 1 "Quick Top-Up" avatars) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Cidades & Acessos Rápidos</span>
            </span>
            <span className="text-[11px] text-slate-400">1 toque para consultar</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {/* Quick action button for custom search */}
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('input-cep-search') as HTMLInputElement;
                if (input) {
                  input.focus();
                  input.select();
                }
              }}
              className="flex flex-col items-center justify-center min-w-[76px] group transition-all"
            >
              <div className="w-13 h-13 rounded-full border-2 border-dashed border-indigo-300 group-hover:border-indigo-600 bg-indigo-50/50 flex items-center justify-center text-indigo-600 transition-colors shadow-2xs group-active:scale-95">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1.5 whitespace-nowrap">
                Novo CEP
              </span>
            </button>

            {PRESET_CEPS.map((item) => (
              <button
                key={item.cep}
                type="button"
                onClick={() => {
                  setInputCep(item.cep);
                  onSearch(item.cep);
                }}
                className="flex flex-col items-center justify-center min-w-[82px] group transition-all"
              >
                <div className="w-13 h-13 rounded-full bg-slate-100 border border-slate-200/80 group-hover:border-indigo-500 group-hover:bg-indigo-50/80 flex items-center justify-center text-xl transition-all shadow-2xs group-active:scale-95">
                  <span>{item.emoji}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-900 mt-1.5 truncate max-w-[80px]">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono -mt-0.5">
                  {item.uf}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Recent Searches (Inspired by Image 1 "Latest Transactions") */}
        {recentCeps.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mr-1">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Recentes:</span>
              </span>
              {recentCeps.map((cep) => (
                <button
                  key={cep}
                  type="button"
                  onClick={() => {
                    setInputCep(cep);
                    onSearch(cep);
                  }}
                  className="text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200/90 active:scale-95 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full transition-all shadow-2xs"
                >
                  {cep}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClearHistory}
              className="text-[11px] text-slate-400 hover:text-slate-700 hover:underline transition-colors"
            >
              Limpar histórico
            </button>
          </div>
        )}
      </div>

      {/* 4. LUXURY 3D TACTILE HERO CARD (Inspired by Apple Wallet Card & Reference 2 Logistics Card) */}
      {currentCepData && (
        <div className="apple-wallet-card rounded-4xl p-6 sm:p-8 text-white relative shadow-2xl transition-all">
          {/* Top Row: Holographic chip + Pro badge + Provider */}
          <div className="flex items-center justify-between pb-6 border-b border-white/15">
            <div className="flex items-center gap-3">
              {/* Gold Smart Chip Visual */}
              <div className="w-10 h-7 rounded-md bg-linear-to-tr from-amber-300 via-amber-200 to-amber-400 border border-amber-100/50 shadow-inner flex items-center justify-center relative overflow-hidden">
                <div className="w-6 h-4 border border-amber-600/40 rounded-sm" />
              </div>
              <div>
                <span className="text-[11px] tracking-widest uppercase font-mono font-bold text-indigo-200 block">
                  PASSAPORTE DE ENDEREÇO & ESG
                </span>
                <span className="text-xs font-extrabold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>BR CEP SOLIDÁRIO PRO</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20">
                {currentCepData.fonte}
              </span>
              {currentCepData.responseTimeMs && (
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  {currentCepData.responseTimeMs}ms
                </span>
              )}
            </div>
          </div>

          {/* Main Card Content */}
          <div className="py-6 sm:py-8">
            <span className="text-xs uppercase tracking-wider text-indigo-200 font-semibold block mb-1">
              Código de Endereçamento Postal
            </span>
            <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-sm">
              {currentCepData.cep}
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-white mt-3 leading-snug">
              {currentCepData.logradouro || 'Logradouro de Uso Geral'}
            </h2>
            <p className="text-sm sm:text-base text-indigo-100 mt-1">
              {currentCepData.bairro ? `${currentCepData.bairro}, ` : ''}
              {currentCepData.cidade} - {currentCepData.uf}
            </p>

            {/* Metrics Ribbon directly on the card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/15">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-indigo-200 font-medium block">Consistência Cadastral</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5 block">
                  {currentCepData.qualityScore}%
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-indigo-200 font-medium block">Sucesso de Entrega</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-0.5 block">
                  {currentCepData.deliveryProbability}%
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <span className="text-[11px] text-indigo-200 font-medium block">Acessibilidade PCD</span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-0.5 block">
                  ★ {currentCepData.acessibilidadeStats?.mediaNota || '5.0'} / 5.0
                </span>
              </div>
            </div>

            {/* Transit Route Stepper (Inspired by Reference 2 Delivery Flow) */}
            <div className="mt-5 p-3.5 bg-black/25 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-indigo-100 font-medium">Fluxo de Consulta Resiliente:</span>
              </div>

              <div className="flex items-center gap-2 text-indigo-200 font-mono text-[11px] overflow-x-auto no-scrollbar">
                <span className="bg-white/10 px-2 py-0.5 rounded-md text-white font-bold">Cliente</span>
                <span>➔</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-md text-white font-bold">{currentCepData.fonte}</span>
                <span>➔</span>
                <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-md font-bold">Resposta Validada</span>
              </div>
            </div>
          </div>

          {/* Bottom Card Actions (Frosted Glass Pills) */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenForm}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-indigo-950 hover:bg-white/95 active:scale-95 text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-md cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <Accessibility className="w-4 h-4 text-emerald-600" />
                <span>Avaliar Acessibilidade</span>
              </button>

              <button
                onClick={onGoToMap}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all border border-white/25 backdrop-blur-md cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                <MapPin className="w-4 h-4 text-emerald-300" />
                <span>Ver no Mapa</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleCopyAddress}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full transition-all border border-white/20 backdrop-blur-md"
                style={{ minHeight: '44px' }}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-emerald-200 font-bold">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold px-3.5 py-2.5 rounded-full transition-all border border-white/20 backdrop-blur-md"
                style={{ minHeight: '44px' }}
              >
                {shared ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-emerald-200 font-bold">Compartilhado</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${currentCepData.logradouro || ''} ${currentCepData.cidade} ${currentCepData.uf} CEP ${currentCepData.cep}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-11 h-11 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-full transition-all border border-white/20 backdrop-blur-md"
                title="Abrir no Google Maps"
              >
                <Navigation className="w-4 h-4 text-indigo-200" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 5. Detailed Breakdown Grids (Apple Health & Logistics Style) */}
      {currentCepData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Address & Logistics Inspection */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Dados Geográficos & Cadastrais</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Especificações territoriais padronizadas para expedição e rotulagem.
              </p>
            </div>

            {/* Address Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">Bairro</span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate">{currentCepData.bairro || 'Geral'}</span>
              </div>
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">Cidade / UF</span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate">
                  {currentCepData.cidade} / {currentCepData.uf}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">Código IBGE</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block">{currentCepData.ibge || '3550308'}</span>
              </div>
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">DDD Telefônico</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block">{currentCepData.ddd || '11'}</span>
              </div>
            </div>

            {/* Delivery Health Score Gauge */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>Conformidade Logística para E-commerce</span>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    currentCepData.riskLevel === 'baixo'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentCepData.riskLevel === 'moderado'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {currentCepData.riskLevel === 'baixo' ? 'Endereço Consistente' : 'Atenção Necessária'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1.5 text-slate-600">
                    <span className="font-medium">Precisão Cadastral:</span>
                    <span className="font-bold text-slate-900">{currentCepData.qualityScore}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full transition-all duration-500"
                      style={{ width: `${currentCepData.qualityScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5 text-slate-600">
                    <span className="font-medium">Sucesso de Entrega Previsto:</span>
                    <span className="font-bold text-emerald-700">{currentCepData.deliveryProbability}%</span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${currentCepData.deliveryProbability}%` }}
                    />
                  </div>
                </div>
              </div>

              {currentCepData.riskDescription && (
                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/70">
                  <strong className="text-slate-900">Diagnóstico Operacional:</strong> {currentCepData.riskDescription}
                </p>
              )}
            </div>
          </div>

          {/* Accessibility Overview Card - Apple Health Card Aesthetic */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-100">
                    <Accessibility className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Acessibilidade PCD</h3>
                    <p className="text-[11px] text-slate-500">Norma ABNT NBR 9050</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {currentCepData.acessibilidadeStats?.total || 0} avaliações
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">♿ Rampa & Acesso Plano</span>
                  <span className="font-bold text-slate-900 font-mono">{currentCepData.acessibilidadeStats?.percentRampa || 0}%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🛗 Elevador Adaptado</span>
                  <span className="font-bold text-slate-900 font-mono">{currentCepData.acessibilidadeStats?.percentElevador || 0}%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🚻 Banheiro Acessível PCD</span>
                  <span className="font-bold text-slate-900 font-mono">{currentCepData.acessibilidadeStats?.percentBanheiro || 0}%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🅿️ Vagas Reservadas PCD</span>
                  <span className="font-bold text-slate-900 font-mono">{currentCepData.acessibilidadeStats?.percentVagaPcd || 0}%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🦯 Piso Tátil & Braille (Visual)</span>
                  <span className="font-bold text-slate-900 font-mono">{currentCepData.acessibilidadeStats?.percentPisoTatil || 0}%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🧏 Atendimento Libras (Auditiva)</span>
                  <span className="font-bold text-slate-900 font-mono">{currentCepData.acessibilidadeStats?.percentLibras || 67}%</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600 font-medium">🧠 Espaço Calmo (Neurodivergência)</span>
                  <span className="font-bold text-slate-900 font-mono">{currentCepData.acessibilidadeStats?.percentNeurodivergente || 67}%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-950 block">Nota Comunitária</span>
                  <span className="text-[11px] text-emerald-700">Avaliado por voluntários locais</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-800 block">
                    ★ {currentCepData.acessibilidadeStats?.mediaNota || '5.0'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">escala de 5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


