import React, { useState } from 'react';
import { X, Building2, Lock, Mail, FileText, ArrowRight, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { CompanyUser } from '../types.js';
import { loginEmpresa, registrarEmpresa } from '../services/api.js';

interface CompanyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (company: CompanyUser) => void;
  onAuthSuccess?: (company: CompanyUser) => void;
}

export const CompanyAuthModal: React.FC<CompanyAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('contato@logisticaexpress.com.br');
  const [password, setPassword] = useState('123456');
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const notifySuccess = (company: CompanyUser) => {
    if (typeof onSuccess === 'function') {
      onSuccess(company);
    }
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess(company);
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      let company: CompanyUser;
      if (mode === 'login') {
        company = await loginEmpresa(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Por favor, informe a Razão Social ou Nome Fantasia da empresa.');
        }
        company = await registrarEmpresa({ name, email, password, cnpj });
      }
      notifySuccess(company);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginDemo = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const company = await loginEmpresa('contato@logisticaexpress.com.br', '123456');
      notifySuccess(company);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao entrar com a conta demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('contato@logisticaexpress.com.br');
    setPassword('123456');
    setMode('login');
    setErrorMsg(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-extrabold text-slate-900">
                {mode === 'login' ? 'Acesso Corporativo' : 'Cadastro de Empresa'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'login' ? 'Acesse suas chaves de API e relatórios' : 'Comece a integrar sua operação com plano gratuito'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela"
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Apple Segmented Control */}
        <div className="p-2 bg-slate-100/70 border-b border-slate-100">
          <div className="grid grid-cols-2 p-1 bg-slate-200/50 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Criar Conta Nova
            </button>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="company-name">
                  Razão Social ou Nome Fantasia *
                </label>
                <div className="relative">
                  <input
                    id="company-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Transportadora Rápida Ltda"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all"
                  />
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="company-cnpj">
                  CNPJ (Opcional)
                </label>
                <div className="relative">
                  <input
                    id="company-cnpj"
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="company-email">
              E-mail Corporativo *
            </label>
            <div className="relative">
              <input
                id="company-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@suaempresa.com.br"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700" htmlFor="company-pwd">
                Senha de Acesso *
              </label>
            </div>
            <div className="relative">
              <input
                id="company-pwd"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Processando...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Entrar no Painel da Empresa' : 'Cadastrar e Obter Chaves'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Instant Access Box */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Conta de Demonstração
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Plano Business
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Empresa pré-configurada: <strong>Logística Express Brasil</strong> (<code className="font-mono text-slate-700">contato@logisticaexpress.com.br</code>).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLoginDemo}
                  disabled={loading}
                  className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1 Toque (Demo)</span>
                </button>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="py-2.5 px-3.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 border border-slate-200 text-xs font-bold rounded-full transition-all cursor-pointer"
                  title="Preencher campos do formulário"
                >
                  Preencher
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
