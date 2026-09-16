import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Play,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

interface EndpointDef {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  title: string;
  desc: string;
  b2b?: boolean;
  sampleBody?: any;
  defaultParam?: string;
}

const ENDPOINTS: EndpointDef[] = [
  {
    method: 'POST',
    path: '/api/v1/validate',
    title: 'Validação & Enriquecimento B2B (API Corporativa)',
    desc: 'Valida o CEP com triplo fallback, calcula score de consistência do endereço (0-100), risco logístico de extravio e indicadores de acessibilidade.',
    b2b: true,
    sampleBody: { cep: '01310-100' },
  },
  {
    method: 'GET',
    path: '/api/cep/{cep}',
    title: 'Consulta Completa de CEP (Pública)',
    desc: 'Consulta endereço via ViaCEP com fallback automático para BrasilAPI e AwesomeAPI, retornando coordenadas e acessibilidade cadastrada.',
    defaultParam: '01310100',
  },
  {
    method: 'POST',
    path: '/api/acessibilidade',
    title: 'Cadastrar Avaliação de Acessibilidade',
    desc: 'Permite que cidadãos e voluntários registrem rampas, elevadores, banheiros e facilidades para PCD em um CEP.',
    sampleBody: {
      cep: '01310-100',
      local_nome: 'Farmácia Central',
      usuario_nome: 'Mariana Lima',
      rampa_acesso: true,
      elevador: false,
      banheiro_adaptado: true,
      vaga_pcd: true,
      piso_tatil: true,
      balcao_baixo: false,
      comentario: 'Acesso suave pela rampa frontal com corrimão duplo.',
      nota_facilidade: 5,
    },
  },
  {
    method: 'GET',
    path: '/api/acessibilidade/{cep}',
    title: 'Listar Avaliações por CEP',
    desc: 'Retorna a lista completa de avaliações, fotos e estatísticas agregadas de um CEP.',
    defaultParam: '01310-100',
  },
  {
    method: 'GET',
    path: '/api/mapa?lat={lat}&lon={lon}&radius={radius}',
    title: 'Locais Acessíveis em um Raio',
    desc: 'Pesquisa georreferenciada de estabelecimentos com acessibilidade comprovada em um raio especificado em quilômetros.',
    defaultParam: '?lat=-23.561492&lon=-46.655881&radius=25',
  },
  {
    method: 'POST',
    path: '/api/v1/batch',
    title: 'Validação em Lote (Bulk até 1.000 CEPs)',
    desc: 'Processamento em massa de endereços para transportadoras e e-commerces com exportação e métricas agregadas.',
    b2b: true,
    sampleBody: {
      ceps: ['01310100', '22041001', '30130100', '40026280'],
    },
  },
  {
    method: 'POST',
    path: '/api/checkout/session',
    title: 'Criar Sessão de Checkout Stripe',
    desc: 'Gera uma sessão de faturamento SaaS segura com plano, valor e metadados para ativação instantânea.',
    b2b: true,
    sampleBody: {
      plan: 'BUSINESS',
      email: 'financeiro@empresa.com.br',
    },
  },
];

