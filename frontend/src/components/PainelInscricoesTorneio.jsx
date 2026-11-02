import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  User, 
  Scale, 
  Award, 
  Ticket, 
  Printer, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import FmttemaLogo from './FmttemaLogo';

export default function PainelInscricoesTorneio() {
  const { user } = useAuth();
  const perfil = user?.perfil || 'ADMIN';
  const isAtleta = perfil === 'ATLETA';
  const isTreinador = perfil === 'TREINADOR';
  const isAdmin = perfil === 'ADMIN';

  // Estados principais
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState('');
  const [meuPerfilAtleta, setMeuPerfilAtleta] = useState(null);
  const [listaAtletas, setListaAtletas] = useState([]);
  const [atletaSelecionadoId, setAtletaSelecionadoId] = useState('');

  // Estados de controle e feedback
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [erro403, setErro403] = useState(null);
  const [comprovante, setComprovante] = useState(null);
  const [inscricoesEvento, setInscricoesEvento] = useState([]);
  const [loadingInscricoes, setLoadingInscricoes] = useState(false);

  // 1. Carrega Eventos e Dados do Usuário
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setLoading(true);
      setErro(null);

      try {
        // Carrega lista de eventos
        const resEventos = await api.get('/api/eventos');
        const eventosDisponiveis = resEventos.data || [];
        setEventos(eventosDisponiveis);

        if (eventosDisponiveis.length > 0) {
          // Prioriza o primeiro evento aberto/agendado (não finalizado)
          const eventoAberto = eventosDisponiveis.find(e => e.status !== 'FINALIZADO') || eventosDisponiveis[0];
          setEventoSelecionadoId(String(eventoAberto.id));
        }

        // Se for ATLETA, busca seu próprio perfil em /api/atletas/me
        if (isAtleta) {
          try {
            const resMe = await api.get('/api/atletas/me');
            setMeuPerfilAtleta(resMe.data);
            setAtletaSelecionadoId(String(resMe.data.id));
          } catch (errMe) {
            console.error('Erro ao buscar perfil do atleta:', errMe);
            setErro('Não foi possível identificar o perfil de atleta vinculado ao seu usuário.');
          }
        } else {
          // Se for TREINADOR, ADMIN ou ACADEMIA, carrega lista de atletas
          try {
            const resAtletas = await api.get('/api/atletas');
            const todos = resAtletas.data || [];

            if (isTreinador) {
              // Treinador vê apenas atletas da sua agremiação
              const academiaFiltro = user?.email?.includes('imperatriz')
                ? 'Arena Tocantins Muaythai'
                : 'Centro de Treinamento FMTTEMA';

              const atletasMinhaEquipe = todos.filter(a =>
                (a.academiaNome && a.academiaNome.toLowerCase().includes(academiaFiltro.toLowerCase())) ||
                (a.email === user?.email)
              );
              setListaAtletas(atletasMinhaEquipe);
              if (atletasMinhaEquipe.length > 0) {
                setAtletaSelecionadoId(String(atletasMinhaEquipe[0].id));
              }
            } else {
              // Admin vê todos
              setListaAtletas(todos);
              if (todos.length > 0) {
                setAtletaSelecionadoId(String(todos[0].id));
              }
            }
          } catch (errAtl) {
            console.error('Erro ao carregar lista de atletas:', errAtl);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
        setErro('Não foi possível carregar a lista de torneios da federação.');
      } finally {
        setLoading(false);
      }
    };

    carregarDadosIniciais();
  }, [isAtleta, isTreinador, user]);

  // 2. Carrega as Inscrições confirmadas do Evento selecionado
  const carregarInscricoesDoEvento = async (eventoId) => {
    if (!eventoId) return;
    setLoadingInscricoes(true);
    try {
      const res = await api.get(`/api/eventos/${eventoId}/inscricoes`);
      setInscricoesEvento(res.data || []);
    } catch (err) {
      console.warn('Erro ao carregar inscricoes do evento:', err);
      setInscricoesEvento([]);
    } finally {
      setLoadingInscricoes(false);
    }
  };

  useEffect(() => {
    if (eventoSelecionadoId) {
      carregarInscricoesDoEvento(eventoSelecionadoId);
    }
  }, [eventoSelecionadoId]);

  // Encontra o objeto do evento selecionado
  const eventoAtual = eventos.find(e => String(e.id) === String(eventoSelecionadoId));

  // Encontra o atleta selecionado (para Atleta = meuPerfilAtleta, para outros = selecionado na lista)
  const atletaAtual = isAtleta 
    ? meuPerfilAtleta 
    : listaAtletas.find(a => String(a.id) === String(atletaSelecionadoId));

  // Validação de pagamento do atleta atual
  const statusPagamentoAtleta = atletaAtual?.statusPagamento || 'PENDENTE';
  const anuidadeRegularizada = statusPagamentoAtleta === 'PAGO';

  // Verifica se o atleta já está inscrito neste evento
  const jaInscrito = inscricoesEvento.some(
    ins => ins.atletaId && atletaAtual?.id && String(ins.atletaId) === String(atletaAtual.id)
  );
  const isFinalizado = eventoAtual?.status === 'FINALIZADO';

  // Submissão da Inscrição
  const handleInscrever = async (e) => {
    e.preventDefault();
    setErro(null);
    setErro403(null);
    setComprovante(null);

    if (!eventoSelecionadoId) {
      setErro('Por favor, selecione um evento esportivo para realizar a inscrição.');
      return;
    }

    if (!atletaAtual) {
      setErro('Nenhum atleta válido selecionado para inscrição.');
      return;
    }

    setEnviando(true);

    try {
      // Se for treinador/admin, envia atletaId no corpo. Se for o próprio atleta, pode enviar ou omitir.
      const payload = {
        atletaId: atletaAtual.id
      };

      const response = await api.post(`/api/eventos/${eventoSelecionadoId}/inscrever`, payload);
      
      // Sucesso: armazena comprovante oficial
      setComprovante(response.data);

      // Recarrega lista de confirmados do evento
      carregarInscricoesDoEvento(eventoSelecionadoId);
    } catch (err) {
      console.error('Erro na inscrição:', err);
      if (err.response?.status === 403) {
        // Regra de Negócio 1: 403 Forbidden por anuidade pendente
        setErro403(
          err.response?.data?.mensagem || 
          `Inscrição negada: O atleta ${atletaAtual.nome} possui pendências na anuidade/pagamento. Regularize o status de pagamento junto à Federação para prosseguir.`
        );
      } else {
        const msg = err.response?.data?.mensagem || err.response?.data?.erro || 'Erro ao processar inscrição no torneio.';
        setErro(msg);
      }
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-12 text-center">
        <RefreshCw className="w-8 h-8 text-fmt-blue animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Carregando módulo oficial de inscrições...</p>
        <p className="text-xs text-slate-400 mt-1">Sincronizando torneios disponíveis e fichas cadastrais</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. COMPROVANTE OFICIAL DE INSCRIÇÃO (Renderizado após sucesso) */}
      {comprovante && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200 block">
                  Confirmação Oficial de Homologação
                </span>
                <h3 className="font-heading font-black text-xl text-white">
                  Inscrição Confirmada com Sucesso!
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 font-heading font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprovante</span>
              </button>
              <button
                type="button"
                onClick={() => setComprovante(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-800 text-white font-heading font-bold text-xs transition-all cursor-pointer"
              >
                <span>Fechar</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div className="flex items-center gap-4">
                <FmttemaLogo size="sm" />
                <div>
                  <h4 className="font-heading font-extrabold text-base text-fmt-blue">
                    Federação de Muaythai Tradicional do Estado do Maranhão
                  </h4>
                  <p className="text-xs text-slate-500">
                    Comprovante Digital de Participação em Competição Oficial &bull; Temporada 2026
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Protocolo de Registro</span>
                <span className="font-mono font-black text-base text-fmt-blue">
                  #INS-{String(comprovante.id).padStart(5, '0')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Torneio / Evento</span>
                <span className="font-heading font-bold text-sm text-slate-900 block mt-1">
                  {comprovante.eventoNome}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Atleta Inscrito</span>
                <span className="font-heading font-bold text-sm text-slate-900 block mt-1">
                  {comprovante.atletaNome}
                </span>
                <span className="text-xs text-slate-500">Peso: {comprovante.atletaPeso} kg</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Categoria Alocada</span>
                <span className="font-heading font-bold text-sm text-fmt-blue block mt-1">
                  {comprovante.categoriaPesoNome || 'Categoria Oficial'}
                </span>
                <span className="text-xs text-slate-500">Limite: Até {comprovante.categoriaPesoMaximo} kg</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Situação da Inscrição</span>
                <span className="inline-flex items-center gap-1 font-heading font-bold text-xs text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {comprovante.status || 'CONFIRMADA'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                O atleta foi incluído na listagem de participantes oficiais deste evento e será automaticamente considerado no sorteio do algoritmo de chaveamento e regra do Bye.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. FORMULÁRIO PRINCIPAL DE INSCRIÇÃO */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        
        {/* Banner do Formulário */}
        <div className="bg-gradient-to-r from-fmt-blue via-slate-900 to-fmt-blue px-6 py-6 sm:px-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Inscrição Oficial de Atletas
              </span>
              <h3 className="font-heading font-black text-2xl text-white tracking-tight">
                Habilitar Participação em Torneio
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Selecione o torneio oficial e valide a elegibilidade técnica e financeira para inclusão nas chaves.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Chancela FMTTEMA 2026</span>
            </div>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleInscrever} className="p-6 sm:p-8 space-y-6">
          
          {/* Alerta de Erro Genérico */}
          {erro && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-fmt-red shrink-0 mt-0.5" />
              <div>
                <strong className="block font-heading font-bold text-fmt-red">Atenção</strong>
                {erro}
              </div>
            </div>
          )}

          {/* Alerta de Anuidade Pendente (403 Forbidden - Convenção Obrigatória do Grupo) */}
          {erro403 && (
            <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-400 text-red-900 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-6 h-6 text-fmt-red shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <strong className="block font-heading font-black text-base text-fmt-red uppercase tracking-wide">
                  Inscrição Bloqueada - Pendência Financeira (US06)
                </strong>
                <p className="leading-relaxed">
                  {erro403}
                </p>
                <p className="text-xs text-red-700 font-medium pt-1">
                  👉 Para liberar a inscrição, o atleta ou responsável deve regularizar a taxa anual na tesouraria da federação (módulo <strong>Financeiro</strong>).
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Bloco Esquerdo: Escolha do Torneio */}
            <div className="space-y-4">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700">
                1. Selecione o Torneio Oficial *
              </label>

              <select
                value={eventoSelecionadoId}
                onChange={(e) => {
                  setEventoSelecionadoId(e.target.value);
                  setErro(null);
                  setErro403(null);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-fmt-blue transition-all"
              >
                {eventos.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.nome} ({ev.data}) - {ev.local}
                  </option>
                ))}
              </select>

              {/* Card com Detalhes do Evento Selecionado */}
              {eventoAtual && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-fmt-red" />
                    <span className="font-semibold text-slate-800">Data: {eventoAtual.data}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-fmt-blue">
                      {eventoAtual.status || 'AGENDADO'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-fmt-blue" />
                    <span>Local: {eventoAtual.local}</span>
                  </div>

                  {eventoAtual.descricao && (
                    <p className="text-slate-500 pt-1 border-t border-slate-200">
                      {eventoAtual.descricao}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bloco Direito: Escolha / Identificação do Atleta */}
            <div className="space-y-4">
              <label className="block text-xs font-heading font-bold uppercase tracking-wider text-slate-700">
                2. Atleta a Ser Inscrito *
              </label>

              {isAtleta ? (
                /* Se for o perfil ATLETA, seus dados são lidos diretamente */
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-fmt-blue text-white flex items-center justify-center font-heading font-black text-lg">
                      {meuPerfilAtleta?.nome ? meuPerfilAtleta.nome.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <span className="font-heading font-bold text-sm text-slate-900 block">
                        {meuPerfilAtleta?.nome || 'Atleta Autenticado'}
                        {meuPerfilAtleta?.apelido && (
                          <span className="text-amber-600 font-medium ml-1">
                            "{meuPerfilAtleta.apelido}"
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        CPF: {meuPerfilAtleta?.cpf} &bull; Peso: <strong>{meuPerfilAtleta?.peso || '--'} kg</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Se for Treinador ou Admin, dropdown com o plantel */
                <div className="space-y-2">
                  <select
                    value={atletaSelecionadoId}
                    onChange={(e) => {
                      setAtletaSelecionadoId(e.target.value);
                      setErro(null);
                      setErro403(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-fmt-blue transition-all"
                  >
                    {listaAtletas.map(atl => (
                      <option key={atl.id} value={atl.id}>
                        {atl.nome} ({atl.peso} kg) - {atl.academiaNome || 'FMTTEMA'} [{atl.statusPagamento || 'PENDENTE'}]
                      </option>
                    ))}
                  </select>

                  <p className="text-[11px] text-slate-500">
                    {isTreinador 
                      ? 'Exibindo exclusivamente atletas vinculados à sua academia.' 
                      : 'Administrador possui visão de todos os atletas federados.'}
                  </p>
                </div>
              )}

              {/* Status de Regularidade do Atleta Selecionado */}
              {atletaAtual && (
                <div className="p-4 rounded-xl border space-y-3 bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Situação da Anuidade Federativa:
                    </span>
                    {anuidadeRegularizada ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Regularizada (PAGO)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Pendente de Pagamento
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Peso Registrado</span>
                      <span className="font-heading font-extrabold text-slate-800">
                        {atletaAtual.peso ? `${atletaAtual.peso} kg` : 'Não informado'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Graduação (Kruang)</span>
                      <span className="font-heading font-extrabold text-slate-800">
                        {atletaAtual.kruang || atletaAtual.graduacao || 'Branco'}
                      </span>
                    </div>
                  </div>

                  {/* Alerta de bloqueio caso anuidade esteja pendente */}
                  {!anuidadeRegularizada && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-fmt-red shrink-0" />
                      <span>
                        Atleta inelegível para torneios até a comprovação da anuidade federativa 2026.
                      </span>
                    </div>
                  )}

                  {jaInscrito && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Este atleta já possui inscrição confirmada para este torneio.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Botão de Ação */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              * A categoria de peso é calculada e vinculada automaticamente com base no peso corporal homologado do atleta.
            </p>

            <button
              type="submit"
              disabled={enviando || jaInscrito || !anuidadeRegularizada || isFinalizado}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-heading font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                enviando || jaInscrito || !anuidadeRegularizada || isFinalizado
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-fmt-red to-fmt-red-hover hover:from-red-600 hover:to-red-700 text-white hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {enviando ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validando Elegibilidade...</span>
                </>
              ) : isFinalizado ? (
                <>
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <span>Inscrições Encerradas (Torneio Finalizado)</span>
                </>
              ) : jaInscrito ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Atleta Já Inscrito</span>
                </>
              ) : !anuidadeRegularizada ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span>Inscrição Bloqueada (Anuidade Pendente)</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>Confirmar Inscrição no Torneio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* 3. LISTAGEM DE INSCRIÇÕES CONFIRMADAS DO TORNEIO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-fmt-blue">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-base text-slate-900">
                Lutadores Inscritos no Torneio Selecionado
              </h4>
              <p className="text-xs text-slate-500">
                {eventoAtual?.nome || 'Torneio'} &bull; {inscricoesEvento.length} atletas confirmados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => carregarInscricoesDoEvento(eventoSelecionadoId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInscricoes ? 'animate-spin' : ''}`} />
            <span>Atualizar Lista</span>
          </button>
        </div>

        {loadingInscricoes ? (
          <div className="py-8 text-center text-xs text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-fmt-blue" />
            Carregando lista de inscritos...
          </div>
        ) : inscricoesEvento.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <Ticket className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Nenhum atleta inscrito neste torneio até o momento.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Utilize o formulário acima para realizar a primeira inscrição.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-heading font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Atleta</th>
                  <th className="py-3 px-4">Peso</th>
                  <th className="py-3 px-4">Categoria de Peso</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inscricoesEvento.map((ins) => {
                  const ehMeuPerfil = atletaAtual?.id && String(ins.atletaId) === String(atletaAtual.id);
                  return (
                    <tr 
                      key={ins.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        ehMeuPerfil ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{ins.atletaNome}</span>
                        {ehMeuPerfil && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                            Minha Inscrição
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {ins.atletaPeso ? `${ins.atletaPeso} kg` : '--'}
                      </td>
                      <td className="py-3.5 px-4 text-fmt-blue font-semibold">
                        {ins.categoriaPesoNome || 'Categoria Padrão'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          {ins.status || 'CONFIRMADA'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                        {ins.dataHoraInscricao 
                          ? new Date(ins.dataHoraInscricao).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Recentemente'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
