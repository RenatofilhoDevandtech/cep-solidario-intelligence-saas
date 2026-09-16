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
  Share2,
  ShieldCheck,
  Navigation,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertTriangle,
  CircleHelp,
  ChevronRight,
} from 'lucide-react';
import { CepData, AcessibilidadeStats, AcessibilidadeAvaliacao } from '../types.js';
import { CepQuickAccess, QuickCep } from './cep/CepQuickAccess.js';
import { ErrorState } from './feedback/ErrorState.js';

interface CepSearchProps {
  currentCepData: (CepData & { acessibilidadeStats: AcessibilidadeStats; avaliacoes: AcessibilidadeAvaliacao[] }) | null;
  loading: boolean;
  errorMessage: string | null;
  onSearch: (cep: string) => void;
  onClearResults: () => void;
  onOpenForm: () => void;
  onGoToMap: () => void;
}

const PRESET_CEPS: QuickCep[] = [
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
  errorMessage,
  onSearch,
  onClearResults,
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
    onClearResults();
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
    const accessibilitySummary = currentCepData.acessibilidadeStats?.total
      ? `Acessibilidade PCD: ${currentCepData.acessibilidadeStats.mediaNota}/5.0, com ${currentCepData.acessibilidadeStats.total} avaliação(ões) comunitária(s).`
      : 'Ainda não há avaliações comunitárias de acessibilidade para este endereço.';
    const shareText = `CEP ${currentCepData.cep}: ${currentCepData.logradouro}, ${currentCepData.cidade}/${currentCepData.uf}. ${accessibilitySummary}`;
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
  const accessibilityStats = currentCepData?.acessibilidadeStats;
  const hasAccessibilityData = Boolean(accessibilityStats?.total);
  const formatAccessibilityPercentage = (value?: number) =>
    hasAccessibilityData ? `${value || 0}%` : 'Sem dados';

  return (
    <div className="space-y-6">
      {/* 1. Top Header & Search Area (Apple Spotlight Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-5 sm:p-8 text-slate-900 border border-slate-200/80 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.25)] transition-all">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 via-emerald-400 to-indigo-500" />
        <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Consulta de endereço com dados transparentes</span>
            </div>
            <h1 className="max-w-2xl text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Encontre um endereço. Planeje melhor o caminho.
            </h1>
            <p className="max-w-xl text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
              Consulte o CEP, confira os dados do endereço e veja o que a comunidade já confirmou sobre acessibilidade.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
              BR
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Em todo o Brasil</span>
              <span className="text-xs font-bold text-slate-800">Endereços e acessibilidade</span>
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="mt-7">
          <label htmlFor="input-cep-search" className="mb-2 block text-xs font-bold uppercase tracking-wider text-indigo-700">
            Consulte um CEP
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-3xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#627d98]">
                <Search className="w-5 h-5 text-[#627d98]" />
              </div>
              <input
                id="input-cep-search"
                type="text"
                value={inputCep}
                onChange={handleInputChange}
                placeholder="Digite o CEP (ex: 01310-100)"
                aria-label="Código Postal (CEP)"
                className="w-full pl-12 pr-11 py-3.5 bg-white hover:bg-slate-50 focus:bg-white border border-white/60 focus:border-emerald-400 rounded-xl text-slate-900 font-mono text-base font-semibold transition-all outline-none focus:ring-4 focus:ring-emerald-300/25 shadow-lg"
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
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
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

        {errorMessage && (
          <ErrorState
            title="Não encontramos esse CEP"
            message={errorMessage}
            actionLabel="Tentar outro CEP"
            onAction={handleClear}
          />
        )}

        <CepQuickAccess
          presets={PRESET_CEPS}
          recentCeps={recentCeps}
          onSearch={(cep) => {
            setInputCep(cep);
            onSearch(cep);
          }}
          onFocusSearch={() => {
            const input = document.getElementById('input-cep-search') as HTMLInputElement | null;
            input?.focus();
            input?.select();
          }}
          onClearHistory={handleClearHistory}
        />
        </div>
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
                  RESUMO DE ENDEREÇO & ACESSIBILIDADE
                </span>
                <span className="text-xs font-extrabold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>CEP SOLIDÁRIO</span>
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
                  {hasAccessibilityData ? `★ ${accessibilityStats?.mediaNota} / 5.0` : 'Sem avaliações'}
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
                <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Dados encontrados
                </span>
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
                <span className="font-bold text-slate-900 mt-0.5 block truncate">{currentCepData.bairro || 'Não informado'}</span>
              </div>
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">Cidade / UF</span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate">
                  {currentCepData.cidade} / {currentCepData.uf}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">Código IBGE</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block">{currentCepData.ibge || 'Não informado'}</span>
              </div>
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">DDD Telefônico</span>
                <span className="font-bold text-slate-900 font-mono mt-0.5 block">{currentCepData.ddd || 'Não informado'}</span>
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
                  {currentCepData.riskLevel === 'baixo' ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Endereço consistente
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Atenção necessária
                    </span>
                  )}
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
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      Acessibilidade PCD
                      {hasAccessibilityData ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-label="Com avaliações comunitárias" />
                      ) : (
                        <CircleHelp className="w-3.5 h-3.5 text-slate-400" aria-label="Sem avaliações comunitárias" />
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500">Confirmações da comunidade</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {currentCepData.acessibilidadeStats?.total || 0} avaliações
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">♿ Rampa & Acesso Plano</span>
                  <span className="font-bold text-slate-900 font-mono">{formatAccessibilityPercentage(currentCepData.acessibilidadeStats?.percentRampa)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🛗 Elevador Adaptado</span>
                  <span className="font-bold text-slate-900 font-mono">{formatAccessibilityPercentage(currentCepData.acessibilidadeStats?.percentElevador)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🚻 Banheiro Acessível PCD</span>
                  <span className="font-bold text-slate-900 font-mono">{formatAccessibilityPercentage(currentCepData.acessibilidadeStats?.percentBanheiro)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🅿️ Vagas Reservadas PCD</span>
                  <span className="font-bold text-slate-900 font-mono">{formatAccessibilityPercentage(currentCepData.acessibilidadeStats?.percentVagaPcd)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🦯 Piso Tátil & Braille (Visual)</span>
                  <span className="font-bold text-slate-900 font-mono">{formatAccessibilityPercentage(currentCepData.acessibilidadeStats?.percentPisoTatil)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80">
                  <span className="text-slate-600 font-medium">🧏 Atendimento Libras (Auditiva)</span>
                  <span className="font-bold text-slate-900 font-mono">{formatAccessibilityPercentage(accessibilityStats?.percentLibras)}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600 font-medium">🧠 Espaço Calmo (Neurodivergência)</span>
                  <span className="font-bold text-slate-900 font-mono">{formatAccessibilityPercentage(accessibilityStats?.percentNeurodivergente)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className={`${hasAccessibilityData ? 'bg-emerald-50/80 border-emerald-200/80' : 'bg-slate-50 border-slate-200'} p-4 rounded-2xl border flex items-center justify-between`}>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Nota Comunitária</span>
                  <span className="text-[11px] text-slate-600">
                    {hasAccessibilityData ? 'Avaliado por voluntários locais' : 'Ainda não há avaliações neste endereço'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-800 block">
                    {hasAccessibilityData ? `★ ${accessibilityStats?.mediaNota}` : 'Sem nota'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">escala de 5.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


