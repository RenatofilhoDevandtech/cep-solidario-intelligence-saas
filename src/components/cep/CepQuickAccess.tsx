import React from 'react';
import { History, Plus, Zap } from 'lucide-react';

export interface QuickCep {
  label: string;
  sub?: string;
  cep: string;
  uf: string;
  emoji: string;
}

interface CepQuickAccessProps {
  presets: QuickCep[];
  recentCeps: string[];
  onSearch: (cep: string) => void;
  onFocusSearch: () => void;
  onClearHistory: () => void;
}

export const CepQuickAccess: React.FC<CepQuickAccessProps> = ({
  presets,
  recentCeps,
  onSearch,
  onFocusSearch,
  onClearHistory,
}) => (
  <>
    <div className="mt-6 border-t border-slate-100 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Zap className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          Cidades & Acessos Rápidos
        </span>
        <span className="text-[11px] text-slate-400">Escolha uma cidade para começar</span>
      </div>

      <div className="no-scrollbar -mx-1 flex items-center gap-3 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={onFocusSearch}
          className="group flex min-w-20 flex-col items-center justify-center transition-all"
        >
          <span className="flex h-13 w-13 items-center justify-center rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-600 shadow-2xs transition-colors group-hover:border-indigo-600 group-active:scale-95">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="mt-1.5 whitespace-nowrap text-[11px] font-bold text-slate-700">Novo CEP</span>
        </button>

        {presets.map((item) => (
          <button
            key={item.cep}
            type="button"
            onClick={() => onSearch(item.cep)}
            className="group flex min-w-20 flex-col items-center justify-center transition-all"
          >
            <span className="flex h-13 w-13 items-center justify-center rounded-full border border-slate-200/80 bg-slate-100 text-xl shadow-2xs transition-all group-hover:border-indigo-500 group-hover:bg-indigo-50/80 group-active:scale-95">
              {item.emoji}
            </span>
            <span className="mt-1.5 max-w-20 truncate text-[11px] font-bold text-slate-900">{item.label}</span>
            <span className="-mt-0.5 text-[10px] font-mono text-slate-500">{item.uf}</span>
          </button>
        ))}
      </div>
    </div>

    {recentCeps.length > 0 && (
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <History className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            Recentes:
          </span>
          {recentCeps.map((cep) => (
            <button
              key={cep}
              type="button"
              onClick={() => onSearch(cep)}
              className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-200/90 active:scale-95"
            >
              {cep}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[11px] text-slate-400 transition-colors hover:text-slate-700 hover:underline"
        >
          Limpar histórico
        </button>
      </div>
    )}
  </>
);
