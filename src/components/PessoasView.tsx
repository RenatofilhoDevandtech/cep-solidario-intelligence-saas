import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Layers,
  Sparkles,
  Home,
  Check,
  Building,
} from 'lucide-react';
import { PessoaRecord, NewPessoaPayload, DockerStatus } from '../types.js';
import { listarPessoas, cadastrarPessoa, consultarCep, buscarStatusDocker } from '../services/api.js';

interface PessoasViewProps {
  onNotify?: (message: string, type: 'success' | 'error') => void;
}

export const PessoasView: React.FC<PessoasViewProps> = ({ onNotify }) => {
  // Form State
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');

  // Auto-filled CEP fields
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [uf, setUf] = useState('');
  const [estado, setEstado] = useState('');
  const [rua, setRua] = useState('');
  const [fonteCep, setFonteCep] = useState<string | null>(null);

  // Status & Logic
  const [loadingCep, setLoadingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [termoLgpd, setTermoLgpd] = useState(true);
  const [pessoas, setPessoas] = useState<PessoaRecord[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // LGPD Masking Toggle
  const [showFullCpf, setShowFullCpf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Docker Telemetry
  const [dockerStatus, setDockerStatus] = useState<DockerStatus | null>(null);

  // State abbreviation to Full State Name
  const ufToEstadoMap: Record<string, string> = {
    SP: 'São Paulo', RJ: 'Rio de Janeiro', MG: 'Minas Gerais', ES: 'Espírito Santo',
    PR: 'Paraná', SC: 'Santa Catarina', RS: 'Rio Grande do Sul',
    BA: 'Bahia', PE: 'Pernambuco', CE: 'Ceará', MA: 'Maranhão', PB: 'Paraíba',
    RN: 'Rio Grande do Norte', AL: 'Alagoas', PI: 'Piauí', SE: 'Sergipe',
    DF: 'Distrito Federal', GO: 'Goiás', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
    AM: 'Amazonas', PA: 'Pará', RO: 'Rondônia', AC: 'Acre', AP: 'Amapá', RR: 'Roraima', TO: 'Tocantins',
  };

  // Format CPF as 000.000.000-00
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  // Format CEP as 00000-000
  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Mask CPF for LGPD: ***.456.789-**
  const maskCpfLgpd = (rawCpf: string) => {
    const clean = rawCpf.replace(/\D/g, '');
    if (clean.length < 11) return '***.***.***-**';
    return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
  };

  // Fetch registered people from backend
  const carregarPessoas = async () => {
    try {
      setLoadingList(true);
      const lista = await listarPessoas();
      setPessoas(lista);
    } catch (err: any) {
      console.error('Erro ao carregar lista de pessoas:', err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch Docker telemetry
  const carregarStatusDocker = async () => {
    try {
      const status = await buscarStatusDocker();
      setDockerStatus(status);
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    carregarPessoas();
    carregarStatusDocker();
  }, []);

  // Lookup CEP on blur or 8 digits
  const handleLookupCep = async (cepToLookup: string) => {
    const clean = cepToLookup.replace(/\D/g, '');
    if (clean.length !== 8) return;

    try {
      setLoadingCep(true);
      setErrorMsg(null);
      const data = await consultarCep(clean);
      setLogradouro(data.logradouro || '');
      setBairro(data.bairro || '');
      setLocalidade(data.cidade || '');
      setUf(data.uf || '');
      setRua(data.logradouro || '');
      setEstado(ufToEstadoMap[data.uf?.toUpperCase()] || data.cidade || '');
      setFonteCep(data.fonte || 'ViaCEP');
    } catch (err: any) {
      setErrorMsg(`CEP ${clean} não encontrado na base oficial. Preencha o endereço manualmente.`);
      setFonteCep(null);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      handleLookupCep(clean);
    }
  };

  // Submit registration form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nome.trim()) {
      setErrorMsg('O campo Nome Completo é obrigatório.');
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      setErrorMsg('O CPF informado deve conter exatamente 11 dígitos.');
      return;
    }

    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setErrorMsg('O CEP informado deve conter exatamente 8 dígitos.');
      return;
    }

    if (!numero.trim()) {
      setErrorMsg('O campo Número do endereço é obrigatório.');
      return;
    }

    if (!termoLgpd) {
      setErrorMsg('É necessário autorizar o tratamento de dados de acordo com a LGPD.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: NewPessoaPayload = {
        nome: nome.trim(),
        cpf: formatCpf(cpf),
        cep: formatCep(cep),
        numero: numero.trim(),
        complemento: complemento.trim(),
        logradouro: logradouro.trim() || 'Logradouro não informado',
        bairro: bairro.trim() || 'Bairro não informado',
        localidade: localidade.trim() || 'Cidade não informada',
        uf: uf.trim().toUpperCase() || 'SP',
        estado: estado.trim() || ufToEstadoMap[uf.toUpperCase()] || 'São Paulo',
        rua: rua.trim() || logradouro.trim() || 'Rua não informada',
        termo_lgpd: termoLgpd,
      };

      const nova = await cadastrarPessoa(payload);
      setSuccessMsg(`Pessoa "${nova.nome}" cadastrada com sucesso e persistida no MySQL!`);
      if (onNotify) {
        onNotify(`Cadastro de "${nova.nome}" realizado com sucesso!`, 'success');
      }

      // Reset Form
      setNome('');
      setCpf('');
      setCep('');
      setNumero('');
      setComplemento('');
      setLogradouro('');
      setBairro('');
      setLocalidade('');
      setUf('');
      setEstado('');
      setRua('');
      setFonteCep(null);

      // Refresh registered list
      await carregarPessoas();
      await carregarStatusDocker();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cadastrar pessoa no banco de dados.');
      if (onNotify) {
        onNotify(err.message || 'Falha ao cadastrar no MySQL', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filter list
  const pessoasFiltradas = pessoas.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.nome.toLowerCase().includes(q) ||
      p.localidade.toLowerCase().includes(q) ||
      p.bairro.toLowerCase().includes(q) ||
      p.cep.includes(q) ||
      p.cpf.includes(q)
    );
  });

  // Compute unique cities count
  const cidadesUnicas = new Set(pessoas.map((p) => p.localidade).filter(Boolean)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Badges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-br from-indigo-100/50 via-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/60 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Cadastro Comunitário
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Busca Automática por CEP
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Proteção LGPD
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cadastro & Consulta de Pessoas e Endereços
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
              Cadastre pessoas com localização precisa. Ao informar o CEP, o endereço é completado instantaneamente, reduzindo erros de digitação e acelerando o atendimento comunitário.
            </p>
          </div>

          {/* User Metrics Live Badge */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md shrink-0 sm:w-72">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                Painel do Sistema
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                ● Operacional
              </span>
            </div>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex justify-between items-center">
                <span>Pessoas Cadastradas:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">{pessoas.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cidades Cobertas:</span>
                <span className="font-mono text-indigo-400 font-bold text-sm">{cidadesUnicas}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>Preenchimento por CEP:</span>
                <span className="text-emerald-400 font-semibold">Ativo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Formulário + Painel Informativo Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORMULÁRIO DE CADASTRO (col 12 lg: 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              Novo Cadastro de Pessoa e Endereço
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Preencha os campos abaixo. Ao digitar o CEP, os dados de endereço serão completados automaticamente.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Atenção:</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Sucesso:</p>
                <p>{successMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bloco 1: Dados Pessoais (Preenchidos pelo usuário) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>👤 Dados Pessoais (Preenchidos pelo Usuário)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Nome */}
                <div className="sm:col-span-7 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Clara Oliveira"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* CPF */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    CPF <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: CEP & Auto-complete */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span>📍 Endereço (Busca Automática por CEP)</span>
                </h3>
                {fonteCep && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Fonte: {fonteCep}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* CEP */}
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    CEP <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={9}
                      placeholder="00000-000"
                      value={cep}
                      onChange={handleCepChange}
                      onBlur={() => handleLookupCep(cep)}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                    <div className="absolute right-3 top-3">
                      {loadingCep ? (
                        <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                      ) : (
                        <Search
                          className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors"
                          onClick={() => handleLookupCep(cep)}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Número */}
                <div className="sm:col-span-3 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Número <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1578"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Complemento */}
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Complemento <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Apto 42, Bloco B..."
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Campos Obtidos Automaticamente da API de CEP */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Obtidos Automaticamente via API de CEP:
                  </span>
                  <span className="text-[10px] text-slate-400">Preenchimento instantâneo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Logradouro */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Logradouro
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Aguardando CEP..."
                      value={logradouro}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    />
                  </div>

                  {/* Rua */}
                  <div className="sm:col-span-6 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Rua
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Aguardando CEP..."
                      value={rua}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    />
                  </div>

                  {/* Bairro */}
                  <div className="sm:col-span-5 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Bairro
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Aguardando CEP..."
                      value={bairro}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    />
                  </div>

                  {/* Localidade (Cidade) */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Localidade (Cidade)
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Aguardando CEP..."
                      value={localidade}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    />
                  </div>

                  {/* UF */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      UF
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="UF"
                      value={uf}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 uppercase"
                    />
                  </div>

                  {/* Estado por extenso */}
                  <div className="sm:col-span-12 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Estado (Nome por extenso)
                    </label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Nome do Estado por extenso..."
                      value={estado}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3: Consentimento LGPD */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termoLgpd}
                  onChange={(e) => setTermoLgpd(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  <strong>Conformidade LGPD (Lei nº 13.709/2018):</strong> Autorizo o tratamento seguro dos meus dados pessoais (Nome, CPF e Endereço) para fins de registro cadastral, ciente de que o CPF é protegido por padrão para preservar minha privacidade.
                </span>
              </label>
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cadastrando pessoa...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Pessoa & Endereço</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* PAINEL LATERAL DE ORIENTAÇÃO E CONTROLE ÚTIL AO USUÁRIO (col 12 lg: 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Como Funciona o Cadastro Inteligente */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 text-indigo-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">
                Como Funciona o Preenchimento
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O sistema foi planejado para simplificar o seu dia a dia, eliminando o retrabalho de preencher campos longos de endereçamento manual.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Busca Instantânea por CEP</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Informe os 8 dígitos do CEP. O sistema consulta as bases oficiais e preenche Logradouro, Bairro, Cidade e UF na hora.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Complete com o Número do Local</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Basta digitar o número da residência ou estabelecimento e o complemento se existir (ex: Bloco, Apto, Sala).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Privacidade & LGPD</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    O CPF é armazenado com proteção de dados e exibido com máscara segura para preservar sua confidencialidade.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Painel Rápido de Gestão */}
          <div className="bg-linear-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Database className="w-4 h-4" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  Base Cadastral Atualizada
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Total: <strong className="text-white">{pessoas.length}</strong> pessoas
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Todos os registros ficam salvos de forma segura e imediata, disponíveis na tabela de consulta logo abaixo.
            </p>

            <button
              onClick={carregarPessoas}
              disabled={loadingList}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
              <span>{loadingList ? 'Atualizando registros...' : 'Recarregar Lista de Pessoas'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LISTAGEM DE PESSOAS CADASTRADAS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Pessoas Cadastradas & Endereços
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
                {pessoas.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Lista de registros com endereços validados por CEP e proteção de privacidade.
            </p>
          </div>

          {/* Controles: Busca + Alternador LGPD */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Campo de Busca */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por nome, cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Toggle LGPD */}
            <button
              onClick={() => setShowFullCpf(!showFullCpf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showFullCpf
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={showFullCpf ? 'Ativar proteção de dados (LGPD)' : 'Exibir CPF Completo'}
            >
              {showFullCpf ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ocultar CPF (LGPD)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  <span>Exibir CPF Completo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabela de Pessoas */}
        {loadingList ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-600" />
            <p className="text-sm">Carregando registros de pessoas...</p>
          </div>
        ) : pessoasFiltradas.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">Nenhuma pessoa encontrada.</p>
            <p className="text-xs text-slate-400">
              {searchTerm ? 'Tente outros termos de busca.' : 'Cadastre a primeira pessoa no formulário acima.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/70">
                  <th className="py-3 px-4 rounded-l-xl">Pessoa</th>
                  <th className="py-3 px-4">CPF</th>
                  <th className="py-3 px-4">Logradouro / Rua</th>
                  <th className="py-3 px-4">Nº / Compl.</th>
                  <th className="py-3 px-4">Bairro</th>
                  <th className="py-3 px-4">Localidade - UF</th>
                  <th className="py-3 px-4">CEP</th>
                  <th className="py-3 px-4 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {pessoasFiltradas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {p.nome}
                    </td>
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${showFullCpf ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                        {showFullCpf ? p.cpf : maskCpfLgpd(p.cpf)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{p.logradouro || p.rua}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {p.numero} {p.complemento ? `(${p.complemento})` : ''}
                    </td>
                    <td className="py-3 px-4">{p.bairro}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {p.localidade} - <strong className="text-slate-900">{p.uf}</strong>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold whitespace-nowrap text-indigo-700">
                      {p.cep}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Cadastrado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
