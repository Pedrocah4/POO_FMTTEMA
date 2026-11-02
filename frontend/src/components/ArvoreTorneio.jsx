import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Swords, 
  Award, 
  Calendar, 
  MapPin, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  ChevronRight,
  Flame,
  CheckCircle2,
  Scale,
  Crown,
  FileCheck2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getKruangColorStyle } from './PerfilCartelAtleta';
import ModalSumulaLuta from './ModalSumulaLuta';

export default function ArvoreTorneio({ eventoIdInicial = null }) {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState(eventoIdInicial);
  const [chaveamento, setChaveamento] = useState(null);
  const [confrontosBanco, setConfrontosBanco] = useState([]);
  const [categoriaAtivaId, setCategoriaAtivaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucessoMsg, setSucessoMsg] = useState(null);

  // Controle do Modal de Súmula Oficial
  const [confrontoParaSumula, setConfrontoParaSumula] = useState(null);
  const [modalSumulaAberto, setModalSumulaAberto] = useState(false);

  const perfil = user?.perfil || 'ADMIN';
  const isAdmin = perfil === 'ADMIN';
  const isArbitro = perfil === 'ARBITRO';
  const podeLancarSumula = isAdmin || isArbitro;

  // 1. Carrega lista de eventos
  useEffect(() => {
    const carregarEventos = async () => {
      try {
        const res = await api.get('/api/eventos');
        const lista = res.data || [];
        setEventos(lista);
        if (lista.length > 0) {
          const eventoEmAndamento = lista.find(e => e.nome?.toLowerCase().includes('maranhense'));
          const idInicial = eventoIdInicial || eventoEmAndamento?.id || lista[0].id;
          setEventoSelecionadoId(idInicial);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Erro ao buscar eventos:', err);
        setErro('Não foi possível carregar a lista de eventos.');
        setLoading(false);
      }
    };

    carregarEventos();
  }, [eventoIdInicial]);

  // 2. Carrega chaveamento e confrontos persistidos do evento selecionado
  const carregarDadosChaves = async (eventoId) => {
    if (!eventoId) return;
    setLoading(true);
    setErro(null);

    try {
      // Busca chaves e confrontos em paralelo
      const [resChaves, resConfrontos] = await Promise.allSettled([
        api.get(`/api/eventos/${eventoId}/chaves`),
        api.get(`/api/eventos/${eventoId}/confrontos`)
      ]);

      if (resChaves.status === 'fulfilled' && resChaves.value.data) {
        setChaveamento(resChaves.value.data);
        if (resChaves.value.data?.categorias?.length > 0) {
          setCategoriaAtivaId(prev => prev || resChaves.value.data.categorias[0].categoriaId);
        }
      } else {
        setChaveamento(null);
      }

      if (resConfrontos.status === 'fulfilled' && Array.isArray(resConfrontos.value.data)) {
        setConfrontosBanco(resConfrontos.value.data);
      } else {
        setConfrontosBanco([]);
      }
    } catch (err) {
      console.warn('Erro ao carregar dados das chaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventoSelecionadoId) {
      carregarDadosChaves(eventoSelecionadoId);
    }
  }, [eventoSelecionadoId]);

  // 3. Função para Gerar e Persistir Chaves no Banco (US07.1)
  const handleGerarChaves = async () => {
    if (!eventoSelecionadoId) return;
    setGerando(true);
    setErro(null);
    setSucessoMsg(null);

    try {
      // Persiste os confrontos diretamente no banco de dados
      const resPersistir = await api.post(`/api/eventos/${eventoSelecionadoId}/chaves/persistir`);
      setConfrontosBanco(resPersistir.data || []);

      // Atualiza também a visualização geral
      const resChaves = await api.get(`/api/eventos/${eventoSelecionadoId}/chaves`);
      setChaveamento(resChaves.data);

      if (resChaves.data?.categorias?.length > 0) {
        setCategoriaAtivaId(resChaves.data.categorias[0].categoriaId);
      }

      setSucessoMsg('Chaves oficiais persistidas com sucesso! Confrontos prontos para homologação de súmula.');
    } catch (err) {
      console.error('Erro ao gerar e persistir chaves:', err);
      // Fallback para geração simples em memória se persistir falhar
      try {
        const resFallback = await api.post(`/api/eventos/${eventoSelecionadoId}/chaves`);
        setChaveamento(resFallback.data);
        setSucessoMsg('Chaves de torneio geradas.');
      } catch (errFallback) {
        const msg = err.response?.data?.mensagem || 'Falha ao processar cruzamento de chaves.';
        setErro(msg);
      }
    } finally {
      setGerando(false);
    }
  };

  // 4. Abertura da Súmula Interativa
  const handleAbrirSumula = (confronto) => {
    setConfrontoParaSumula(confronto);
    setModalSumulaAberto(true);
  };

  // 5. Callback de sucesso da Súmula
  const handleSucessoSumula = (confrontoAtualizado) => {
    setSucessoMsg(`Resultado homologado com sucesso! Vencedor: ${confrontoAtualizado.vencedor?.nome} (${confrontoAtualizado.metodoVitoria}).`);
    // Recarrega todos os confrontos para exibir o avanço imediato na árvore
    carregarDadosChaves(eventoSelecionadoId);
  };

  const categoriaAtual = chaveamento?.categorias?.find(
    (c) => c.categoriaId === categoriaAtivaId
  ) || chaveamento?.categorias?.[0];

  // Filtra os confrontos persistidos da categoria ativa
  const confrontosCategoria = confrontosBanco.filter(c => 
    c.categoriaPesoId === categoriaAtual?.categoriaId || 
    (categoriaAtual?.categoriaNome && c.categoriaPesoNome === categoriaAtual.categoriaNome)
  );

  // Identifica lutas das Semifinais e Grande Final
  const semifinal1 = confrontosCategoria.find(c => c.numeroLuta === 1);
  const semifinal2 = confrontosCategoria.find(c => c.numeroLuta === 2);
  const confrontoFinal = confrontosCategoria.find(c => c.numeroLuta === 3 || c.fase?.toLowerCase().includes('final'));

  return (
    <div className="w-full space-y-6 text-left">
      
      {/* Barra Superior: Seletor de Evento + Ação de Gerar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 text-fmt-blue font-semibold text-xs uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Módulo Oficial de Chaveamento FMTTEMA</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-fmt-blue">
            Árvore do Torneio & Súmula de Lutas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chaveamento oficial das categorias de peso, avanço automático e súmula digital de resultados.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Dropdown de Eventos */}
          <div className="min-w-[240px]">
            <label htmlFor="select-evento" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Selecionar Torneio:
            </label>
            <select
              id="select-evento"
              value={eventoSelecionadoId || ''}
              onChange={(e) => setEventoSelecionadoId(Number(e.target.value))}
              disabled={loading || gerando}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
            >
              {eventos.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.nome} ({ev.data})
                </option>
              ))}
            </select>
          </div>

          {/* Botão Gerar Chaves (exclusivo para Administrador / Árbitro) */}
          {isAdmin && (
            <div className="sm:self-end">
              <button
                id="btn-gerar-chaves"
                type="button"
                onClick={handleGerarChaves}
                disabled={gerando || loading || !eventoSelecionadoId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-fmt-red hover:bg-fmt-red-hover active:scale-[0.98] text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {gerando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando e Persistindo...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Gerar / Persistir Chaves</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alertas de Sucesso ou Erro */}
      {sucessoMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{sucessoMsg}</span>
        </div>
      )}

      {erro && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-xs">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Aviso no Chaveamento:</strong>
            <span>{erro}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <RefreshCw className="w-8 h-8 text-fmt-blue animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Carregando chaveamento do torneio e súmulas...</p>
        </div>
      ) : !chaveamento || chaveamento.categorias?.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Swords className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-800 mb-1">
            Nenhuma Chave Gerada para Este Evento
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {isAdmin
              ? 'Certifique-se de que os atletas já foram inscritos e clique no botão abaixo para sortear e publicar as chaves da primeira rodada.'
              : 'O chaveamento oficial deste evento ainda não foi publicado pela comissão organizadora da FMTTEMA.'}
          </p>
          {isAdmin && (
            <button
              onClick={handleGerarChaves}
              disabled={gerando}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-fmt-blue hover:bg-fmt-blue-hover text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Gerar e Persistir Primeira Rodada Agora</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Abas das Categorias de Peso Disponíveis no Evento */}
          {chaveamento.categorias.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {chaveamento.categorias.map((cat) => {
                const ativo = cat.categoriaId === categoriaAtivaId;
                return (
                  <button
                    key={cat.categoriaId}
                    type="button"
                    onClick={() => setCategoriaAtivaId(cat.categoriaId)}
                    className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                      ativo
                        ? 'bg-fmt-blue text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.categoriaNome}</span>
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${ativo ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {cat.totalInscritos} lutadores
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Destaque da Categoria Atual Selecionada */}
          {categoriaAtual && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
              
              {/* Header da Categoria */}
              <div className="bg-gradient-to-r from-fmt-blue to-slate-900 px-6 py-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/15">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                        Disputa Oficial
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-fmt-red text-white text-[10px] font-bold">
                        {categoriaAtual.tipoChave}
                      </span>
                    </div>
                    <h3 className="font-heading font-extrabold text-xl text-white mt-0.5">
                      {categoriaAtual.categoriaNome} {categoriaAtual.pesoMaximo ? `(Até ${categoriaAtual.pesoMaximo} kg)` : ''}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <span>Total de Inscritos: <strong className="text-white">{categoriaAtual.totalInscritos}</strong></span>
                  <span>•</span>
                  <span>Lutas da Rodada: <strong className="text-white">{categoriaAtual.lutas?.length || 0}</strong></span>
                </div>
              </div>

              {/* CARD DA REGRA DO BYE (SE HOUVER NÚMERO ÍMPAR) */}
              {categoriaAtual.temBye && categoriaAtual.atletaBye && (
                <div className="p-6 bg-amber-50/70 border-b border-amber-200/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border-2 border-amber-300 shadow-sm">
                    
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-heading font-black text-xl flex items-center justify-center shrink-0 shadow">
                        ★
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold uppercase tracking-wide">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Regra do Bye Aplicada
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Cabeça de Chave #1</span>
                        </div>
                        <h4 className="font-heading font-black text-lg text-slate-800 mt-0.5">
                          {categoriaAtual.atletaBye.nome}
                          {categoriaAtual.atletaBye.apelido && (
                            <span className="text-amber-600 font-semibold text-sm ml-1.5">
                              "{categoriaAtual.atletaBye.apelido}"
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {categoriaAtual.mensagemBye}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Cartel Oficial</span>
                        <span className="text-xs font-mono font-bold text-emerald-700">
                          {categoriaAtual.atletaBye.vitorias}W - {categoriaAtual.atletaBye.derrotas || 0}L
                        </span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg border text-xs font-heading font-bold uppercase tracking-wider ${getKruangColorStyle(categoriaAtual.atletaBye.graduacao)}`}>
                        {categoriaAtual.atletaBye.graduacao || 'Kruang'}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* FLUXOGRAMA VISUAL DA ÁRVORE DO TORNEIO (GRID / FLEXBOX DO TAILWIND) */}
              <div className="p-6 sm:p-8 bg-slate-50/50 overflow-x-auto">
                <div className="min-w-[850px]">
                  
                  {/* Títulos das Fases da Árvore */}
                  <div className="grid grid-cols-3 gap-6 mb-6 text-center font-heading font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-3">
                    <div className="flex items-center justify-center gap-1.5 text-fmt-blue">
                      <span>1. Primeira Rodada / Semifinais</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-slate-700">
                      <span>2. Classificados & Vencedores</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-fmt-red">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>3. Grande Final FMTTEMA</span>
                    </div>
                  </div>

                  {/* Corpo da Árvore: Colunas com Alinhamento Flexbox e Grid do Tailwind */}
                  <div className="grid grid-cols-3 gap-6 items-stretch">
                    
                    {/* COLUNA 1: Lutas da Primeira Rodada / Semifinais */}
                    <div className="space-y-6">
                      {categoriaAtual.lutas && categoriaAtual.lutas.length > 0 ? (
                        categoriaAtual.lutas.map((luta, idx) => {
                          // Verifica se existe confronto persistido correspondente
                          const confrontoPersistido = confrontosCategoria.find(
                            c => c.numeroLuta === luta.numeroLuta
                          );

                          const isFinalizada = confrontoPersistido?.status === 'FINALIZADA';
                          const vencedorId = confrontoPersistido?.vencedor?.id;
                          const metodoVitoria = confrontoPersistido?.metodoVitoria;

                          const vermelhoEhVencedor = isFinalizada && vencedorId === luta.cornerVermelho?.id;
                          const azulEhVencedor = isFinalizada && vencedorId === luta.cornerAzul?.id;

                          return (
                            <div 
                              key={luta.numeroLuta || idx}
                              className={`bg-white rounded-xl border shadow-sm transition-all p-4 relative ${
                                isFinalizada 
                                  ? 'border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/20' 
                                  : 'border-slate-200 hover:shadow-md'
                              }`}
                            >
                              {/* Identificação da Luta e Status */}
                              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 text-[11px]">
                                <span className="font-heading font-bold text-fmt-blue">
                                  Combate #{luta.numeroLuta}
                                </span>
                                
                                {isFinalizada ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    Finalizada
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase">
                                    {luta.fase || 'Eliminatória'}
                                  </span>
                                )}
                              </div>

                              {/* Corner Vermelho (Lutador 1) */}
                              <div className={`flex items-center justify-between p-2 rounded-lg border mb-2 transition-all ${
                                vermelhoEhVencedor
                                  ? 'bg-emerald-50 border-emerald-400 font-bold shadow-xs'
                                  : isFinalizada
                                  ? 'bg-slate-50 border-slate-200 opacity-60'
                                  : 'bg-red-50/60 border-red-200/80'
                              }`}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center ${
                                    vermelhoEhVencedor ? 'bg-emerald-500 text-white' : 'bg-fmt-red'
                                  }`} title="Corner Vermelho">
                                    {vermelhoEhVencedor && <CheckCircle2 className="w-3 h-3" />}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-heading font-bold text-xs text-slate-900 block truncate flex items-center gap-1">
                                      <span>{luta.cornerVermelho?.nome || 'Atleta A'}</span>
                                      {vermelhoEhVencedor && (
                                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 inline" />
                                      )}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block truncate">
                                      {luta.cornerVermelho?.academia || 'Academia Filiada'}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-emerald-700 shrink-0 ml-2">
                                  {luta.cornerVermelho?.vitorias || 0}W
                                </span>
                              </div>

                              {/* Divisor VS */}
                              <div className="text-center my-1 flex items-center justify-center gap-2">
                                <span className="text-[10px] font-heading font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                                  VS
                                </span>
                              </div>

                              {/* Corner Azul (Lutador 2) */}
                              <div className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                                azulEhVencedor
                                  ? 'bg-emerald-50 border-emerald-400 font-bold shadow-xs'
                                  : isFinalizada
                                  ? 'bg-slate-50 border-slate-200 opacity-60'
                                  : 'bg-blue-50/60 border-blue-200/80'
                              }`}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center ${
                                    azulEhVencedor ? 'bg-emerald-500 text-white' : 'bg-blue-600'
                                  }`} title="Corner Azul">
                                    {azulEhVencedor && <CheckCircle2 className="w-3 h-3" />}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-heading font-bold text-xs text-slate-900 block truncate flex items-center gap-1">
                                      <span>{luta.cornerAzul?.nome || 'Atleta B'}</span>
                                      {azulEhVencedor && (
                                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 inline" />
                                      )}
                                    </span>
                                    <span className="text-[10px] text-slate-500 block truncate">
                                      {luta.cornerAzul?.academia || 'Academia Filiada'}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-emerald-700 shrink-0 ml-2">
                                  {luta.cornerAzul?.vitorias || 0}W
                                </span>
                              </div>

                              {/* Exibição do Método ou Botão de Súmula */}
                              {isFinalizada ? (
                                <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
                                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Vitória Homologada</span>
                                  <span className="text-xs font-heading font-bold text-emerald-700">
                                    {confrontoPersistido?.vencedor?.nome} por {metodoVitoria}
                                  </span>
                                </div>
                              ) : (
                                podeLancarSumula && confrontoPersistido && (
                                  <div className="mt-3 pt-2 border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => handleAbrirSumula(confrontoPersistido)}
                                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-fmt-blue hover:bg-fmt-blue-hover text-white text-[11px] font-heading font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                                    >
                                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Lançar Súmula da Luta</span>
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                          Sem lutas adicionais na primeira rodada
                        </div>
                      )}
                    </div>

                    {/* COLUNA 2: Semifinais e Vencedores em Avanço */}
                    <div className="space-y-6 flex flex-col justify-around">
                      
                      {/* Vaga Semifinal 1 (ou Vencedor da Luta 1 / Bye) */}
                      <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-4 shadow-sm relative">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Vaga Semifinal 1 / Cabeça de Chave
                        </div>
                        {categoriaAtual.temBye && categoriaAtual.atletaBye ? (
                          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold text-amber-700 uppercase block">Classificado via Bye</span>
                              <span className="font-heading font-bold text-xs text-slate-900">{categoriaAtual.atletaBye.nome}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-700">{categoriaAtual.atletaBye.vitorias}W</span>
                          </div>
                        ) : semifinal1?.vencedor ? (
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Classificado (Combate #1)</span>
                              <span className="font-heading font-bold text-xs text-slate-900">{semifinal1.vencedor.nome}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-700">{semifinal1.vencedor.vitorias}W</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-500 text-xs italic text-center">
                            Vencedor do Combate #1
                          </div>
                        )}
                        <div className="text-center my-1 text-[10px] font-black text-slate-300">VS</div>
                        
                        {semifinal2?.vencedor ? (
                          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold text-emerald-700 uppercase block">Classificado (Combate #2)</span>
                              <span className="font-heading font-bold text-xs text-slate-900">{semifinal2.vencedor.nome}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-700">{semifinal2.vencedor.vitorias}W</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-500 text-xs italic text-center">
                            Vencedor do Combate #2
                          </div>
                        )}
                      </div>

                      {/* Card de Status Regulamentar de Avanço */}
                      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-left space-y-1">
                        <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-fmt-blue flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-fmt-blue" />
                          Avanço Regulamentar na Chave
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Ao lançar a súmula com o vencedor, o lutador é promovido instantaneamente para a Grande Final Estadual.
                        </p>
                      </div>

                    </div>

                    {/* COLUNA 3: Grande Final FMTTEMA (Disputa de Título) */}
                    <div className="flex flex-col justify-center">
                      <div className="bg-gradient-to-b from-white to-amber-50/40 rounded-2xl border-2 border-amber-400 shadow-lg p-5 text-center relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-heading font-extrabold uppercase tracking-wide mb-3">
                          <Trophy className="w-3.5 h-3.5 text-amber-600" />
                          <span>Decisão do Cinturão</span>
                        </div>

                        <h4 className="font-heading font-black text-base text-slate-900 mb-4">
                          Grande Final Estadual
                        </h4>

                        <div className="space-y-3 text-left">
                          
                          {/* Finalista 1 */}
                          <div className={`p-3 rounded-xl border text-xs transition-all ${
                            confrontoFinal?.vencedor && confrontoFinal.vencedor.id === confrontoFinal.atletaVermelho?.id
                              ? 'bg-emerald-50 border-emerald-400 font-bold shadow-xs'
                              : confrontoFinal?.atletaVermelho
                              ? 'bg-red-50/70 border-red-200 text-slate-900'
                              : 'bg-white border-slate-200 text-slate-400 italic'
                          }`}>
                            <span className="text-[9px] uppercase font-bold text-fmt-red block">Corner Vermelho</span>
                            <span className="font-heading font-bold text-xs block">
                              {confrontoFinal?.atletaVermelho?.nome || 'Finalista Semifinal 1 (Aguardando)'}
                            </span>
                          </div>

                          <div className="font-heading font-black text-xs text-amber-600 uppercase text-center">
                            Disputa do Ouro
                          </div>

                          {/* Finalista 2 */}
                          <div className={`p-3 rounded-xl border text-xs transition-all ${
                            confrontoFinal?.vencedor && confrontoFinal.vencedor.id === confrontoFinal.atletaAzul?.id
                              ? 'bg-emerald-50 border-emerald-400 font-bold shadow-xs'
                              : confrontoFinal?.atletaAzul
                              ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                              : 'bg-white border-slate-200 text-slate-400 italic'
                          }`}>
                            <span className="text-[9px] uppercase font-bold text-blue-600 block">Corner Azul</span>
                            <span className="font-heading font-bold text-xs block">
                              {confrontoFinal?.atletaAzul?.nome || 'Finalista Semifinal 2 (Aguardando)'}
                            </span>
                          </div>

                          {/* Botão de Súmula da Final se ambos os finalistas estiverem definidos */}
                          {confrontoFinal?.status === 'FINALIZADA' ? (
                            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-center shadow-md animate-in zoom-in-95">
                              <Crown className="w-6 h-6 mx-auto mb-1 text-yellow-200" />
                              <span className="text-[10px] uppercase font-extrabold tracking-wider block text-yellow-100">
                                Campeão Estadual Consagrado
                              </span>
                              <span className="font-heading font-black text-sm block mt-0.5">
                                {confrontoFinal.vencedor?.nome}
                              </span>
                              <span className="text-[10px] text-yellow-100 block mt-0.5">
                                Método: {confrontoFinal.metodoVitoria}
                              </span>
                            </div>
                          ) : (
                            podeLancarSumula && confrontoFinal?.atletaVermelho && confrontoFinal?.atletaAzul && (
                              <button
                                type="button"
                                onClick={() => handleAbrirSumula(confrontoFinal)}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-fmt-red to-fmt-red-hover hover:from-red-600 hover:to-red-700 text-white text-xs font-heading font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                              >
                                <Scale className="w-4 h-4 text-amber-300" />
                                <span>Lançar Súmula da Final</span>
                              </button>
                            )
                          )}

                        </div>

                        <div className="mt-5 pt-4 border-t border-amber-200 text-[11px] text-slate-500 font-medium">
                          Chancela Oficial FMTTEMA 2026
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Modal Interativo de Súmula Oficial */}
      <ModalSumulaLuta
        confronto={confrontoParaSumula}
        isOpen={modalSumulaAberto}
        onClose={() => setModalSumulaAberto(false)}
        onSuccess={handleSucessoSumula}
      />

    </div>
  );
}
