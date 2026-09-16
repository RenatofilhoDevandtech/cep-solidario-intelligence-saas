import React, { useState } from 'react';
import {
  Layers,
  Download,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { processarBatchApi } from '../services/api.js';
import { BatchItemResult } from '../types.js';

const DEMO_BATCH = `01310-100
22041-001
30130-100
40026-280
70040-010
90010-150
01001-000
99999-999
50010-000
80010-000`;

export const BatchValidator: React.FC = () => {
  const [inputText, setInputText] = useState(DEMO_BATCH);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [batchSummary, setBatchSummary] = useState<{
    total: number;
    validCount: number;
    invalidCount: number;
    overallScore: number;
    results: BatchItemResult[];
  } | null>(null);

  const handleRunBatch = async () => {
    setErrorMessage(null);
    const rawList = inputText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawList.length === 0) {
      setErrorMessage('Por favor, insira ou cole pelo menos um CEP para iniciar a validação.');
      return;
    }

    try {
      setProcessing(true);
      const res = await processarBatchApi(rawList);
      setBatchSummary(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro ao processar o lote de CEPs. Tente novamente.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setBatchSummary(null);
    setErrorMessage(null);
  };

  const handleRestoreDemo = () => {
    setInputText(DEMO_BATCH);
    setErrorMessage(null);
  };

  const handleDownloadCsv = () => {
    if (!batchSummary || batchSummary.results.length === 0) return;

    const headers = ['CEP', 'Status', 'Logradouro', 'Bairro', 'Cidade', 'UF', 'Score Qualidade', 'Risco', 'Acessibilidade PCD'];
    const rows = batchSummary.results.map((r) => [
      r.cep,
      r.valid ? 'VALIDO' : 'INVALIDO',
      `"${(r.logradouro || '').replace(/"/g, '""')}"`,
      `"${(r.bairro || '').replace(/"/g, '""')}"`,
      `"${(r.cidade || '').replace(/"/g, '""')}"`,
      r.uf || '',
      r.qualityScore || 0,
      r.riskLevel || 'N/A',
      r.acessibilidade ? 'SIM' : 'NAO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio-ceps-validados-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cepCount = inputText
    .split(/[\n,;]+/)
    .filter((s) => s.trim().length > 0).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-slate-700" />
            <span>Processamento em Massa para Logística e E-commerce</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Validação de CEPs em Lote & Análise de Consistência
          </h2>
          <p className="text-slate-600 text-xs mt-1 leading-relaxed">
            Identifique CEPs inválidos ou desatualizados antes de enviar mercadorias. Cole sua lista de endereços para normalizar cidades, bairros e verificar a cobertura de acessibilidade.
          </p>
        </div>

        {/* Input area */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <label htmlFor="textarea-batch-ceps">
                Lista de CEPs (um por linha ou separados por vírgula):
              </label>
              <span className="text-slate-500 font-mono text-[11px]">
                {cepCount} {cepCount === 1 ? 'CEP inserido' : 'CEPs inseridos'}
              </span>
            </div>

            <textarea
              id="textarea-batch-ceps"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={6}
              className="w-full p-3 bg-slate-50 border border-slate-300 focus:border-slate-800 focus:bg-white rounded-xl text-xs font-mono font-semibold text-slate-900 outline-none transition-colors"
              placeholder="01310-100&#10;22041-001&#10;30130-100"
            />

            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
            <div className="space-y-1.5 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block">Orientações de Uso:</span>
              <p>• Suporta formatos com ou sem traço (ex: 01310100 ou 01310-100).</p>
              <p>• Validação tripla em tempo real através dos Correios e bases abertas.</p>
              <p>• Verificação cruzada com a base comunitária de acessibilidade PCD.</p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={handleRunBatch}
                disabled={processing}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Processando CEPs...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Validar Lista de CEPs</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestoreDemo}
                  className="flex-1 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  Carregar Exemplo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {batchSummary && (
        <div className="space-y-4">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block">Total Processado</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {batchSummary.total}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-emerald-700 font-semibold block">Válidos & Localizados</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                {batchSummary.validCount}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-rose-700 font-semibold block">Inválidos / Inexistentes</span>
              <span className="text-2xl font-bold font-mono text-rose-700 mt-1 block">
                {batchSummary.invalidCount}
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-600 font-semibold block">Índice Médio de Qualidade</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {batchSummary.overallScore} / 100
              </span>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Detalhamento dos Resultados</h3>
                <p className="text-xs text-slate-500">Conferência individualizada com status de entrega</p>
              </div>
              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Relatório CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-3">CEP</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Logradouro Enriquecido</th>
                    <th className="pb-3">Bairro / Cidade - UF</th>
                    <th className="pb-3">Score</th>
                    <th className="pb-3">Risco</th>
                    <th className="pb-3">Acessibilidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {batchSummary.results.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-slate-800">{item.cep}</td>
                      <td className="py-2.5">
                        {item.valid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Válido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3 text-rose-600" /> Inválido
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 font-medium text-slate-800">
                        {item.logradouro || (
                          <span className="text-rose-500 italic">Não localizado na base oficial</span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {item.valid ? `${item.bairro} • ${item.cidade}-${item.uf}` : '-'}
                      </td>
                      <td className="py-2.5 font-mono font-bold text-slate-900">
                        {item.valid ? `${item.qualityScore}/100` : '0'}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            item.riskLevel === 'baixo'
                              ? 'bg-emerald-50 text-emerald-800'
                              : item.riskLevel === 'moderado'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {item.acessibilidade ? (
                          <span className="text-[10px] font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ♿ Mapeado PCD
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
