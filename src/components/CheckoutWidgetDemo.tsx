import React, { useState } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Accessibility,
  ShieldCheck,
} from 'lucide-react';
import { consultarCep } from '../services/api.js';

export const CheckoutWidgetDemo: React.FC = () => {
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [accessibilityReports, setAccessibilityReports] = useState<number | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleCepChange = async (val: string) => {
    let clean = val.replace(/\D/g, '');
    if (clean.length > 8) clean = clean.slice(0, 8);
    let formatted = clean;
    if (clean.length > 5) {
      formatted = `${clean.slice(0, 5)}-${clean.slice(5)}`;
    }
    setCep(formatted);

    if (clean.length === 8) {
      try {
        setLoading(true);
        setLookupError(null);
        const data = await consultarCep(clean);
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.cidade || '');
        setUf(data.uf || '');
        setAccessibilityReports(data.acessibilidadeStats.total);
      } catch (err) {
        setAccessibilityReports(null);
        setLookupError(err instanceof Error ? err.message : 'Não foi possível consultar este CEP.');
      } finally {
        setLoading(false);
      }
    } else {
      setLogradouro('');
      setBairro('');
      setCidade('');
      setUf('');
      setAccessibilityReports(null);
      setLookupError(null);
    }
  };

  const scriptCode = `const cep = "01310-100";
const response = await fetch(\`/api/cep/\${cep.replace(/\\D/g, "")}\`);
if (!response.ok) throw new Error("CEP não encontrado");

const endereco = await response.json();
console.log({
  logradouro: endereco.logradouro,
  bairro: endereco.bairro,
  cidade: endereco.cidade,
  uf: endereco.uf,
  totalAvaliacoes: endereco.totalAvaliacoes,
});`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-2">
            <ShoppingCart className="w-3.5 h-3.5 text-slate-700" />
            <span>Simulador local de integração pela API</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Autocompletar de Endereços com Indicadores de Acessibilidade
          </h2>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            Esta tela demonstra uma consulta de CEP dentro do próprio aplicativo. Ainda não existe um widget distribuível para Shopify, Nuvemshop, VTEX ou WooCommerce; uma integração externa precisa consumir a API e implementar seus próprios campos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Interactive E-commerce Checkout Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Simulador de Checkout em Loja Virtual</h3>
                <p className="text-[11px] text-slate-500">Digite um CEP para consultar os dados disponíveis</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Simulador local
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between" htmlFor="sim-cep">
                <span>CEP de Entrega *</span>
                {loading && <span className="text-slate-500 font-normal">Buscando endereço...</span>}
              </label>
              <div className="relative">
                <input
                  id="sim-cep"
                  type="text"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white rounded-xl text-xs font-mono font-bold text-slate-900 outline-none"
                  maxLength={9}
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {cep.replace(/\D/g, '').length === 8 && !loading && !lookupError && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Accessibility Note */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-800">
              <Accessibility className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900">Acessibilidade no Ponto de Entrega</span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {lookupError
                    ? lookupError
                    : accessibilityReports === null
                    ? 'Consulte um CEP para verificar se há relatos comunitários disponíveis.'
                    : accessibilityReports > 0
                    ? `${accessibilityReports} relato(s) comunitário(s) disponível(is). As informações não são verificadas nem certificam acessibilidade.`
                    : 'Sem relatos comunitários para este CEP. A ausência de relatos não significa ausência de acessibilidade.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sim-logradouro">Logradouro</label>
                <input
                  id="sim-logradouro"
                  type="text"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sim-numero">Número</label>
                <input
                  id="sim-numero"
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  placeholder="Ex: 123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sim-comp">Complemento</label>
                <input
                  id="sim-comp"
                  type="text"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  placeholder="Apto, Bloco"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sim-bairro">Bairro</label>
                <input
                  id="sim-bairro"
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sim-cidade">Cidade</label>
                <input
                  id="sim-cidade"
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="sim-uf">UF</label>
                <input
                  id="sim-uf"
                  type="text"
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none"
                />
              </div>
            </div>

          </div>
        </div>

        {/* API integration example */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between text-white space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Exemplo de chamada à API</h3>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copiado!' : 'Copiar exemplo'}</span>
              </button>
            </div>

            <pre className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {scriptCode}
            </pre>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              O que este exemplo demonstra:
            </span>
            <p>• Faz uma consulta à rota pública de CEP no mesmo domínio da aplicação.</p>
            <p>• Retorna dados de endereço e contagem de relatos comunitários quando disponíveis.</p>
            <p>• Não é um script embeddable nem substitui integração e validação no checkout do lojista.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
