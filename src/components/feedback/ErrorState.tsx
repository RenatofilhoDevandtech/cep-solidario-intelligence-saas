import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <div
    role="alert"
    className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between"
  >
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-amber-800">{message}</p>
      </div>
    </div>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="min-h-10 shrink-0 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
