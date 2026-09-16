import React, { useState } from 'react';
import {
  ShoppingCart,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  Accessibility,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { consultarCep } from '../services/api.js';

export const CheckoutWidgetDemo: React.FC = () => {
  const [cep, setCep] = useState('01310-100');
  const [logradouro, setLogradouro] = useState('Avenida Paulista');
  const [numero, setNumero] = useState('1578');
  const [complemento, setComplemento] = useState('Masp Subsolo');
  const [bairro, setBairro] = useState('Bela Vista');
  const [cidade, setCidade] = useState('São Paulo');
  const [uf, setUf] = useState('SP');
  const [isPcdAccessible, setIsPcdAccessible] = useState(true);
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
        const data = await consultarCep(clean);
        setLogradouro(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.cidade || '');
        setUf(data.uf || '');
        setIsPcdAccessible(data.acessibilidadeStats.total > 0 && data.acessibilidadeStats.percentRampa > 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const scriptCode = `<!-- CEP Solidário - Widget de Autocompletar e Acessibilidade -->
<script
  src="https://cdn.cepsolidario.org.br/v1/widget.js"
  data-api-key="cs_live_9b4e8721fa09cd3491e"
  data-autofill="true"
  data-validate-realtime="true"
  data-accessibility="true"
  async>
</script>

<input type="text" id="checkout-cep" name="cep" placeholder="00000-000" />
<input type="text" id="checkout-logradouro" name="street" />
<input type="text" id="checkout-bairro" name="district" />
<input type="text" id="checkout-cidade" name="city" />
<input type="text" id="checkout-uf" name="state" />`;

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
            <span>Widget Embeddable para Checkout de E-commerce</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Autocompletar de Endereços com Indicadores de Acessibilidade
          </h2>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            Instale o script no seu checkout (Shopify, Nuvemshop, VTEX ou WooCommerce). Conforme o cliente digita o CEP, os campos de endereço são preenchidos automaticamente com dados oficiais dos Correios e alertas para os entregadores sobre acessibilidade local.
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
                <p className="text-[11px] text-slate-500">Digite um CEP abaixo para ver o preenchimento automático</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Widget Ativo
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Accessibility Note */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-800">
              <Accessibility className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900">Acessibilidade no Ponto de Entrega</span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  {isPcdAccessible
                    ? 'Este CEP possui registros de rampas e elevadores na comunidade. Informação valiosa para orientar entregadores e facilitar o recebimento.'
                    : 'Ainda não há registros de acessibilidade para este CEP. O sistema avisará os entregadores para checarem acessos alternativos.'}
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

            <button
              type="button"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <span>Avançar para Opções de Frete</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Snippet to Embed */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between text-white space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">Como Instalar no seu Checkout</h3>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copiado!' : 'Copiar Script'}</span>
              </button>
            </div>

            <pre className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              {scriptCode}
            </pre>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Vantagens para o Comércio Eletrônico:
            </span>
            <p>• Reduz o abandono de carrinho ao diminuir a digitação de dados pelo cliente.</p>
            <p>• Previne erros de preenchimento e devolução de encomendas pelos Correios e transportadoras.</p>
            <p>• Apoia a inclusão social e acessibilidade sem custo adicional.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
