import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Flame,
  Percent,
  Filter,
  Search,
  RefreshCw,
  ShieldCheck,
  Swords,
  Building2,
  Info
} from 'lucide-react';

export default function TabelaRankingEstadual() {
  const [rankingVolume, setRankingVolume] = useState([]);
  const [rankingEficiencia, setRankingEficiencia] = useState([]);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState([]);
  const [minimoLutas, setMinimoLutas] = useState(3);

  // Aba ativa: 'VOLUME' ("Maior Número de Vitórias") | 'EFICIENCIA' ("Melhor Aproveitamento")
  const [abaAtiva, setAbaAtiva] = useState('VOLUME');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('TODAS');
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregarRankingPublico = useCallback(async (categoriaFiltro = 'TODAS', silencioso = false) => {
    try {
      if (!silencioso) setLoading(true);
      setErro(null);

      const params =
        categoriaFiltro && categoriaFiltro !== 'TODAS'
          ? { categoria: categoriaFiltro }
          : {};

      const response = await api.get('/api/publico/ranking', { params });
      const data = response.data || {};

      setRankingVolume(Array.isArray(data.rankingVolume) ? data.rankingVolume : []);
      setRankingEficiencia(Array.isArray(data.rankingEficiencia) ? data.rankingEficiencia : []);

      if (Array.isArray(data.categoriasDisponiveis) && data.categoriasDisponiveis.length > 0) {
        setCategoriasDisponiveis(data.categoriasDisponiveis);
      }
      if (data.minimoLutasEficiencia) {
        setMinimoLutas(data.minimoLutasEficiencia);
      }
    } catch (err) {
      console.error('Erro ao carregar ranking público estadual:', err);
      setErro('Não foi possível carregar os dados atualizados do Ranking Estadual.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarRankingPublico('TODAS');
  }, [carregarRankingPublico]);

  const handleTrocarCategoria = (novaCategoria) => {
    setCategoriaSelecionada(novaCategoria);
    carregarRankingPublico(novaCategoria, true);
  };

  // Lista base instantânea conforme a aba selecionada ("Maior Número de Vitórias" vs "Melhor Aproveitamento")
  const listaBase = abaAtiva === 'VOLUME' ? rankingVolume : rankingEficiencia;

  // Filtragem instantânea por categoria e termo de busca, recalculando a posição (1º, 2º, 3º...)
  const rankingExibido = useMemo(() => {
    const filtrados = listaBase.filter((atleta) => {
      const matchCategoria =
        categoriaSelecionada === 'TODAS' ||
        (atleta.categoria || '').toLowerCase() === categoriaSelecionada.toLowerCase();

      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        (atleta.nome || '').toLowerCase().includes(termo) ||
        (atleta.apelido || '').toLowerCase().includes(termo) ||
        (atleta.academiaNome || '').toLowerCase().includes(termo);

      return matchCategoria && matchBusca;
    });

    return filtrados.map((item, idx) => ({
      ...item,
      posicaoExibida: idx + 1
    }));
  }, [listaBase, categoriaSelecionada, busca]);

  const top3 = rankingExibido.slice(0, 3);

  /**
   * Convenção Obrigatória do Grupo:
   * Destacar visualmente o Top 3 (com cores Ouro, Prata, Bronze e ícones de medalha/cinturão) usando Tailwind.
   */
  const getEstiloTop3 = (posicao) => {
    if (posicao === 1) {
      return {
        rowClass:
          'bg-gradient-to-r from-amber-50/95 via-yellow-50/70 to-white hover:from-amber-100/80 border-l-4 border-l-amber-400',
        badgeClass:
          'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 border border-amber-300 shadow-xs',
        cardClass:
          'bg-gradient-to-b from-amber-50 via-white to-amber-50/40 border-2 border-amber-400 shadow-md ring-2 ring-amber-300/40',
        pillClass: 'bg-amber-400/20 text-amber-900 border-amber-400/50',
        rotulo: '1º Lugar • Ouro (Líder)',
        Icone: Crown,
        iconeColor: 'text-amber-500'
      };
    }
    if (posicao === 2) {
      return {
        rowClass:
          'bg-gradient-to-r from-slate-100/95 via-slate-50/70 to-white hover:from-slate-200/70 border-l-4 border-l-slate-400',
        badgeClass:
          'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 border border-slate-300 shadow-xs',
        cardClass:
          'bg-gradient-to-b from-slate-100 via-white to-slate-50/50 border-2 border-slate-300 shadow-sm',
        pillClass: 'bg-slate-200 text-slate-800 border-slate-300',
        rotulo: '2º Lugar • Prata',
        Icone: Medal,
        iconeColor: 'text-slate-500'
      };
    }
    if (posicao === 3) {
      return {
        rowClass:
          'bg-gradient-to-r from-orange-50/90 via-amber-50/40 to-white hover:from-orange-100/70 border-l-4 border-l-amber-600',
        badgeClass:
          'bg-gradient-to-br from-amber-600 to-orange-700 text-white border border-amber-600 shadow-xs',
        cardClass:
          'bg-gradient-to-b from-orange-50/80 via-white to-orange-50/30 border-2 border-amber-600/60 shadow-sm',
        pillClass: 'bg-orange-100 text-orange-900 border-orange-300',
        rotulo: '3º Lugar • Bronze',
        Icone: Award,
        iconeColor: 'text-amber-700'
      };
    }
    return {
      rowClass: 'bg-white hover:bg-slate-50/80',
      badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
      cardClass: 'bg-white border border-slate-200',
      pillClass: 'bg-slate-100 text-slate-600 border-slate-200',
      rotulo: `${posicao}º Colocado`,
      Icone: Trophy,
      iconeColor: 'text-slate-400'
    };
  };

  const formatarPercentual = (valor) => {
    const num = Number(valor || 0);
    return `${num.toFixed(1).replace('.0', '')}%`;
  };

  return (
    <section
      id="vitrine-ranking-estadual"
      aria-label="Ranking Estadual Oficial FMTTEMA"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8 text-left"
    >
      {/* Cabeçalho Institucional do Ranking */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Vitrine Esportiva Pública • Temporada 2026</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-fmt-blue tracking-tight">
            Ranking Estadual Oficial de Lutadores (US12)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Classificação oficial da Federação de Muaythai Tradicional do Maranhão processada diretamente em SQL por volume de vitórias e eficiência de aproveitamento.
          </p>
        </div>

        {/* Botão de Atualização */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => carregarRankingPublico(categoriaSelecionada)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-fmt-blue' : ''}`} />
            <span>Atualizar Ranking</span>
          </button>
        </div>
      </div>

      {/* Barra de Controle: Abas (Tabs) + Seletor (Dropdown) de Categoria de Peso + Busca */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        {/* Abas (Tabs) para alternar entre "Maior Número de Vitórias" e "Melhor Aproveitamento" */}
        <div
          role="tablist"
          aria-label="Critério de Classificação do Ranking"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200"
        >
          <button
            id="tab-ranking-volume"
            role="tab"
            type="button"
            aria-selected={abaAtiva === 'VOLUME'}
            onClick={() => setAbaAtiva('VOLUME')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              abaAtiva === 'VOLUME'
                ? 'bg-fmt-blue text-white shadow-sm'
                : 'text-slate-600 hover:text-fmt-blue hover:bg-white/60'
            }`}
          >
            <Flame className={`w-4 h-4 ${abaAtiva === 'VOLUME' ? 'text-amber-400' : 'text-fmt-red'}`} />
            <span>Maior Número de Vitórias</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                abaAtiva === 'VOLUME'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {rankingVolume.length}
            </span>
          </button>

          <button
            id="tab-ranking-eficiencia"
            role="tab"
            type="button"
            aria-selected={abaAtiva === 'EFICIENCIA'}
            onClick={() => setAbaAtiva('EFICIENCIA')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              abaAtiva === 'EFICIENCIA'
                ? 'bg-fmt-blue text-white shadow-sm'
                : 'text-slate-600 hover:text-fmt-blue hover:bg-white/60'
            }`}
          >
            <Percent className={`w-4 h-4 ${abaAtiva === 'EFICIENCIA' ? 'text-emerald-300' : 'text-emerald-600'}`} />
            <span>Melhor Aproveitamento</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                abaAtiva === 'EFICIENCIA'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {rankingEficiencia.length}
            </span>
          </button>
        </div>

        {/* Filtros: Seletor (Dropdown) por Categoria de Peso + Busca por Nome */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Dropdown de Categoria de Peso */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-fmt-blue shrink-0" />
            <label
              htmlFor="select-categoria-ranking"
              className="text-xs font-bold text-slate-600 whitespace-nowrap"
            >
              Categoria:
            </label>
            <select
              id="select-categoria-ranking"
              value={categoriaSelecionada}
              onChange={(e) => handleTrocarCategoria(e.target.value)}
              className="bg-transparent text-xs font-bold text-fmt-blue focus:outline-none cursor-pointer pr-2 py-1"
            >
              <option value="TODAS">Todas as Categorias de Peso</option>
              {categoriasDisponiveis.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar atleta ou academia..."
              className="w-full sm:w-56 pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-fmt-blue"
            />
          </div>
        </div>
      </div>

      {/* Faixa Explicativa do Critério Ativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-fmt-blue shrink-0" />
          {abaAtiva === 'VOLUME' ? (
            <span>
              <strong>Visão ativa: Maior Número de Vitórias</strong> — Ordenação pelo total absoluto de vitórias homologadas (desempate por aproveitamento e menor número de derrotas).
            </span>
          ) : (
            <span>
              <strong>Visão ativa: Melhor Aproveitamento (%)</strong> — Fórmula matemática calculada no banco de dados filtrando atletas com <strong>mínimo de {minimoLutas} lutas oficiais</strong>.
            </span>
          )}
        </div>
        {categoriaSelecionada !== 'TODAS' && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-fmt-blue text-white text-[11px] font-bold shrink-0">
            <span>Filtro: {categoriaSelecionada}</span>
            <button
              type="button"
              onClick={() => handleTrocarCategoria('TODAS')}
              className="hover:text-amber-300 ml-1 cursor-pointer"
              title="Limpar filtro de categoria"
            >
              &times;
            </button>
          </span>
        )}
      </div>

      {erro && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-fmt-blue" />
          <span className="text-xs font-medium">Consultando ranking estadual oficial...</span>
        </div>
      ) : rankingExibido.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Trophy className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <p className="text-xs sm:text-sm font-bold text-slate-600">
            Nenhum atleta encontrado para os filtros selecionados.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Altere a categoria de peso no seletor acima ou limpe a busca para visualizar todo o ranking.
          </p>
        </div>
      ) : (
        <>
          {/* Pódio Visual Top 3 (Ouro, Prata e Bronze) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {top3.map((atleta) => {
              const estilo = getEstiloTop3(atleta.posicaoExibida);
              const IconeMedalha = estilo.Icone;

              return (
                <div
                  key={`podio-${abaAtiva}-${atleta.atletaId}`}
                  className={`rounded-xl p-4 transition-all flex flex-col justify-between ${estilo.cardClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${estilo.pillClass}`}
                      >
                        <IconeMedalha className={`w-3.5 h-3.5 ${estilo.iconeColor}`} />
                        <span>{estilo.rotulo}</span>
                      </span>

                      <span className="text-[11px] font-bold text-fmt-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {atleta.categoria}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-heading font-black text-base shrink-0 ${estilo.badgeClass}`}
                      >
                        {atleta.posicaoExibida}º
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 truncate">
                          {atleta.nome}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          {atleta.apelido ? `"${atleta.apelido}" • ` : ''}
                          {atleta.academiaNome}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Cartel Oficial
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {atleta.vitorias}V - {atleta.derrotas}D - {atleta.empates}E{' '}
                        <span className="text-slate-400 font-normal">({atleta.totalLutas} lutas)</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        {abaAtiva === 'VOLUME' ? 'Total Vitórias' : 'Aproveitamento'}
                      </span>
                      <span className="font-heading font-black text-base text-fmt-blue">
                        {abaAtiva === 'VOLUME'
                          ? `${atleta.vitorias} Vitórias`
                          : formatarPercentual(atleta.percentualAproveitamento)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabela Dinâmica Completa de Ranking */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-fmt-blue text-white uppercase font-heading font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-24">Posição</th>
                  <th className="px-4 py-3.5">Atleta / Apelido</th>
                  <th className="px-4 py-3.5">Academia / CT</th>
                  <th className="px-4 py-3.5">Categoria de Peso</th>
                  <th className="px-4 py-3.5">Graduação (Kruang)</th>
                  <th className="px-4 py-3.5 text-center">Cartel (V-D-E)</th>
                  <th className="px-4 py-3.5 text-center">Vitórias</th>
                  <th className="px-4 py-3.5 text-right">Aproveitamento (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rankingExibido.map((atleta) => {
                  const pos = atleta.posicaoExibida;
                  const isTop3 = pos <= 3;
                  const estilo = getEstiloTop3(pos);
                  const IconePosicao = estilo.Icone;

                  return (
                    <tr
                      key={`${abaAtiva}-${atleta.atletaId}`}
                      className={`transition-colors ${estilo.rowClass}`}
                    >
                      {/* Coluna 1: Posição com Destaque Ouro, Prata, Bronze */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center font-heading font-black text-xs ${estilo.badgeClass}`}
                          >
                            {pos}º
                          </span>
                          {isTop3 && (
                            <span
                              title={estilo.rotulo}
                              className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider"
                            >
                              <IconePosicao className={`w-4 h-4 ${estilo.iconeColor}`} />
                              <span className="hidden sm:inline text-slate-700">
                                {pos === 1 ? 'Ouro' : pos === 2 ? 'Prata' : 'Bronze'}
                              </span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Coluna 2: Nome e Apelido */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-heading font-bold text-slate-900 text-xs sm:text-sm block leading-tight">
                              {atleta.nome}
                            </span>
                            {atleta.apelido && (
                              <span className="text-[11px] font-semibold text-fmt-red">
                                &ldquo;{atleta.apelido}&rdquo;
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Coluna 3: Academia */}
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{atleta.academiaNome}</span>
                        </div>
                      </td>

                      {/* Coluna 4: Categoria de Peso */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-fmt-blue border border-blue-200">
                          {atleta.categoria}
                        </span>
                      </td>

                      {/* Coluna 5: Graduação */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {atleta.graduacao}
                        </span>
                      </td>

                      {/* Coluna 6: Cartel */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap font-mono">
                        <span className="font-bold text-emerald-700">{atleta.vitorias}V</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="font-bold text-rose-600">{atleta.derrotas}D</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="font-semibold text-slate-600">{atleta.empates}E</span>
                        <span className="block text-[10px] text-slate-400">
                          {atleta.totalLutas} lutas
                        </span>
                      </td>

                      {/* Coluna 7: Total de Vitórias */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-heading font-extrabold text-xs ${
                            abaAtiva === 'VOLUME'
                              ? 'bg-fmt-blue text-white shadow-xs'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <Swords className="w-3.5 h-3.5" />
                          <span>{atleta.vitorias}</span>
                        </span>
                      </td>

                      {/* Coluna 8: Percentual de Aproveitamento */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex flex-col items-end">
                          <span
                            className={`font-heading font-extrabold text-xs sm:text-sm px-2.5 py-0.5 rounded-lg ${
                              abaAtiva === 'EFICIENCIA'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {formatarPercentual(atleta.percentualAproveitamento)}
                          </span>
                          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(0, Number(atleta.percentualAproveitamento || 0))
                                )}%`
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

