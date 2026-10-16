import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { PlanInfo } from '../types.js';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
}

const PLANS: PlanInfo[] = [
  {
    id: 'FREE',
    name: 'Desenvolvedor / Grátis',
    price: 'R$ 0',
    priceValue: 0,
    period: 'para sempre',
    consultasMes: '3.000 consultas / mês',
    consultasDia: 100,
    features: [
      '100 consultas / dia',
      'Triplo fallback (ViaCEP + BrasilAPI + AwesomeAPI)',
      'Acesso ao mapa colaborativo de acessibilidade',
      'Exportação de dados abertos em CSV',
      'Especificação OpenAPI em JSON',
    ],
  },
  {
    id: 'STARTUP',
    name: 'Startup',
    price: 'R$ 99',
    priceValue: 99,
    period: '/ mês',
    consultasMes: '10.000 consultas / mês',
    consultasDia: 350,
    features: [
      'Plano conceitual: limites e recursos ainda não disponíveis',
    ],
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    price: 'R$ 499',
    priceValue: 499,
    period: '/ mês',
    consultasMes: '100.000 consultas / mês',
    consultasDia: 3500,
    recommended: true,
    badge: 'Mais Recomendado',
    features: [
      'Plano conceitual: limites e recursos ainda não disponíveis',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'R$ 2.499',
    priceValue: 2499,
    period: '/ mês',
    consultasMes: '1.000.000 consultas / mês',
    consultasDia: 35000,
    badge: 'Alta Escala',
    features: [
      'Plano conceitual: limites e recursos ainda não disponíveis',
    ],
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'stripe'>('select');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChoosePlan = (plan: PlanInfo) => {
    if (plan.id === 'FREE') {
      onSelectPlan('FREE');
      onClose();
      return;
    }
    setSelectedPlan(plan);
    setCheckoutStep('stripe');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-200/80 overflow-hidden my-4 sm:my-8">
        {/* Header */}
        <div className="bg-slate-900 px-6 sm:px-8 py-6 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">
              Planos & Capacidade Operacional
            </span>
            <h2 id="pricing-modal-title" className="text-lg sm:text-2xl font-extrabold text-white mt-1 tracking-tight">
              Escolha a capacidade de consultas para sua empresa
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar janela de planos"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {checkoutStep === 'select' ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-5 sm:p-6 border flex flex-col justify-between transition-all relative ${
                    plan.recommended
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {plan.badge && (
                    <span
                      className={`absolute -top-3 right-5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${
                        plan.recommended
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-white'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">{plan.name}</h3>
                    <div className="mt-2.5 mb-2">
                      <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5 font-medium">{plan.period}</span>
                    </div>
                    <p className="text-xs font-bold text-indigo-700 pb-3.5 border-b border-slate-100">
                      {plan.consultasMes}
                    </p>

                    <ul className="mt-3.5 space-y-2.5 text-xs text-slate-600">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleChoosePlan(plan)}
                    className={`mt-6 w-full py-3 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                      plan.recommended
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800'
                    }`}
                  >
                    {plan.priceValue === 0 ? 'Plano Gratuito' : 'Ver proposta'}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
              <span className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Somente o plano gratuito está habilitado. Planos pagos e seus recursos ainda não estão disponíveis.
              </span>
              <span className="font-bold">Limites e valores pagos são apenas ilustrativos.</span>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 max-w-lg mx-auto space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Confirmação • Plano {selectedPlan?.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Valor: <span className="font-bold text-slate-900 font-mono">{selectedPlan?.price}</span> ({selectedPlan?.period})
                </p>
              </div>
              <button
                onClick={() => setCheckoutStep('select')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                ← Outro plano
              </button>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <h4 className="font-extrabold">Este plano ainda não pode ser contratado</h4>
              <p className="mt-2 text-sm leading-relaxed">
                A integração de pagamentos não está configurada. Nenhuma cobrança ou alteração de limites será realizada. Não informe dados de cartão.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutStep('select')}
              className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white"
            >
              Voltar aos planos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
