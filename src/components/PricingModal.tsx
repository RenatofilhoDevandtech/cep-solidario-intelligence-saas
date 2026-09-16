import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CreditCard,
  ShieldCheck,
  ArrowRight,
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
      'Documentação OpenAPI interativa',
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
      '10.000 consultas / mês',
      'Rate limit de 120 req/min',
      'Score de consistência do endereço',
      'Widget de checkout embeddable',
      'Suporte técnico por e-mail em até 24h',
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
      '100.000 consultas / mês',
      'Rate limit de 300 req/min',
      'Indicadores completos de acessibilidade PCD',
      'Validador em lote para planilhas',
      'SLA contratual de 99.9%',
      'Emissão de Nota Fiscal eletrônica automática',
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
      '1.000.000 consultas / mês',
      'Rate limit de 1.200 req/min',
      'Cluster dedicado de cache Redis',
      'Webhooks em tempo real',
      'Atendimento e gerente de contas dedicado',
      'Faturamento corporativo por boleto bancário',
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
  const [email, setEmail] = useState('compras@empresa.com.br');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
    setSelectedPlan(plan);
    setCheckoutStep('stripe');
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      const checkout = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan?.id,
          email,
          customerId: `cus_${Date.now()}`,
        }),
      });
      if (!checkout.ok) {
        throw new Error('Não foi possível iniciar o checkout.');
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        if (selectedPlan) {
          onSelectPlan(selectedPlan.id);
        }
        onClose();
        setCheckoutStep('select');
        setPaymentSuccess(false);
      }, 1500);
    } catch {
      alert('Erro na confirmação do plano');
    } finally {
      setProcessingPayment(false);
    }
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
                    {plan.priceValue === 0 ? 'Plano Gratuito' : 'Contratar Plano'}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Sem fidelidade: cancele ou altere seu plano quando desejar no painel corporativo.
              </span>
              <span className="font-bold text-slate-800">Faturamento mensal com NF-e automática</span>
            </div>
          </div>
        ) : (
          /* Simulated Stripe Checkout Step */
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

            {paymentSuccess ? (
              <div className="p-6 text-center bg-emerald-50 rounded-3xl border border-emerald-200 space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-emerald-900">Plano Ativado com Sucesso!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Seus novos limites de requisição ({selectedPlan?.consultasMes}) já estão sincronizados com sua conta.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSimulatePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-billing-email">
                    E-mail Corporativo para Envio de Nota Fiscal
                  </label>
                  <input
                    id="input-billing-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-card-num">
                    Número do Cartão Corporativo (Simulação Stripe)
                  </label>
                  <div className="relative">
                    <input
                      id="input-card-num"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none transition-all"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-exp">
                      Validade
                    </label>
                    <input
                      id="input-exp"
                      type="text"
                      defaultValue="12/28"
                      className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-mono font-semibold text-slate-900 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-cvc">
                      CVC
                    </label>
                    <input
                      id="input-cvc"
                      type="text"
                      defaultValue="888"
                      className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm font-mono font-semibold text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processingPayment}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {processingPayment
                      ? 'Processando ativação...'
                      : `Confirmar Ativação (${selectedPlan?.price}/mês)`}
                  </span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
