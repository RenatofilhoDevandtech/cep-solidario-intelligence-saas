import React, { useState, useEffect } from 'react';
import {
  X,
  Accessibility,
  Star,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface AcessibilidadeFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCep: string;
  defaultCity?: string;
  defaultUf?: string;
  onSubmit: (data: {
    cep: string;
    local_nome: string;
    usuario_nome: string;
    rampa_acesso: boolean;
    elevador: boolean;
    banheiro_adaptado: boolean;
    vaga_pcd: boolean;
    piso_tatil: boolean;
    balcao_baixo: boolean;
    interprete_libras?: boolean;
    sinalizacao_sonora?: boolean;
    espaco_calmo?: boolean;
    portas_largas?: boolean;
    comentario: string;
    fotos: string[];
    nota_facilidade: number;
  }) => Promise<void>;
}

export const AcessibilidadeForm: React.FC<AcessibilidadeFormProps> = ({
  isOpen,
  onClose,
  defaultCep,
  defaultCity,
  defaultUf,
  onSubmit,
}) => {
  const [cep, setCep] = useState(defaultCep || '');
  const [localNome, setLocalNome] = useState('');
  const [usuarioNome, setUsuarioNome] = useState('');
  const [rampa, setRampa] = useState(true);
  const [elevador, setElevador] = useState(false);
  const [banheiro, setBanheiro] = useState(true);
  const [vagaPcd, setVagaPcd] = useState(false);
  const [pisoTatil, setPisoTatil] = useState(false);
  const [balcaoBaixo, setBalcaoBaixo] = useState(false);
  // Novas categorias de inclusão total:
  const [libras, setLibras] = useState(false);
  const [sonoro, setSonoro] = useState(false);
  const [espacoCalmo, setEspacoCalmo] = useState(false);
  const [portasLargas, setPortasLargas] = useState(true);

  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Nielsen #3: User Control & Freedom - close with ESC key
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

  // Nielsen #5: Error Prevention
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localNome.trim()) {
      setErrorMsg('Por favor, informe o nome do local ou comércio.');
      return;
    }
    if (!usuarioNome.trim()) {
      setErrorMsg('Por favor, informe o seu nome ou como prefere ser chamado.');
      return;
    }
    if (!comentario.trim()) {
      setErrorMsg('Por favor, descreva as condições de acessibilidade observadas.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const fotos = fotoUrl.trim() ? [fotoUrl.trim()] : [];

      await onSubmit({
        cep: cep || defaultCep,
        local_nome: localNome.trim(),
        usuario_nome: usuarioNome.trim(),
        rampa_acesso: rampa,
        elevador,
        banheiro_adaptado: banheiro,
        vaga_pcd: vagaPcd,
        piso_tatil: pisoTatil,
        balcao_baixo: balcaoBaixo,
        interprete_libras: libras,
        sinalizacao_sonora: sonoro,
        espaco_calmo: espacoCalmo,
        portas_largas: portasLargas,
        comentario: comentario.trim(),
        fotos,
        nota_facilidade: nota,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao cadastrar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="acessibilidade-form-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-6"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Accessibility className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="acessibilidade-form-title" className="text-base font-extrabold text-slate-900 tracking-tight">
                Cadastrar Acessibilidade
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                CEP {cep || defaultCep} {defaultCity ? `• ${defaultCity} - ${defaultUf}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar formulário"
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative banner */}
        <div className="bg-emerald-50/80 border-b border-emerald-100 px-6 py-2.5 text-xs text-emerald-900 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Mapeamento colaborativo aberto. Sem necessidade de login ou senhas complexas.</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-medium"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-local-name">
                Nome do Local / Estabelecimento *
              </label>
              <input
                id="input-local-name"
                type="text"
                value={localNome}
                onChange={(e) => setLocalNome(e.target.value)}
                placeholder="Ex: Farmácia São Paulo, MASP, Padaria"
                className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition-all focus:ring-3 focus:ring-indigo-500/15"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-user-name">
                Seu Nome ou Identificação *
              </label>
              <input
                id="input-user-name"
                type="text"
                value={usuarioNome}
                onChange={(e) => setUsuarioNome(e.target.value)}
                placeholder="Ex: Clara (Cadeirante) ou João (Morador)"
                className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition-all focus:ring-3 focus:ring-indigo-500/15"
                required
              />
            </div>
          </div>

          {/* Accessibility Checkboxes Grid - Categorized for all disabilities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Recursos de Acessibilidade & Inclusão (Todas as Deficiências)
              </label>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Norma ABNT NBR 9050
              </span>
            </div>

            {/* Categoria 1: Mobilidade Física */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                ♿ Mobilidade Física & Motora
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  rampa ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={rampa}
                    onChange={(e) => setRampa(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                  />
                  <span>Rampa de Acesso</span>
                </label>

                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  elevador ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={elevador}
                    onChange={(e) => setElevador(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                  />
                  <span>Elevador Adaptado</span>
                </label>

                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  banheiro ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={banheiro}
                    onChange={(e) => setBanheiro(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                  />
                  <span>Banheiro PCD</span>
                </label>

                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  vagaPcd ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={vagaPcd}
                    onChange={(e) => setVagaPcd(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                  />
                  <span>Vaga Reservada</span>
                </label>

                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  balcaoBaixo ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={balcaoBaixo}
                    onChange={(e) => setBalcaoBaixo(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                  />
                  <span>Balcão Rebaixado</span>
                </label>

                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  portasLargas ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={portasLargas}
                    onChange={(e) => setPortasLargas(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4 accent-emerald-600"
                  />
                  <span>Portas Largas (≥80cm)</span>
                </label>
              </div>
            </div>

            {/* Categoria 2: Sensorial & Cognitiva */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                👁️ 👂 🧠 Sensorial (Visual, Auditiva & Neurodivergência)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  pisoTatil ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={pisoTatil}
                    onChange={(e) => setPisoTatil(e.target.checked)}
                    className="rounded text-indigo-600 w-4 h-4 accent-indigo-600"
                  />
                  <span>Piso Tátil Direcional</span>
                </label>

                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  sonoro ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={sonoro}
                    onChange={(e) => setSonoro(e.target.checked)}
                    className="rounded text-indigo-600 w-4 h-4 accent-indigo-600"
                  />
                  <span>Sinalização Sonora / Braille</span>
                </label>

                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  libras ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={libras}
                    onChange={(e) => setLibras(e.target.checked)}
                    className="rounded text-indigo-600 w-4 h-4 accent-indigo-600"
                  />
                  <span>Atendimento em Libras</span>
                </label>

                <label className={`p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  espacoCalmo ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs' : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
                }`}>
                  <input
                    type="checkbox"
                    checked={espacoCalmo}
                    onChange={(e) => setEspacoCalmo(e.target.checked)}
                    className="rounded text-indigo-600 w-4 h-4 accent-indigo-600"
                  />
                  <span>Espaço Sensorial / Calmo (TEA)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Rating (1 to 5) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nota de Acessibilidade (1 a 5 estrelas) *
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex text-amber-500 gap-1 bg-amber-50/80 p-2 rounded-2xl border border-amber-200/80 self-start">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNota(star)}
                    aria-label={`Atribuir ${star} estrelas`}
                    className="p-1 hover:scale-115 active:scale-95 transition-all cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= nota ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-800">
                {nota === 5
                  ? '★★★★★ Excelente (Totalmente Acessível)'
                  : nota === 4
                  ? '★★★★☆ Muito Bom (Poucos obstáculos)'
                  : nota === 3
                  ? '★★★☆☆ Regular (Acesso parcial)'
                  : nota === 2
                  ? '★★☆☆☆ Ruim (Barreiras arquitetônicas)'
                  : '★☆☆☆☆ Inacessível'}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="input-comment">
              Detalhes e Observações *
            </label>
            <textarea
              id="input-comment"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              placeholder="Ex: Possui rampa suave na entrada, portas largas de 90cm e banheiro no térreo com barras de apoio..."
              className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-2xl text-xs sm:text-sm text-slate-900 outline-none transition-all focus:ring-3 focus:ring-indigo-500/15 leading-relaxed"
              required
            />
          </div>

          {/* Photo URL (optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700" htmlFor="input-photo">
                Link de Foto do Local (Opcional)
              </label>
              <span className="text-[10px] text-slate-400">Ex: link de foto da rampa ou fachada</span>
            </div>
            <input
              id="input-photo"
              type="url"
              value={fotoUrl}
              onChange={(e) => setFotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl text-xs sm:text-sm text-slate-900 outline-none transition-all focus:ring-3 focus:ring-indigo-500/15"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer rounded-full"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-full shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Publicar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
