import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Scale, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Medal,
  Award,
  ShieldCheck,
  User
} from 'lucide-react';
import api from '../services/api';

const METODOS_VITORIA = [
  { id: 'Nocaute Técnico (TKO)', label: 'Nocaute Técnico (TKO)', desc: 'Interrupção médica ou do árbitro central' },
  { id: 'Nocaute (KO)', label: 'Nocaute Limpo (KO)', desc: 'Contagem de 10 completada na lona' },
  { id: 'Decisão Unânime (DU)', label: 'Decisão Unânime (DU)', desc: 'Pontuação concordante de todos os 3 juízes laterais' },
  { id: 'Decisão Dividida (DD)', label: 'Decisão Dividida (DD)', desc: '2 juízes a favor e 1 contrário' },
  { id: 'Desistência / W.O.', label: 'Desistência / W.O.', desc: 'Não comparecimento ou abandono de corner' },
  { id: 'Desqualificação (DQ)', label: 'Desqualificação (DQ)', desc: 'Golpe ilegal intencional reiterado' },
];

export default function ModalSumulaLuta({ confronto, isOpen, onClose, onSuccess }) {
  const [vencedorId, setVencedorId] = useState(null);
  const [metodoVitoria, setMetodoVitoria] = useState('Nocaute Técnico (TKO)');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (confronto) {
      setVencedorId(confronto.vencedor?.id || confronto.atletaVermelho?.id || null);
      setMetodoVitoria(confronto.metodoVitoria || 'Nocaute Técnico (TKO)');
      setErro(null);
      setObservacoes('');
    }
  }, [confronto]);

  if (!isOpen || !confronto) return null;

  const vermelho = confronto.atletaVermelho;
  const azul = confronto.atletaAzul;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vencedorId) {
      setErro('Selecione o lutador vencedor do combate.');
      return;
    }
    if (!metodoVitoria) {
      setErro('Selecione o método regulamentar da vitória.');
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      const payload = {
        vencedorId: Number(vencedorId),
        metodoVitoria: metodoVitoria.trim()
      };

      const response = await api.patch(`/api/confrontos/${confronto.id}/vencedor`, payload);
      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao registrar vencedor:', err);
      const msg = err.response?.data?.mensagem || err.response?.data?.erro || 'Erro ao registrar resultado da luta na súmula.';
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-left">
        
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-fmt-blue via-slate-900 to-fmt-blue px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Súmula Oficial de Arbitragem FMTTEMA
              </span>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-white">
                Registrar Resultado &bull; Combate #{confronto.numeroLuta} ({confronto.fase || 'Eliminatória'})
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário da Súmula */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[85vh]">
          
          {erro && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-fmt-red shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* 1. SELEÇÃO DO VENCEDOR (CORNERS) */}
          <div>
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Selecione o Atleta Vencedor *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Corner Vermelho */}
              <div
                onClick={() => vermelho && setVencedorId(vermelho.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                  !vermelho
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : vencedorId === vermelho.id
                    ? 'border-fmt-red bg-red-50/80 shadow-md ring-2 ring-fmt-red/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-heading font-black uppercase tracking-wider text-fmt-red bg-red-100 px-2 py-0.5 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-fmt-red" />
                    Corner Vermelho
                  </span>
                  {vencedorId === vermelho?.id && (
                    <CheckCircle2 className="w-5 h-5 text-fmt-red" />
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-fmt-red text-white flex items-center justify-center font-heading font-black text-xs shrink-0">
                    {vermelho?.nome ? vermelho.nome.charAt(0).toUpperCase() : 'V'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-heading font-bold text-sm text-slate-900 block truncate">
                      {vermelho?.nome || 'Aguardando Atleta'}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {vermelho?.academia || 'Academia'} &bull; <strong className="text-emerald-700">{vermelho?.vitorias || 0}W</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Corner Azul */}
              <div
                onClick={() => azul && setVencedorId(azul.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                  !azul
                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                    : vencedorId === azul.id
                    ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-heading font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Corner Azul
                  </span>
                  {vencedorId === azul?.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-heading font-black text-xs shrink-0">
                    {azul?.nome ? azul.nome.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="min-w-0">
                    <span className="font-heading font-bold text-sm text-slate-900 block truncate">
                      {azul?.nome || 'Aguardando Atleta'}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {azul?.academia || 'Academia'} &bull; <strong className="text-emerald-700">{azul?.vitorias || 0}W</strong>
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. MÉTODO DA VITÓRIA */}
          <div>
            <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. Método de Decisão / Encerramento do Combate *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {METODOS_VITORIA.map((metodo) => {
                const ativo = metodoVitoria === metodo.id;
                return (
                  <div
                    key={metodo.id}
                    onClick={() => setMetodoVitoria(metodo.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      ativo
                        ? 'border-fmt-blue bg-blue-50 text-fmt-blue ring-2 ring-fmt-blue/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-xs">
                        {metodo.label}
                      </span>
                      {ativo && <CheckCircle2 className="w-4 h-4 text-fmt-blue" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {metodo.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nota Regulamentar */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Ao homologar a súmula, o sistema finaliza o confronto, avança o vencedor automaticamente para a próxima fase da chave e incrementa o cartel oficial (+1 vitória para o vencedor e +1 derrota para o perdedor).
            </span>
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvando || !vencedorId}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-fmt-red to-fmt-red-hover hover:from-red-600 hover:to-red-700 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {salvando ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Homologando Súmula...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Homologar Súmula Oficial</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
