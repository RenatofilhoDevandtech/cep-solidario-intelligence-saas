import React from 'react';
import { ArrowLeft, Compass, Search } from 'lucide-react';

interface NotFoundProps {
  onBackToSearch: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onBackToSearch }) => {
  return (
    <main className="min-h-[calc(100svh-8rem)] bg-[#f4f7fb] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100">
          <Compass className="h-10 w-10" aria-hidden="true" />
        </div>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">Erro 404</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Este endereço ainda não existe aqui.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
          A página que você tentou acessar não foi encontrada. Volte para a consulta e encontre um endereço válido.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onBackToSearch}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Consultar um CEP
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </button>
        </div>
      </div>
    </main>
  );
};
