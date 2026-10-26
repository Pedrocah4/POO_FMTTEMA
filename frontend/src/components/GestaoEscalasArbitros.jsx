import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserPlus, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function GestaoEscalasArbitros() {
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [escalas, setEscalas] = useState([]);
  const [arbitros, setArbitros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carregandoEscalas, setCarregandoEscalas] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form states
  const [formArbitroId, setFormArbitroId] = useState('');
  const [formFuncao, setFormFuncao] = useState('Árbitro Central');
  const [formObservacoes, setFormObservacoes] = useState('');

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      const [respEventos, respArbitros] = await Promise.all([
        api.get('/api/eventos'),
        api.get('/api/arbitros')
      ]);

      const listaEv = respEventos.data || [];
      setEventos(listaEv);
      setArbitros(respArbitros.data || []);

      if (listaEv.length > 0) {
        setEventoSelecionado(listaEv[0].id);
        carregarEscalasEvento(listaEv[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const carregarEscalasEvento = async (eventoId) => {
    try {
      setCarregandoEscalas(true);
      const resp = await api.get(`/api/arbitros/escalas/evento/${eventoId}`);
      setEscalas(resp.data || []);
    } catch (err) {
      console.error('Erro ao buscar escalas do evento:', err);
      setEscalas([]);
    } finally {
      setCarregandoEscalas(false);
    }
  };

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const handleTrocaEvento = (e) => {
    const id = Number(e.target.value);
    setEventoSelecionado(id);
    carregarEscalasEvento(id);
  };

  const handleConvocar = async (e) => {
    e.preventDefault();
    if (!formArbitroId || !eventoSelecionado) {
      alert('Selecione um árbitro e um evento.');
      return;
    }

    try {
      setSalvando(true);
      await api.post('/api/arbitros/escalas', {
        arbitroId: Number(formArbitroId),
        eventoId: eventoSelecionado,
        funcao: formFuncao,
        observacoes: formObservacoes
      });

      setFeedback({
        tipo: 'sucesso',
        mensagem: 'Árbitro convocado com sucesso! A convocação está disponível para confirmação no painel dele.'
      });
      setTimeout(() => setFeedback(null), 5000);

      setModalAberto(false);
      setFormArbitroId('');
      setFormObservacoes('');
      carregarEscalasEvento(eventoSelecionado);
    } catch (err) {
      console.error('Erro ao convocar árbitro:', err);
      setFeedback({
        tipo: 'erro',
        mensagem: err.response?.data?.mensagem || 'Erro ao convocar árbitro.'
      });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-fmt-blue" />
            <span>Gestão Administrativa</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
            Escala e Confirmação de Árbitros (US08)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Acompanhe em tempo real quais árbitros confirmaram presença e convoque novos oficiais para os torneios.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModalAberto(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-fmt-blue hover:bg-fmt-blue-hover text-white shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Convocar Árbitro</span>
          </button>

          <button
            onClick={() => eventoSelecionado && carregarEscalasEvento(eventoSelecionado)}
            disabled={carregandoEscalas}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Atualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${carregandoEscalas ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 mb-6 rounded-lg text-xs sm:text-sm flex items-center gap-2.5 ${
            feedback.tipo === 'sucesso'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {feedback.tipo === 'sucesso' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.mensagem}</span>
        </div>
      )}

      {/* Seletor de Evento */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
          Filtrar por Evento:
        </label>
        <select
          value={eventoSelecionado || ''}
          onChange={handleTrocaEvento}
          className="flex-1 w-full sm:w-auto px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-fmt-blue"
        >
          {eventos.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.nome} - {ev.data} ({ev.local})
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Escalas do Evento */}
      {carregandoEscalas ? (
        <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-fmt-blue" />
          <span className="text-xs">Carregando escalas do evento...</span>
        </div>
      ) : escalas.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Nenhum árbitro escalado para este evento ainda.</p>
          <button
            onClick={() => setModalAberto(true)}
            className="text-xs text-fmt-red font-bold hover:underline mt-1 cursor-pointer"
          >
            Clique aqui para convocar o primeiro árbitro
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-heading font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Árbitro</th>
                <th className="px-4 py-3">Função Oficial</th>
                <th className="px-4 py-3">Status de Presença</th>
                <th className="px-4 py-3">Convocado em</th>
                <th className="px-4 py-3">Confirmação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {escalas.map((esc) => {
                const isConfirmado = esc.status === 'CONFIRMADO';
                const isPendente = esc.status === 'PENDENTE';
                const isRecusado = esc.status === 'RECUSADO';

                return (
                  <tr key={esc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {esc.arbitroEmail}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                        {esc.funcao}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {isConfirmado && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Confirmado</span>
                        </span>
                      )}
                      {isPendente && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pendente</span>
                        </span>
                      )}
                      {isRecusado && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Recusado</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {esc.dataConvocacao ? new Date(esc.dataConvocacao).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {esc.dataConfirmacao ? (
                        <span className="text-emerald-700 font-medium">
                          {new Date(esc.dataConfirmacao).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Aguardando resposta</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Convocação */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
            <h3 className="font-heading font-extrabold text-lg text-fmt-blue mb-1">
              Convocar Árbitro Oficial
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              O árbitro receberá a notificação em seu painel pessoal para confirmar a presença.
            </p>

            <form onSubmit={handleConvocar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecione o Árbitro:
                </label>
                <select
                  required
                  value={formArbitroId}
                  onChange={(e) => setFormArbitroId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fmt-blue bg-white"
                >
                  <option value="">-- Selecione um árbitro cadastrado --</option>
                  {arbitros.map((arb) => (
                    <option key={arb.id} value={arb.id}>
                      {arb.email} (ID: {arb.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Função no Torneio:
                </label>
                <select
                  value={formFuncao}
                  onChange={(e) => setFormFuncao(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fmt-blue bg-white"
                >
                  <option value="Árbitro Central">Árbitro Central</option>
                  <option value="Juiz Lateral (Pontuação)">Juiz Lateral (Pontuação)</option>
                  <option value="Cronometrista Oficial">Cronometrista Oficial</option>
                  <option value="Mesário / Súmula">Mesário / Súmula</option>
                  <option value="Fiscal de Pesagem">Fiscal de Pesagem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instruções / Observações (opcional):
                </label>
                <textarea
                  rows="2"
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Ex: Chegar com 1h de antecedência com o uniforme oficial FMTTEMA..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={salvando}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-fmt-blue hover:bg-fmt-blue-hover text-white cursor-pointer shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {salvando && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirmar Convocação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
