import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { CepSearch } from './components/CepSearch.js';
import { AvaliacoesLista } from './components/AvaliacoesLista.js';
import { AcessibilidadeForm } from './components/AcessibilidadeForm.js';
import { MapaAcessivel } from './components/MapaAcessivel.js';
import { B2bDashboard } from './components/B2bDashboard.js';
import { BatchValidator } from './components/BatchValidator.js';
import { CheckoutWidgetDemo } from './components/CheckoutWidgetDemo.js';
import { ApiDocs } from './components/ApiDocs.js';
import { PricingModal } from './components/PricingModal.js';
import { CompanyAuthModal } from './components/CompanyAuthModal.js';
import { Toast } from './components/Toast.js';
import { NotFound } from './components/NotFound.js';
import { CepData, AcessibilidadeStats, AcessibilidadeAvaliacao, CompanyUser } from './types.js';
import {
  consultarCep,
  cadastrarAcessibilidade,
  upvoteAvaliacaoApi,
  atualizarPlanoEmpresa,
  logoutEmpresa,
} from './services/api.js';
import { HeartHandshake, Shield, Download } from 'lucide-react';

const STORAGE_KEY = 'cepsolidario_company';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'map' | 'dashboard' | 'batch' | 'widget' | 'docs'>('search');
  const [currentCepData, setCurrentCepData] = useState<
    (CepData & { acessibilidadeStats: AcessibilidadeStats; avaliacoes: AcessibilidadeAvaliacao[] }) | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loggedCompany, setLoggedCompany] = useState<CompanyUser | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const isNotFoundPath = !['/', '/index.html'].includes(window.location.pathname);

  // Restore corporate session from localStorage on mount (Nielsen #7 & #6)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLoggedCompany(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handleSearchCep = async (cep: string) => {
    try {
      setLoading(true);
      setSearchError(null);
      const data = await consultarCep(cep);
      setCurrentCepData(data);
    } catch (err: any) {
      setCurrentCepData(null);
      setSearchError(err.message || `Não foi possível localizar o CEP ${cep}.`);
      setToast({
        message: err.message || `CEP ${cep} não localizado na base de dados.`,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAvaliacao = async (formData: any) => {
    const nova = await cadastrarAcessibilidade(formData);
    setToast({
      message: `Local "${nova.local_nome}" cadastrado com sucesso! A comunidade agradece sua contribuição.`,
      type: 'success',
    });
    // Refresh current CEP data if matching
    if (currentCepData && currentCepData.cep.replace(/\D/g, '') === formData.cep.replace(/\D/g, '')) {
      handleSearchCep(currentCepData.cep);
    }
  };

  const handleUpvote = async (id: string) => {
    try {
      const upvotes = await upvoteAvaliacaoApi(id);
      setToast({
        message: `Acessibilidade confirmada! Total de ${upvotes} confirmações comunitárias.`,
        type: 'success',
      });
      // Update in local state
      if (currentCepData) {
        const updatedAvaliacoes = currentCepData.avaliacoes.map((item) =>
          item.id === id ? { ...item, upvotes } : item
        );
        setCurrentCepData({ ...currentCepData, avaliacoes: updatedAvaliacoes });
      }
    } catch (err: any) {
      setToast({
        message: err.message || 'Erro ao confirmar acessibilidade.',
        type: 'error',
      });
    }
  };

  const handleCompanyAuthSuccess = (company: CompanyUser) => {
    setLoggedCompany(company);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
    setIsAuthOpen(false);
    setToast({
      message: `Sessão iniciada com sucesso. Bem-vindo(a), ${company.name}!`,
      type: 'success',
    });
  };

  const handleLogoutCompany = async () => {
    try {
      await logoutEmpresa();
    } catch (err) {
      console.error('Erro ao encerrar sessão no backend:', err);
    }
    setLoggedCompany(null);
    localStorage.removeItem(STORAGE_KEY);
    setToast({
      message: 'Você saiu da conta corporativa.',
      type: 'success',
    });
  };

  const handlePlanSubscribed = async (planId: string) => {
    if (!loggedCompany) {
      setToast({ message: 'Entre na conta corporativa antes de escolher um plano.', type: 'error' });
      return;
    }

    try {
      const updated = await atualizarPlanoEmpresa(planId);
      setLoggedCompany(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setToast({
        message: `Plano ${planId} ativado com sucesso! Novos limites liberados para a API.`,
        type: 'success',
      });
    } catch (err: any) {
      setToast({ message: err.message || 'Não foi possível atualizar o plano.', type: 'error' });
    }
  };

  const handleSelectCepFromMap = (cep: string) => {
    setActiveTab('search');
    handleSearchCep(cep);
  };

  if (isNotFoundPath) {
    return <NotFound onBackToSearch={() => window.location.assign('/')} />;
  }

  return (
    <div className="app-shell min-h-screen bg-[#f5f5f7] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',-apple-system,BlinkMacSystemFont,sans-serif] selection:bg-indigo-500/20">
      {/* Global Header & Nav */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openPricing={() => setIsPricingOpen(true)}
        loggedCompany={loggedCompany}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogoutCompany={handleLogoutCompany}
      />

      {/* Main Container - Optimized for Mobile, iPad/Tablet and Desktop */}
      <main className="app-main flex-1 mx-auto px-0 py-4 sm:py-7 pb-28 lg:pb-12">
        {activeTab === 'search' && (
          <div className="space-y-6">
            <CepSearch
              currentCepData={currentCepData}
              loading={loading}
              errorMessage={searchError}
              onSearch={handleSearchCep}
              onClearResults={() => {
                setCurrentCepData(null);
                setSearchError(null);
              }}
              onOpenForm={() => setIsFormOpen(true)}
              onGoToMap={() => setActiveTab('map')}
            />

            {currentCepData && (
              <AvaliacoesLista
                avaliacoes={currentCepData.avaliacoes || []}
                onUpvote={handleUpvote}
                onOpenForm={() => setIsFormOpen(true)}
                cep={currentCepData.cep}
              />
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <MapaAcessivel
            initialLat={currentCepData?.lat || -23.561492}
            initialLon={currentCepData?.lon || -46.655881}
            onSelectCep={handleSelectCepFromMap}
            onUpvote={handleUpvote}
          />
        )}

        {activeTab === 'dashboard' && (
          <B2bDashboard
            openPricing={() => setIsPricingOpen(true)}
            loggedCompany={loggedCompany}
            onOpenAuth={() => setIsAuthOpen(true)}
            onDemoLogin={handleCompanyAuthSuccess}
          />
        )}

        {activeTab === 'batch' && <BatchValidator />}

        {activeTab === 'widget' && <CheckoutWidgetDemo />}

        {activeTab === 'docs' && <ApiDocs />}
      </main>

      {/* Native iOS/iPadOS Style Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loggedCompany={loggedCompany}
      />

      {/* Modals & Toasts */}
      <AcessibilidadeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        defaultCep={currentCepData?.cep || '01310-100'}
        defaultCity={currentCepData?.cidade}
        defaultUf={currentCepData?.uf}
        onSubmit={handleCreateAvaliacao}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSelectPlan={handlePlanSubscribed}
      />

      <CompanyAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleCompanyAuthSuccess}
        onAuthSuccess={handleCompanyAuthSuccess}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Platform Footer - Refined Apple Style */}
      <footer className="bg-white/80 border-t border-slate-200/80 mt-auto py-6 pb-24 lg:pb-6 text-xs text-slate-500 apple-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-2xs shrink-0">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-800">CEP Solidário</div>
              <div className="text-[11px] leading-relaxed text-slate-500 wrap-break-word">
                Mapeamento colaborativo de acessibilidade e infraestrutura de endereços
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-600">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Conformidade LGPD
            </span>
            <span>•</span>
            <button onClick={() => setActiveTab('docs')} className="hover:text-slate-900 transition-colors">
              API Pública
            </button>
            <span>•</span>
            <a href="/api/export/csv" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              <Download className="w-3 h-3 text-slate-500" />
              <span>Dados Abertos (CSV)</span>
            </a>
            <span>•</span>
            <button onClick={() => setIsPricingOpen(true)} className="hover:text-slate-900 font-semibold transition-colors">
              Planos B2B
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
