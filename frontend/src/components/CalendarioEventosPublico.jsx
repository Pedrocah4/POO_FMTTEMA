import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  Calendar,
  MapPin,
  Ticket,
  ExternalLink,
  Clock,
  RefreshCw,
  Award,
  Flame,
  ShieldCheck,
  Search,
  Ban
} from 'lucide-react';

function normalizarLinkExterno(url) {
  if (!url || !url.trim()) return null;
  const limpo = url.trim();
  if (limpo.startsWith('http://') || limpo.startsWith('https://')) {
    return limpo;
  }
  return `https://${limpo}`;
}

function formatarDataCompleta(dataIso) {
  if (!dataIso) return 'Data a definir';
  const partes = String(dataIso).split('-');
  if (partes.length === 3) {
    const dataObj = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
  return dataIso;
}

function extrairDiaMesCurto(dataIso) {
  if (!dataIso) return { dia: '--', mes: '---' };
  const partes = String(dataIso).split('-');
  if (partes.length === 3) {
    const dataObj = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = dataObj
      .toLocaleDateString('pt-BR', { month: 'short' })
      .replace('.', '')
      .toUpperCase();
    return { dia, mes };
  }
  return { dia: '--', mes: '---' };
}

export default function CalendarioEventosPublico() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS'); // TODOS | AGENDADO | EM_ANDAMENTO
  const [cartazesComErro, setCartazesComErro] = useState({});

  const carregarEventosAtivos = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const response = await api.get('/api/publico/eventos/ativos');
      setEventos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar calendário público de eventos:', err);
      setErro('Não foi possível carregar a agenda de eventos oficiais no momento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarEventosAtivos();
  }, [carregarEventosAtivos]);

  const eventosFiltrados = eventos.filter((ev) => {
    const termo = busca.trim().toLowerCase();
    const matchBusca =
      !termo ||
      (ev.nome || '').toLowerCase().includes(termo) ||
      (ev.local || '').toLowerCase().includes(termo) ||
      (ev.descricao || '').toLowerCase().includes(termo);

    const matchStatus =
      filtroStatus === 'TODOS' ? true : ev.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  return (
    <section
      id="calendario-eventos"
      aria-label="Calendário Oficial de Competições e Eventos FMTTEMA"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8 text-left"
    >
      {/* Cabeçalho da Seção de Eventos */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-fmt-red text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5 text-fmt-red" />
            <span>Circuito Oficial Maranhense • Temporada 2026</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-fmt-blue tracking-tight">
            Calendário de Eventos e Bilheteria Oficial
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Confira as próximas etapas do Campeonato Maranhense de Muaythai Tradicional, locais de competição e adquira seus ingressos oficiais.
          </p>
        </div>

        {/* Filtros Rápidos e Botão de Atualizar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar etapa ou ginásio..."
              className="w-48 sm:w-56 pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-fmt-blue"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-fmt-blue cursor-pointer"
          >
            <option value="TODOS">Todos os Ativos ({eventos.length})</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="AGENDADO">Próximos Agendados</option>
          </select>

          <button
            type="button"
            onClick={carregarEventosAtivos}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-fmt-blue' : ''}`} />
            <span>Atualizar Agenda</span>
          </button>
        </div>
      </div>

      {erro && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {erro}
        </div>
      )}

      {/* Grid de Cards Estilizados de Eventos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 animate-pulse h-96"
            />
          ))}
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Calendar className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Nenhum evento ativo encontrado com os filtros selecionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {eventosFiltrados.map((evento) => {
            const linkIngresso = normalizarLinkExterno(evento.urlIngresso);
            const isEmAndamento = evento.status === 'EM_ANDAMENTO';
            const { dia, mes } = extrairDiaMesCurto(evento.data);
            const erroCartaz = cartazesComErro[evento.id] || !evento.cartazUrl;

            return (
              <article
                key={evento.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:shadow-xl hover:border-fmt-blue/40 transition-all duration-300"
              >
                <div>
                  {/* Topo Visual: Cartaz do Evento + Badge de Data e Status */}
                  <div className="relative h-44 w-full bg-gradient-to-br from-fmt-blue via-slate-900 to-fmt-red overflow-hidden">
                    {!erroCartaz ? (
                      <img
                        src={evento.cartazUrl}
                        alt={`Cartaz oficial ${evento.nome}`}
                        onError={() =>
                          setCartazesComErro((prev) => ({ ...prev, [evento.id]: true }))
                        }
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white bg-gradient-to-br from-fmt-blue to-slate-900">
                        <ShieldCheck className="w-10 h-10 text-fmt-red mb-2 opacity-90" />
                        <span className="font-heading font-extrabold text-xs uppercase tracking-widest text-amber-400">
                          Circuito Oficial FMTTEMA
                        </span>
                        <span className="font-heading font-bold text-sm text-white mt-1 line-clamp-2">
                          {evento.nome}
                        </span>
                      </div>
                    )}

                    {/* Selo de Data (Canto Superior Esquerdo) */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs rounded-xl px-3 py-1.5 text-center shadow-md border border-slate-200/80">
                      <span className="block font-heading font-black text-base text-fmt-blue leading-none">
                        {dia}
                      </span>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-fmt-red mt-0.5">
                        {mes}
                      </span>
                    </div>

                    {/* Badge de Status (Canto Superior Direito) */}
                    <div className="absolute top-3 right-3">
                      {isEmAndamento ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-fmt-red text-white shadow-md">
                          <Flame className="w-3.5 h-3.5 animate-pulse" />
                          <span>Em Andamento</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-md">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Confirmado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Corpo do Card */}
                  <div className="p-5">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-fmt-blue group-hover:text-fmt-red transition-colors leading-snug line-clamp-2">
                      {evento.nome}
                    </h3>

                    <div className="mt-3 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-fmt-red shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {formatarDataCompleta(evento.data)}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-fmt-blue shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{evento.local}</span>
                      </div>
                    </div>

                    {evento.descricao && (
                      <p className="mt-3 text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {evento.descricao}
                      </p>
                    )}

                    {/* Categorias de Peso do Evento */}
                    {Array.isArray(evento.categorias) && evento.categorias.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>Categorias Confirmadas:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {evento.categorias.slice(0, 4).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold"
                            >
                              {cat}
                            </span>
                          ))}
                          {evento.categorias.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-fmt-blue text-[10px] font-bold">
                              +{evento.categorias.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé do Card: Botão "Comprar Ingresso" (Convenções Obrigatórias do Grupo) */}
                <div className="px-5 pb-5 pt-2">
                  {linkIngresso ? (
                    /* Convenção 1: Obrigatoriamente usar <a target="_blank"> para abrir em nova guia */
                    <a
                      href={linkIngresso}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-fmt-red hover:bg-fmt-red-hover text-white font-heading font-bold text-xs sm:text-sm shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      title={`Comprar ingresso para ${evento.nome} em nova guia`}
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Comprar Ingresso</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-90" />
                    </a>
                  ) : (
                    /* Convenção 2: Caso um evento não possua link de compra, o botão aparece desabilitado */
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
                      title="Este evento não possui venda de ingressos online habilitada"
                    >
                      <Ban className="w-4 h-4" />
                      <span>Ingresso Indisponível / Entrada Franca</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