export const ApiDocs: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState('cs_live_9b4e8721fa09cd3491e');
  const [reqBody, setReqBody] = useState(JSON.stringify(ENDPOINTS[0].sampleBody || {}, null, 2));
  const [paramValue, setParamValue] = useState(ENDPOINTS[0].defaultParam || '');
  const [executing, setExecuting] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'js' | 'python'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setReqBody(ep.sampleBody ? JSON.stringify(ep.sampleBody, null, 2) : '');
    setParamValue(ep.defaultParam || '');
    setApiResponse(null);
  };

  const handleRunRequest = async () => {
    setExecuting(true);
    setApiResponse(null);

    let url = selectedEndpoint.path;
    if (url.includes('{cep}')) {
      url = url.replace('{cep}', paramValue || '01310100');
    } else if (url.includes('?lat=')) {
      url = `/api/mapa${paramValue}`;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (selectedEndpoint.b2b) {
        headers['x-api-key'] = apiKey;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.method === 'POST' && reqBody) {
        options.body = reqBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setApiResponse({ status: res.status, data });
    } catch (err: any) {
      setApiResponse({ status: 500, error: err.message });
    } finally {
      setExecuting(false);
    }
  };

  const getCurlSnippet = () => {
    let url = `https://api.cepsolidario.org.br${selectedEndpoint.path}`;
    if (url.includes('{cep}')) url = url.replace('{cep}', paramValue || '01310100');
    if (url.includes('?lat=')) url = `https://api.cepsolidario.org.br/api/mapa${paramValue}`;

    let code = `curl -X ${selectedEndpoint.method} "${url}" \\\n  -H "Content-Type: application/json"`;
    if (selectedEndpoint.b2b) {
      code += ` \\\n  -H "x-api-key: ${apiKey}"`;
    }
    if (selectedEndpoint.method === 'POST' && reqBody) {
      code += ` \\\n  -d '${reqBody.replace(/\n\s*/g, ' ')}'`;
    }
    return code;
  };

  const getJsSnippet = () => {
    let url = selectedEndpoint.path;
    if (url.includes('{cep}')) url = url.replace('{cep}', paramValue || '01310100');
    if (url.includes('?lat=')) url = `/api/mapa${paramValue}`;

    return `const response = await fetch('${url}', {
  method: '${selectedEndpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    ${selectedEndpoint.b2b ? `'x-api-key': '${apiKey}',` : ''}
  },
  ${selectedEndpoint.method === 'POST' ? `body: JSON.stringify(${reqBody}),` : ''}
});
const data = await response.json();
console.log(data);`;
  };

  const getPythonSnippet = () => {
    let url = `https://api.cepsolidario.org.br${selectedEndpoint.path}`;
    if (url.includes('{cep}')) url = url.replace('{cep}', paramValue || '01310100');
    if (url.includes('?lat=')) url = `https://api.cepsolidario.org.br/api/mapa${paramValue}`;

    return `import requests

url = "${url}"
headers = {
    "Content-Type": "application/json",
    ${selectedEndpoint.b2b ? `"x-api-key": "${apiKey}",` : ''}
}
${selectedEndpoint.method === 'POST' ? `payload = ${reqBody}\nresponse = requests.post(url, json=payload, headers=headers)` : `response = requests.get(url, headers=headers)`}

print(response.json())`;
  };

  const currentCode =
    activeCodeTab === 'curl' ? getCurlSnippet() : activeCodeTab === 'js' ? getJsSnippet() : getPythonSnippet();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-slate-700" />
            <span>Documentação OpenAPI 3.0 & Testador Interativo</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Referência de API para Desenvolvedores
          </h2>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            Consulte endpoints públicos de CEP e rotas corporativas autenticadas. Teste as requisições em tempo real e copie exemplos em cURL, JavaScript ou Python.
          </p>

          <div className="mt-3 flex items-center gap-3">
            <a
              href="/api/docs/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Baixar Especificação (openapi.json)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Endpoints Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2">
            Endpoints do Sistema
          </h3>
          {ENDPOINTS.map((ep, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectEndpoint(ep)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-colors ${
                selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                    selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method
                      ? 'bg-white/20 text-white'
                      : ep.method === 'GET'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ep.method === 'POST'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-semibold truncate">{ep.title}</span>
              </div>
              <p
                className={`text-[11px] font-mono truncate ${
                  selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method
                    ? 'text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                {ep.path}
              </p>
            </button>
          ))}
        </div>

        {/* Endpoint Detail & Interactive Test Bench */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">{selectedEndpoint.path}</span>
              </div>
              {selectedEndpoint.b2b && (
                <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                  Requer x-api-key
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{selectedEndpoint.desc}</p>

            {/* Config & Parameters */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {selectedEndpoint.b2b && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="input-docs-apikey">
                    Chave de API (Cabeçalho x-api-key)
                  </label>
                  <input
                    id="input-docs-apikey"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 outline-none"
                  />
                </div>
              )}

              {selectedEndpoint.path.includes('{') && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="input-docs-param">
                    Parâmetro de URL ({selectedEndpoint.path})
                  </label>
                  <input
                    id="input-docs-param"
                    type="text"
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 outline-none"
                  />
                </div>
              )}

              {selectedEndpoint.method === 'POST' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1" htmlFor="textarea-docs-body">
                    Corpo da Requisição (JSON)
                  </label>
                  <textarea
                    id="textarea-docs-body"
                    value={reqBody}
                    onChange={(e) => setReqBody(e.target.value)}
                    rows={5}
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 outline-none"
                  />
                </div>
              )}

              <button
                onClick={handleRunRequest}
                disabled={executing}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{executing ? 'Executando Requisição...' : 'Executar Requisição'}</span>
              </button>
            </div>

            {/* Code Samples */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setActiveCodeTab('curl')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeCodeTab === 'curl' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    cURL
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('js')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeCodeTab === 'js' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      activeCodeTab === 'python' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Python
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copiado' : 'Copiar Código'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {currentCode}
              </pre>
            </div>

            {/* Live Response Box */}
            {apiResponse && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-slate-700" />
                    Resposta do Servidor (Status {apiResponse.status})
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      apiResponse.status === 200 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {apiResponse.status === 200 ? '200 OK' : 'ERRO'}
                  </span>
                </div>
                <pre className="p-4 bg-slate-950 rounded-xl text-[11px] font-mono text-slate-200 max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
