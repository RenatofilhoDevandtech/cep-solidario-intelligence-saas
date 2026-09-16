import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  Star,
  Check,
  X,
  Building2,
  Calendar,
  User,
  HeartHandshake,
  ShieldCheck,
  Plus,
  MapPin,
} from 'lucide-react';
import { AcessibilidadeAvaliacao } from '../types.js';

interface AvaliacoesListaProps {
  avaliacoes: AcessibilidadeAvaliacao[];
  onUpvote: (id: string) => Promise<void>;
  onOpenForm: () => void;
  cep: string;
}

export const AvaliacoesLista: React.FC<AvaliacoesListaProps> = ({
  avaliacoes,
  onUpvote,
  onOpenForm,
  cep,
}) => {
  const [upvotingId, setUpvotingId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPhoto) {
        setSelectedPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto]);

  const handleUpvoteClick = async (id: string) => {
    try {
      setUpvotingId(id);
      await onUpvote(id);
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Locais com Acessibilidade no CEP {cep || '01310-100'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {avaliacoes.length} {avaliacoes.length === 1 ? 'local avaliado' : 'locais avaliados'} por cidadãos e voluntários
            </p>
          </div>
        </div>

        <button
          onClick={onOpenForm}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:scale-95 px-4 py-2 rounded-full border border-emerald-200 transition-all cursor-pointer select-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Novo Local</span>
        </button>
      </div>

      {avaliacoes.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300/80">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">Nenhum local cadastrado neste CEP ainda</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Conhece algum comércio, repartição pública ou farmácia acessível aqui? Ajude a comunidade registrando o local.
          </p>
          <button
            onClick={onOpenForm}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-full shadow-sm transition-all"
          >
            Cadastrar Local Acessível
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {item.local_nome}
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.cep}
                    </span>
                  </h3>
                  {/* Endereço específico do local avaliado */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>
                      {item.logradouro ? item.logradouro : 'Logradouro'}, nº <strong className="text-slate-900">{item.numero || 'S/N'}</strong>
                      {item.complemento ? ` (${item.complemento})` : ''}
                      {item.bairro ? ` • ${item.bairro}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.usuario_nome}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verificado
                    </span>
                  </div>
                </div>

                {/* Rating score - Apple Style Pill */}
                <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-200/80 px-3 py-1 rounded-full self-start sm:self-auto">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < item.nota_facilidade ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-900 ml-1 font-mono">
                    {item.nota_facilidade}.0
                  </span>
                </div>
              </div>

              {/* Badges of features - Multi-Disability Inclusion */}
              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    item.rampa_acesso
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {item.rampa_acesso ? <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" /> : <X className="w-3 h-3 text-slate-400" />}
                  Rampa
                </span>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    item.elevador
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {item.elevador ? <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" /> : <X className="w-3 h-3 text-slate-400" />}
                  Elevador
                </span>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    item.banheiro_adaptado
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {item.banheiro_adaptado ? <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" /> : <X className="w-3 h-3 text-slate-400" />}
                  Banheiro PCD
                </span>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    item.vaga_pcd
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {item.vaga_pcd ? <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" /> : <X className="w-3 h-3 text-slate-400" />}
                  Vaga Reservada
                </span>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    item.piso_tatil
                      ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                      : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {item.piso_tatil ? <Check className="w-3 h-3 text-indigo-600 stroke-[2.5]" /> : <X className="w-3 h-3 text-slate-400" />}
                  Piso Tátil (Visual)
                </span>

                {item.sinalizacao_sonora && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-indigo-50 text-indigo-900 border border-indigo-200">
                    <Check className="w-3 h-3 text-indigo-600 stroke-[2.5]" />
                    Áudio/Braille (Cegos)
                  </span>
                )}

                {item.interprete_libras && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-indigo-50 text-indigo-900 border border-indigo-200">
                    <Check className="w-3 h-3 text-indigo-600 stroke-[2.5]" />
                    Libras (Surdos)
                  </span>
                )}

                {item.espaco_calmo && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-indigo-50 text-indigo-900 border border-indigo-200">
                    <Check className="w-3 h-3 text-indigo-600 stroke-[2.5]" />
                    Espaço Calmo (TEA)
                  </span>
                )}

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    item.balcao_baixo
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 line-through'
                  }`}
                >
                  {item.balcao_baixo ? <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" /> : <X className="w-3 h-3 text-slate-400" />}
                  Balcão Baixo
                </span>
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200/80 leading-relaxed">
                "{item.comentario}"
              </p>

              {/* Photos Gallery */}
              {item.fotos && item.fotos.length > 0 && (
                <div className="flex gap-2.5 pt-1">
                  {item.fotos.map((url, pIdx) => (
                    <img
                      key={pIdx}
                      src={url}
                      alt="Foto do local acessível"
                      referrerPolicy="no-referrer"
                      onClick={() => setSelectedPhoto(url)}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-85 active:scale-95 transition-all shadow-2xs"
                    />
                  ))}
                </div>
              )}

              {/* Footer actions: Upvotes */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">
                  {item.upvotes} {item.upvotes === 1 ? 'confirmação cidadã' : 'confirmações cidadãs'}
                </span>

                <button
                  onClick={() => handleUpvoteClick(item.id)}
                  disabled={upvotingId === item.id}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 active:scale-95 text-slate-700 border border-slate-200/80 rounded-full text-xs font-bold transition-all cursor-pointer"
                  title="Confirmar veracidade da acessibilidade"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Confirmar (+{item.upvotes})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl bg-white p-2 rounded-3xl shadow-2xl">
            <img
              src={selectedPhoto}
              alt="Foto ampliada do local"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto rounded-2xl object-contain"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              aria-label="Fechar foto ampliada"
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white rounded-full p-2.5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
