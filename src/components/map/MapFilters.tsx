import React from 'react';
import { Filter } from 'lucide-react';

interface MapFiltersProps {
  filteredCount: number;
  selectedUf: string | null;
  filters: {
    key: string;
    label: string;
    active: boolean;
    tone: 'green' | 'indigo';
    onToggle: () => void;
  }[];
}

export const MapFilters: React.FC<MapFiltersProps> = ({
  filteredCount,
  selectedUf,
  filters,
}) => (
  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
    <span className="mr-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
      <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      Filtros inclusivos:
    </span>

    {filters.map((filter) => {
      const activeClasses = filter.tone === 'green'
        ? 'bg-emerald-600 text-white border-emerald-600'
        : 'bg-indigo-600 text-white border-indigo-600';
      const inactiveClasses = filter.tone === 'green'
        ? 'bg-slate-100/70 text-slate-700 border-slate-200/80 hover:bg-slate-200/70'
        : 'bg-indigo-50/70 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/70';

      return (
        <button
          key={filter.key}
          type="button"
          aria-pressed={filter.active}
          onClick={filter.onToggle}
          className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
            filter.active ? activeClasses : inactiveClasses
          }`}
        >
          {filter.label}
        </button>
      );
    })}

    <span className="ml-auto text-xs font-semibold text-slate-500">
      Exibindo: <strong className="text-slate-900">{filteredCount}</strong>{' '}
      {filteredCount === 1 ? 'local' : 'locais'}
      {selectedUf ? ` em ${selectedUf}` : ' no Brasil'}
    </span>
  </div>
);
