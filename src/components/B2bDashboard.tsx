import React, { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  RefreshCw,
  Sparkles,
  Building2,
  Lock,
  ArrowRight,
  AlertTriangle,
  X,
  Play,
  Download,
  Filter,
  CheckCircle2,
  Search,
  Terminal,
} from 'lucide-react';
import { ApiKeyItem, ApiRequestLog, CompanyUser } from '../types.js';
import {
  buscarEstatisticasUso,
  listarChavesApi,
  criarChaveApi,
  revogarChaveApi,
  loginEmpresa,
} from '../services/api.js';

interface B2bDashboardProps {
  openPricing: () => void;
  loggedCompany: CompanyUser | null;
  onOpenAuth: () => void;
  onDemoLogin?: (company: CompanyUser) => void;
}

export const B2bDashboard: React.FC<B2bDashboardProps> = ({
  openPricing,
  loggedCompany,
  onOpenAuth,
  onDemoLogin,
}) => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [stats, setStats] = useState<{
    totalRequestsToday: number;
    avgResponseTime: number;
    successRate: number;
    activeKeys: number;
    dailyUsage: { day: string; requests: number; validRate: number }[];
    recentLogs: ApiRequestLog[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Key creation form
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPlan, setNewKeyPlan] = useState<'FREE' | 'STARTUP' | 'BUSINESS' | 'ENTERPRISE'>('BUSINESS');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Key to revoke confirmation modal (Nielsen #5 Error prevention & #3 User freedom)
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyItem | null>(null);

  // Feature: Live API Interactive Tester
  const [testCep, setTestCep] = useState('01310-100');
  const [selectedKeyForTest, setSelectedKeyForTest] = useState<string>('');
  const [testingApi, setTestingApi] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Feature: Logs Filter and Export
  const [logSearchFilter, setLogSearchFilter] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<'all' | '200' | 'error'>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [keysData, statsData] = await Promise.all([
        listarChavesApi(),
        buscarEstatisticasUso(),
      ]);
      setKeys(keysData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedCompany) {
      loadData();
    } else {
      setLoading(false);
      setKeys([]);
      setStats(null);
    }
  }, [loggedCompany]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await criarChaveApi(newKeyName || 'Chave de Produção', newKeyPlan);
      setNewKeyName('');
      setShowKeyModal(false);
      await loadData();
    } catch (err) {
      alert('Erro ao criar chave');
    }
  };

  const handleConfirmRevoke = async () => {
    if (!keyToRevoke) return;
    try {
      await revogarChaveApi(keyToRevoke.id);
      setKeyToRevoke(null);
      await loadData();
    } catch (err) {
      alert('Erro ao revogar chave');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickDemoLogin = async () => {
    try {
      setDemoLoading(true);
      const company = await loginEmpresa('contato@logisticaexpress.com.br', '123456');
      if (onDemoLogin) {
        onDemoLogin(company);
      }
    } catch (err) {
      console.error('Erro ao conectar com demo:', err);
      onOpenAuth();
    } finally {
      setDemoLoading(false);
    }
  };

  const handleRunApiTest = async () => {
    const cleanCep = testCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setTestError('Por favor, informe um CEP válido com 8 dígitos para testar.');
      return;
    }
    setTestingApi(true);
    setTestError(null);
    setTestResult(null);
    const startTime = performance.now();
    try {
      const activeKey = selectedKeyForTest || (keys.length > 0 ? keys[0].key : 'cs_live_9b4e8721fa09cd3491e');
      const response = await fetch('/api/v1/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey,
        },
        body: JSON.stringify({ cep: cleanCep }),
      });
      const latency = Math.round(performance.now() - startTime);
      setTestLatency(latency);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      setTestResult(data);
      loadData();
    } catch (err: any) {
      setTestError(err.message || 'Erro ao executar teste de API.');
    } finally {
      setTestingApi(false);
    }
  };

  const filteredLogs = (stats?.recentLogs || []).filter((log) => {
    const cleanSearch = logSearchFilter.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      log.cep.toLowerCase().includes(cleanSearch) ||
      log.endpoint.toLowerCase().includes(cleanSearch) ||
      log.source.toLowerCase().includes(cleanSearch);
    const matchesStatus =
      logStatusFilter === 'all' ||
      (logStatusFilter === '200' ? log.status === 200 : log.status !== 200);
    return matchesSearch && matchesStatus;
  });

  const handleExportLogsCsv = () => {
    if (!filteredLogs.length) return;
    const headers = ['ID', 'Data_Hora', 'Rota_Endpoint', 'CEP', 'HTTP_Status', 'Latencia_ms', 'Provedor'];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.timestamp).toISOString(),
      l.endpoint,
      l.cep,
      l.status,
      l.responseTimeMs,
      l.source,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-api-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!loggedCompany) {
    return (
      <div className="dashboard-page space-y-6">
        {/* Protected Gate Screen */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] text-center max-w-3xl mx-auto space-y-6 my-4 sm:my-8">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Ambiente Corporativo & Desenvolvedores</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Área Restrita da Empresa
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Para visualizar métricas de tráfego, emitir tokens de produção e gerenciar o consumo de requisições, autentique-se com sua conta corporativa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <Key className="w-5 h-5 text-indigo-600 mb-2" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Chaves de API</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Gere e revogue credenciais seguras para seus servidores e checkouts.
              </p>
            </div>
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <Activity className="w-5 h-5 text-emerald-600 mb-2" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Métricas & SLA</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Monitore latência média (ms), taxa de disponibilidade e limites diários.
              </p>
            </div>
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <Shield className="w-5 h-5 text-amber-600 mb-2" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Logs de Auditoria</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Histórico de cada consulta de CEP processada pelos seus sistemas.
              </p>
            </div>
          </div>

          {/* Gate Screen Action Buttons */}
          <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleQuickDemoLogin}
              disabled={demoLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{demoLoading ? 'Conectando...' : 'Acessar com Conta Demo (1 Toque)'}</span>
            </button>
            <button
              onClick={onOpenAuth}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Entrar com Outra Conta</span>
            </button>
            <button
              onClick={openPricing}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-800 text-xs sm:text-sm font-bold rounded-full border border-slate-200 transition-all cursor-pointer"
            >
              Conhecer Planos
            </button>
          </div>

          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-xs text-slate-600 max-w-md mx-auto">
            <span>⚡ <strong>Demonstração Instantânea:</strong> A conta <strong>Logística Express Brasil</strong> possui o plano <em>Business</em> ativado, chaves geradas e métricas em tempo real prontas para testar.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page space-y-6">
      {/* Corporate Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Painel de Integração & API
            </h1>
            {loggedCompany && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                {loggedCompany.name}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Controle de chaves de acesso, consumo de requisições e latência dos serviços de consulta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowKeyModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Chave de API</span>
          </button>

          <button
            onClick={openPricing}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100/80 active:scale-95 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ver Planos</span>
          </button>

          <button
            onClick={loadData}
            aria-label="Atualizar métricas do painel"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all active:scale-95 cursor-pointer"
            title="Atualizar Métricas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Consultas Hoje</span>
            <Activity className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {stats?.totalRequestsToday.toLocaleString() || '2.883'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Limite diário do plano: 10.000</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Latência Média</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {stats?.avgResponseTime || 38} ms
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Estável
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Triplo fallback e cache local</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Taxa de Sucesso (SLA)</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {stats?.successRate || 99.8}%
            </span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              99.9% Meta
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Zero indisponibilidade crítica</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">Chaves Ativas</span>
            <Key className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {keys.filter((k) => k.active).length}
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              {loggedCompany?.plan || 'Business'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Produção e Homologação</p>
        </div>
      </div>

      {/* 7-Day Traffic Visualization */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-700" />
              <span>Volume de Consultas dos Últimos 7 Dias</span>
            </h3>
            <p className="text-xs text-slate-500">Distribuição diária de requisições nos seus sistemas</p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Total da semana: 32.510 requisições
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 items-end h-40 border-b border-slate-100">
          {stats?.dailyUsage.map((item, idx) => {
            const heightPercent = Math.min(100, Math.round((item.requests / 7000) * 100));
            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] sm:text-xs font-mono text-slate-500 font-bold mb-1">
                  {item.requests}
                </span>
                <div className="w-full bg-slate-100/80 rounded-t-xl h-full max-h-24 flex items-end overflow-hidden">
                  <div
                    className="w-full bg-slate-900 rounded-t-xl transition-all duration-300 group-hover:bg-indigo-600"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-600 mt-2">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Keys Management */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-700" />
              <span>Chaves de Acesso (API Keys)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Passe o token via cabeçalho HTTP <code className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-800 font-mono font-semibold">x-api-key: cs_live_...</code>
            </p>
          </div>

          <button
            onClick={() => setShowKeyModal(true)}
            className="text-xs font-bold bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-4 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Nova Chave</span>
          </button>
        </div>

        {/* Apple Obsidian Developer Card - Luxury Credential Display */}
        {keys.length > 0 && (
          <div className="apple-obsidian-card rounded-4xl p-6 text-white relative shadow-xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-6 rounded-md bg-linear-to-tr from-amber-300 via-amber-100 to-amber-400 border border-amber-200/60 shadow-inner flex items-center justify-center">
                  <div className="w-5 h-3 border border-amber-600/40 rounded-xs" />
                </div>
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-slate-400 block">
                    CREDENTIAL PASS
                  </span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{keys[0].name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-200">
                  {keys[0].plan}
                </span>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {keys[0].rateLimit} req/min
                </span>
              </div>
            </div>

            <div className="py-4">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">Chave de Produção Ativa</span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                <span className="font-mono text-xs sm:text-sm font-bold text-emerald-300 tracking-wider break-all">
                  {keys[0].key}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(keys[0].key)}
                  className="px-3.5 py-1.5 bg-white text-slate-950 hover:bg-slate-100 active:scale-95 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                >
                  {copiedKey === keys[0].key ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Chave</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px] truncate">curl -H "x-api-key: {keys[0].key.slice(0, 10)}..." /api/v1/validate?cep=01310-100</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`curl -H "x-api-key: ${keys[0].key}" "${window.location.origin}/api/v1/validate?cep=01310-100"`)}
                className="text-[11px] text-indigo-300 hover:text-white underline cursor-pointer text-left sm:text-right"
              >
                Copiar cURL
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-2">Identificação</th>
                <th className="pb-3 px-2">Chave de API</th>
                <th className="pb-3 px-2">Plano</th>
                <th className="pb-3 px-2">Rate Limit</th>
                <th className="pb-3 px-2">Uso Hoje</th>
                <th className="pb-3 px-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-2 font-bold text-slate-900">{k.name}</td>
                  <td className="py-3.5 px-2 font-mono text-slate-600">
                    <span className="bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/80 text-[11px]">
                      {k.key.slice(0, 12)}••••••••••••
                    </span>
                    <button
                      onClick={() => copyToClipboard(k.key)}
                      className="ml-2 text-slate-400 hover:text-slate-900 active:scale-95 transition-all cursor-pointer inline-flex items-center"
                      title="Copiar Chave Completa"
                      aria-label="Copiar chave"
                    >
                      {copiedKey === k.key ? <Check className="w-3.5 h-3.5 text-emerald-600 inline" /> : <Copy className="w-3.5 h-3.5 inline" />}
                    </button>
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="font-bold px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-800">
                      {k.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 font-medium text-slate-700">{k.rateLimit} req/min</td>
                  <td className="py-3.5 px-2">
                    <span className="font-bold text-slate-900 font-mono">{k.requestsToday}</span>
                    <span className="text-slate-400"> / {k.requestsLimitToday}</span>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => setKeyToRevoke(k)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Revogar Chave"
                      aria-label="Revogar chave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Live API Tester */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span>Simulador & Testador de API em Tempo Real</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Faça disparos de teste no endpoint <code className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-800 font-mono font-semibold">POST /api/v1/validate</code> utilizando suas credenciais ativas.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-full self-start sm:self-auto">
            Sandbox Dev
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-test-cep">
              CEP para Teste
            </label>
            <input
              id="input-test-cep"
              type="text"
              value={testCep}
              onChange={(e) => setTestCep(e.target.value)}
              placeholder="Ex: 01310-100"
              className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none transition-all focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="select-test-key">
              Chave de API (Header x-api-key)
            </label>
            <select
              id="select-test-key"
              value={selectedKeyForTest || (keys[0]?.key || '')}
              onChange={(e) => setSelectedKeyForTest(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-mono text-slate-800 outline-none transition-all"
            >
              {keys.map((k) => (
                <option key={k.id} value={k.key}>
                  {k.name} ({k.key.slice(0, 14)}...) - {k.plan}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              onClick={handleRunApiTest}
              disabled={testingApi}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {testingApi ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Testando...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Disparar Consulta</span>
                </>
              )}
            </button>
          </div>
        </div>

        {testError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{testError}</span>
          </div>
        )}

        {testResult && (
          <div className="p-4 sm:p-5 bg-slate-900 text-slate-100 rounded-2xl space-y-3 font-mono text-xs border border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800 font-sans text-xs">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  HTTP 200 OK
                </span>
                <span className="text-slate-400 font-mono">
                  Latência: <strong>{testLatency} ms</strong>
                </span>
                <span className="text-slate-400">
                  Fonte: <strong>{testResult.data?.fonte || 'ViaCEP'}</strong>
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2))}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-mono cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar JSON</span>
              </button>
            </div>

            <pre className="max-h-52 overflow-y-auto text-[11px] leading-relaxed text-emerald-300 scrollbar-thin">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Real-Time Request Logs */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Histórico de Requisições Recentes</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Exibindo {filteredLogs.length} de {stats?.recentLogs.length || 0} consultas processadas pelos seus servidores
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportLogsCsv}
              disabled={filteredLogs.length === 0}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold rounded-full border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Exportar logs filtrados em formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar CSV</span>
            </button>

            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Logs Ativos
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl">
          <div className="relative flex-1 min-w-50">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={logSearchFilter}
              onChange={(e) => setLogSearchFilter(e.target.value)}
              placeholder="Filtrar por CEP, rota ou provedor..."
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:border-slate-800 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={logStatusFilter}
              onChange={(e) => setLogStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-slate-800 outline-none transition-all cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="200">Apenas 200 OK</option>
              <option value="error">Erros & 404</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              Nenhuma requisição corresponde aos filtros aplicados.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Horário</th>
                  <th className="pb-3 px-2">Rota</th>
                  <th className="pb-3 px-2">CEP Consultado</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Latência</th>
                  <th className="pb-3 px-2">Provedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-2 text-slate-500 font-sans">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </td>
                    <td className="py-3 px-2 text-slate-800 font-semibold">{log.endpoint}</td>
                    <td className="py-3 px-2 text-slate-900 font-bold">{log.cep}</td>
                    <td className="py-3 px-2 font-sans">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 200
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status} OK
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-800 font-bold">{log.responseTimeMs} ms</td>
                    <td className="py-3 px-2 text-slate-600 font-sans">{log.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for creating key */}
      {showKeyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Gerar Nova Chave de API</h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dê um nome claro para o ambiente onde esta chave será utilizada (ex: Produção, Staging, App Mobile).
            </p>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-new-key-name">
                  Identificação do Ambiente *
                </label>
                <input
                  id="input-new-key-name"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Checkout Loja Virtual ou Backend Logística"
                  className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="select-new-key-plan">
                  Plano Vinculado
                </label>
                <select
                  id="select-new-key-plan"
                  value={newKeyPlan}
                  onChange={(e) => setNewKeyPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-all cursor-pointer"
                >
                  <option value="FREE">Plano FREE (100 req/dia)</option>
                  <option value="STARTUP">Plano STARTUP (10.000 req/mês)</option>
                  <option value="BUSINESS">Plano BUSINESS (100.000 req/mês)</option>
                  <option value="ENTERPRISE">Plano ENTERPRISE (1.000.000 req/mês)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all cursor-pointer"
                >
                  Criar Chave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revocation Confirmation Dialog */}
      {keyToRevoke && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Revogar Chave de API?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                A chave <strong>{keyToRevoke.name}</strong> deixará de funcionar imediatamente. Aplicações conectadas a ela receberão erro 401.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setKeyToRevoke(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-full cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer shadow-sm"
              >
                Sim, Revogar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
