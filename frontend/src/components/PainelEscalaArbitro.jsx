import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Shield, 
  UserCheck, 
  RefreshCw 
} from 'lucide-react';

export default function PainelEscalaArbitro() {
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');

  const carregarMinhasEscalas = async () => {
    try {
      setLoading(true);
      setErro('');
      const response = await api.get('/api/arbitros/me/escalas');
      setEscalas(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar convocações:', err);
      setErro(err.response?.data?.mensagem || 'Não foi possível carregar suas escalas de arbitragem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMinhasEscalas();
  }, []);

  const confirmarPresenca = async (escalaId) => {
    try {
      setAtualizandoId(escalaId);
      setErro('');
      setMensagemSucesso('');
      const response = await api.patch(`/api/arbitros/me/escalas/${escalaId}/confirmar`);
      
      // Atualiza a lista localmente
      setEscalas((prev) =>
        prev.map((esc) => (esc.id === escalaId ? response.data : esc))
      );
      setMensagemSucesso('Presença confirmada com sucesso! A Federação já registrou sua confirmação.');
      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (err) {
      console.error('Erro ao confirmar presença:', err);
      setErro(err.response?.data?.mensagem || 'Erro ao confirmar presença. Tente novamente.');
    } finally {
      setAtualizandoId(null);
    }
  };

  const recusarPresenca = async (escalaId) => {
    if (!window.confirm('Tem certeza de que deseja informar impossibilidade de comparecimento neste evento?')) {
      return;
    }
    try {
      setAtualizandoId(escalaId);
      setErro('');
      setMensagemSucesso('');
      const response = await api.patch(`/api/arbitros/me/escalas/${escalaId}/recusar`);
      
      setEscalas((prev) =>
        prev.map((esc) => (esc.id === escalaId ? response.data : esc))
      );
      setMensagemSucesso('Status atualizado. A Federação foi notificada da sua indisponibilidade.');
      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (err) {
      console.error('Erro ao recusar presença:', err);
      setErro(err.response?.data?.mensagem || 'Erro ao atualizar status.');
    } finally {
      setAtualizandoId(null);
    }
  };

  const formatarData = (dataIso) => {
    if (!dataIso) return 'Data a definir';
    try {
      const [ano, mes, dia] = dataIso.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dataIso;
    }
  };

  const formatarDataHora = (dataHoraIso) => {
    if (!dataHoraIso) return '';
    try {
      const data = new Date(dataHoraIso);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dataHoraIso;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Quadro Oficial de Arbitragem FMTTEMA</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
            Minhas Convocações e Escalas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Confirme sua escala nos torneios estaduais para homologação prévia da comissão de arbitragem.
          </p>
        </div>

        <button
          onClick={carregarMinhasEscalas}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Alertas de Feedback */}
      {mensagemSucesso && (
        <div className="p-4 mb-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {erro && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Estado de Carregamento */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-fmt-blue" />
          <span className="text-xs font-medium">Buscando convocações ativas...</span>
        </div>
      ) : escalas.length === 0 ? (
        /* Sem convocações */
        <div className="py-10 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 font-heading">
            Nenhuma convocação pendente
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Você não possui escalas em aberto no momento. Quando a diretoria da FMTTEMA convocar você para um evento, ele aparecerá aqui.
          </p>
        </div>
      ) : (
        /* Lista de Escalas */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {escalas.map((escala) => {
            const isPendente = escala.status === 'PENDENTE';
            const isConfirmado = escala.status === 'CONFIRMADO';
            const isRecusado = escala.status === 'RECUSADO';
            const emProcessamento = atualizandoId === escala.id;

            return (
              <div
                key={escala.id}
                className={`relative rounded-xl border p-5 transition-all shadow-sm ${
                  isConfirmado
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isRecusado
                    ? 'border-rose-200 bg-rose-50/15'
                    : 'border-amber-200/90 bg-amber-50/10'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Função: {escala.funcao || 'Árbitro Oficial'}
                    </span>
                    <h3 className="font-heading font-extrabold text-base text-fmt-blue mt-1.5 leading-snug">
                      {escala.eventoNome}
                    </h3>
                  </div>

                  {/* Badge de Status */}
                  {isPendente && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Aguardando Resposta</span>
                    </span>
                  )}
                  {isConfirmado && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Presença Confirmada</span>
                    </span>
                  )}
                  {isRecusado && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Recusado</span>
                    </span>
                  )}
                </div>

                {/* Detalhes do Evento */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-white/70 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-fmt-red shrink-0" />
                    <span><strong>Data:</strong> {formatarData(escala.eventoData)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-fmt-blue shrink-0" />
                    <span><strong>Local:</strong> {escala.eventoLocal || 'A informar pela Federação'}</span>
                  </div>
                  {escala.observacoes && (
                    <div className="pt-1.5 text-[11px] text-slate-500 border-t border-slate-100 mt-2">
                      <strong>Orientação da Federação:</strong> {escala.observacoes}
                    </div>
                  )}
                </div>

                {/* Confirmação Registrada */}
                {isConfirmado && escala.dataConfirmacao && (
                  <div className="text-[11px] text-emerald-700 font-medium mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Confirmado em {formatarDataHora(escala.dataConfirmacao)}</span>
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {isPendente ? (
                    <>
                      <button
                        onClick={() => confirmarPresenca(escala.id)}
                        disabled={emProcessamento}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                      >
                        {emProcessamento ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Confirmar Presença</span>
                      </button>

                      <button
                        onClick={() => recusarPresenca(escala.id)}
                        disabled={emProcessamento}
                        className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Não posso</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] text-slate-500 italic">
                        {isConfirmado ? 'Sua confirmação está ativa no sistema.' : 'Você sinalizou indisponibilidade.'}
                      </span>
                      {isConfirmado ? (
                        <button
                          onClick={() => recusarPresenca(escala.id)}
                          disabled={emProcessamento}
                          className="text-[11px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
                        >
                          Alterar para indisponível
                        </button>
                      ) : (
                        <button
                          onClick={() => confirmarPresenca(escala.id)}
                          disabled={emProcessamento}
                          className="text-[11px] text-emerald-700 hover:underline font-semibold cursor-pointer"
                        >
                          Confirmar presença agora
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
