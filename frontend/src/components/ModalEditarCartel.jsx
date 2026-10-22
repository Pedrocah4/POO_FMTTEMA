import { useState, useEffect } from 'react';
import { X, Award, Trophy, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../services/api';

// Lista padronizada de cores de Kruang (Graduações oficiais de Muaythai)
// Conforme convenção obrigatória: usar select dropdown para evitar erros de digitação
export const CORES_KRUANG = [
  'Branco',
  'Branco e Amarelo',
  'Amarelo',
  'Amarelo e Verde',
  'Verde',
  'Verde e Azul',
  'Azul',
  'Azul e Vermelho',
  'Vermelho',
  'Vermelho e Branco',
  'Preto',
  'Preto e Branco'
];

export default function ModalEditarCartel({ atleta, isOpen, onClose, onSuccess }) {
  const [vitorias, setVitorias] = useState(0);
  const [derrotas, setDerrotas] = useState(0);
  const [empates, setEmpates] = useState(0);
  const [kruang, setKruang] = useState('Branco');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (atleta) {
      setVitorias(atleta.vitorias ?? 0);
      setDerrotas(atleta.derrotas ?? 0);
      setEmpates(atleta.empates ?? 0);
      setKruang(atleta.kruang || atleta.graduacao || 'Branco');
      setErro(null);
      setSucesso(false);
    }
  }, [atleta, isOpen]);

  if (!isOpen || !atleta) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    // Validação no frontend: valores não podem ser negativos
    if (vitorias < 0 || derrotas < 0 || empates < 0) {
      setErro('Os valores de vitórias, derrotas e empates não podem ser negativos.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vitorias: Number(vitorias),
        derrotas: Number(derrotas),
        empates: Number(empates),
        kruang: kruang,
        graduacao: kruang
      };

      const response = await api.patch(`/api/atletas/${atleta.id}/cartel`, payload);
      setSucesso(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      }, 700);
    } catch (err) {
      const mensagemErro = err.response?.data?.mensagem || 'Falha ao atualizar cartel e graduação do atleta.';
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-fmt-blue to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/15">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 id="modal-title" className="font-heading font-bold text-lg leading-tight">
                Editar Cartel & Kruang
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Painel do Treinador / Homologação FMTTEMA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identificação do Atleta */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Atleta Selecionado:</span>
            <span className="font-heading font-bold text-slate-800 ml-1.5 text-sm">
              {atleta.nome} {atleta.apelido ? `(${atleta.apelido})` : ''}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-semibold">
            ID #{atleta.id}
          </span>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {erro && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cartel e graduação atualizados com sucesso!</span>
            </div>
          )}

          {/* Campo Graduação (Kruang) - Conforme convenção obrigatória: SELECT DROPDOWN */}
          <div>
            <label htmlFor="kruang-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Graduação Oficial (Kruang / Prajied) *
            </label>
            <div className="relative">
              <select
                id="kruang-select"
                value={kruang}
                onChange={(e) => setKruang(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-fmt-blue focus:border-transparent transition-all shadow-sm"
              >
                {CORES_KRUANG.map((cor) => (
                  <option key={cor} value={cor}>
                    {cor}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Menu padronizado para evitar divergências e erros de digitação nas chaves de luta.
            </p>
          </div>

          {/* Seção Numérica do Cartel (Vitórias / Derrotas / Empates) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/80">
              <Award className="w-4 h-4 text-fmt-blue" />
              <span className="text-xs font-bold text-fmt-blue uppercase tracking-wider">
                Histórico de Lutas Oficiais
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Vitórias */}
              <div>
                <label htmlFor="vitorias" className="block text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
                  Vitórias (W)
                </label>
                <input
                  type="number"
                  id="vitorias"
                  min="0"
                  value={vitorias}
                  onChange={(e) => setVitorias(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-center text-base font-heading font-extrabold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                  required
                />
              </div>

              {/* Derrotas */}
              <div>
                <label htmlFor="derrotas" className="block text-[11px] font-bold uppercase tracking-wider text-fmt-red mb-1">
                  Derrotas (L)
                </label>
                <input
                  type="number"
                  id="derrotas"
                  min="0"
                  value={derrotas}
                  onChange={(e) => setDerrotas(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-center text-base font-heading font-extrabold text-fmt-red focus:outline-none focus:ring-2 focus:ring-fmt-red shadow-sm"
                  required
                />
              </div>

              {/* Empates */}
              <div>
                <label htmlFor="empates" className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Empates (D)
                </label>
                <input
                  type="number"
                  id="empates"
                  min="0"
                  value={empates}
                  onChange={(e) => setEmpates(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={loading}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-center text-base font-heading font-extrabold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 text-[11px] text-slate-500">
              <span>Total de Lutas: <strong className="text-slate-800">{Number(vitorias) + Number(derrotas) + Number(empates)}</strong></span>
              <span>Aproveitamento: <strong className="text-slate-800">
                {Number(vitorias) + Number(derrotas) + Number(empates) > 0
                  ? `${Math.round((Number(vitorias) / (Number(vitorias) + Number(derrotas) + Number(empates))) * 100)}%`
                  : '0%'}
              </strong></span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || sucesso}
              className="px-5 py-2.5 rounded-xl bg-fmt-blue hover:bg-fmt-blue-hover text-white font-semibold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
