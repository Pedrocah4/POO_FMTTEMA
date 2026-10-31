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
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getKruangColorStyle } from './PerfilCartelAtleta';

export default function ArvoreTorneio({ eventoIdInicial = null }) {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState(eventoIdInicial);
  const [chaveamento, setChaveamento] = useState(null);
  const [categoriaAtivaId, setCategoriaAtivaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucessoMsg, setSucessoMsg] = useState(null);

  const isAdmin = user?.perfil === 'ADMIN';

  // Carrega lista de eventos
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

  // Carrega chaveamento quando o evento muda
  useEffect(() => {
    if (!eventoSelecionadoId) return;

    const carregarChaveamento = async () => {
      setLoading(true);
      setErro(null);
      setSucessoMsg(null);
      try {
        const res = await api.get(`/api/eventos/${eventoSelecionadoId}/chaves`);
        setChaveamento(res.data);
        if (res.data?.categorias?.length > 0) {
          setCategoriaAtivaId(res.data.categorias[0].categoriaId);
        } else {
          setCategoriaAtivaId(null);
        }
      } catch (err) {
        // Se ainda não foi gerado ou erro
        console.warn('Chaves ainda não geradas ou erro:', err);
        setChaveamento(null);
      } finally {
        setLoading(false);
      }
    };

    carregarChaveamento();
  }, [eventoSelecionadoId]);

  // Função para Gerar / Regenerar Chaves
  const handleGerarChaves = async () => {
    if (!eventoSelecionadoId) return;
    setGerando(true);
    setErro(null);
    setSucessoMsg(null);

    try {
      const res = await api.post(`/api/eventos/${eventoSelecionadoId}/chaves`);
      setChaveamento(res.data);
      if (res.data?.categorias?.length > 0) {
        setCategoriaAtivaId(res.data.categorias[0].categoriaId);
      }
      setSucessoMsg('Chaves de torneio geradas com sucesso via algoritmo de ranking e regra do Bye!');
    } catch (err) {
      console.error('Erro ao gerar chaves:', err);
      const msg = err.response?.data?.mensagem || 'Falha ao processar cruzamento de chaves.';
      setErro(msg);
    } finally {
      setGerando(false);
    }
  };

  const categoriaAtual = chaveamento?.categorias?.find(
    (c) => c.categoriaId === categoriaAtivaId
  ) || chaveamento?.categorias?.[0];

  return (
    <div className="w-full space-y-6 text-left">
      
      {/* Barra Superior: Seletor de Evento + Ação de Gerar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 text-fmt-blue font-semibold text-xs uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>Módulo Oficial de Chaveamento FMTTEMA</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-fmt-blue">
            Árvore do Torneio & Cruzamentos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chaveamento oficial das categorias de peso e cruzamentos das rodadas eliminatórias.
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

          {/* Botão Gerar Chaves (exclusivo para Administrador) */}
          {isAdmin && (
            <div className="sm:self-end">
              <button
                id="btn-gerar-chaves"
                type="button"
                onClick={handleGerarChaves}
                disabled={gerando || loading || !eventoSelecionadoId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-fmt-red hover:bg-fmt-red-hover active:scale-[0.98] text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {gerando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <Swords className="w-4 h-4" />
                    <span>Gerar / Atualizar Chaves</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alertas de Sucesso ou Erro */}
      {sucessoMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
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
          <p className="text-sm text-slate-600 font-medium">Carregando chaveamento do torneio...</p>
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-fmt-blue hover:bg-fmt-blue-hover text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Gerar Primeira Rodada Agora</span>
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
                    <Award className="w-5 h-5 text-yellow-400" />
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
                <div className="min-w-[800px]">
                  
                  {/* Títulos das Fases da Árvore */}
                  <div className="grid grid-cols-3 gap-6 mb-6 text-center font-heading font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-3">
                    <div className="flex items-center justify-center gap-1.5 text-fmt-blue">
                      <span>1. Primeira Rodada / Eliminatórias</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-slate-700">
                      <span>2. Semifinais</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-fmt-red">
                      <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                      <span>3. Grande Final FMTTEMA</span>
                    </div>
                  </div>

                  {/* Corpo da Árvore: Colunas com Alinhamento Flexbox e Grid do Tailwind */}
                  <div className="grid grid-cols-3 gap-6 items-center">
                    
                    {/* COLUNA 1: Lutas da Primeira Rodada */}
                    <div className="space-y-6">
                      {categoriaAtual.lutas && categoriaAtual.lutas.length > 0 ? (
                        categoriaAtual.lutas.map((luta, idx) => (
                          <div 
                            key={luta.numeroLuta || idx}
                            className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-4 relative"
                          >
                            {/* Identificação da Luta */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 text-[11px]">
                              <span className="font-heading font-bold text-fmt-blue">
                                Combate #{luta.numeroLuta}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] uppercase">
                                {luta.fase || 'Eliminatória'}
                              </span>
                            </div>

                            {/* Corner Vermelho (Lutador 1) */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 border border-red-200/80 mb-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-3 h-3 rounded-full bg-fmt-red shrink-0" title="Corner Vermelho" />
                                <div className="min-w-0">
                                  <span className="font-heading font-bold text-xs text-slate-900 block truncate">
                                    {luta.cornerVermelho?.nome || 'Atleta A'}
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
                            <div className="text-center my-1">
                              <span className="text-[10px] font-heading font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                                VS
                              </span>
                            </div>

                            {/* Corner Azul (Lutador 2) */}
                            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-200/80">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-3 h-3 rounded-full bg-blue-600 shrink-0" title="Corner Azul" />
                                <div className="min-w-0">
                                  <span className="font-heading font-bold text-xs text-slate-900 block truncate">
                                    {luta.cornerAzul?.nome || 'Atleta B'}
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
                          </div>
                        ))
                      ) : (
                        <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                          Sem lutas adicionais na primeira rodada
                        </div>
                      )}
                    </div>

                    {/* COLUNA 2: Semifinais (Conexão e Vencedores / Atleta Bye) */}
                    <div className="space-y-8 flex flex-col justify-around h-full">
                      
                      {/* Vaga 1 das Semis (Pode ser o Atleta com Bye ou vencedor) */}
                      <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-4 shadow-sm relative">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Vaga Semifinal 1
                        </div>
                        {categoriaAtual.temBye && categoriaAtual.atletaBye ? (
                          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-extrabold text-amber-700 uppercase block">Classificado via Bye</span>
                              <span className="font-heading font-bold text-xs text-slate-900">{categoriaAtual.atletaBye.nome}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-emerald-700">{categoriaAtual.atletaBye.vitorias}W</span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-500 text-xs italic text-center">
                            Vencedor do Combate #1
                          </div>
                        )}
                        <div className="text-center my-1 text-[10px] font-black text-slate-300">VS</div>
                        <div className="p-2.5 rounded-lg bg-slate-50 text-slate-500 text-xs italic text-center">
                          Vencedor do Combate #2
                        </div>
                      </div>

                      {/* Vaga 2 das Semis (se houver mais lutas) */}
                      {categoriaAtual.lutas && categoriaAtual.lutas.length > 2 && (
                        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-4 shadow-sm">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Vaga Semifinal 2
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-500 text-xs italic text-center mb-1">
                            Vencedor do Combate #3
                          </div>
                          <div className="text-center my-1 text-[10px] font-black text-slate-300">VS</div>
                          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-500 text-xs italic text-center">
                            Vencedor do Combate #4
                          </div>
                        </div>
                      )}

                    </div>

                    {/* COLUNA 3: Grande Final FMTTEMA (Disputa de Título) */}
                    <div className="flex flex-col justify-center h-full">
                      <div className="bg-gradient-to-b from-white to-amber-50/40 rounded-2xl border-2 border-yellow-400/80 shadow-lg p-5 text-center relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-20 h-20 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />
                        
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-800 text-[10px] font-heading font-extrabold uppercase tracking-wide mb-3">
                          <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                          <span>Decisão do Cinturão</span>
                        </div>

                        <h4 className="font-heading font-black text-base text-slate-900 mb-4">
                          Grande Final Estadual
                        </h4>

                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 italic">
                            Finalista Semifinal 1
                          </div>
                          <div className="font-heading font-black text-xs text-amber-600 uppercase">
                            Disputa do Ouro
                          </div>
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 italic">
                            Finalista Semifinal 2
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-yellow-200 text-[11px] text-slate-500 font-medium">
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

    </div>
  );
}
