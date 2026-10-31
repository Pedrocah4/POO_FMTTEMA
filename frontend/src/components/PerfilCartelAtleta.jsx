import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  TrendingUp, 
  Edit3, 
  UserCheck, 
  Users,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ModalEditarCartel from './ModalEditarCartel';

// Mapeamento visual para estilos das cores de Kruang
export function getKruangColorStyle(kruang) {
  const k = (kruang || '').toLowerCase();
  if (k.includes('preto e branco')) {
    return 'bg-gradient-to-r from-slate-900 via-slate-600 to-white text-slate-900 border-slate-900 font-bold';
  }
  if (k.includes('preto')) {
    return 'bg-slate-950 text-white border-slate-700 shadow-sm';
  }
  if (k.includes('vermelho e branco')) {
    return 'bg-gradient-to-r from-red-600 to-white text-red-700 border-red-500 font-bold';
  }
  if (k.includes('azul e vermelho')) {
    return 'bg-gradient-to-r from-blue-700 to-red-600 text-white border-blue-900';
  }
  if (k.includes('vermelho')) {
    return 'bg-red-600 text-white border-red-700';
  }
  if (k.includes('verde e azul')) {
    return 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-emerald-800';
  }
  if (k.includes('azul')) {
    return 'bg-blue-600 text-white border-blue-700';
  }
  if (k.includes('amarelo e verde')) {
    return 'bg-gradient-to-r from-amber-400 to-emerald-600 text-slate-900 border-amber-500';
  }
  if (k.includes('verde')) {
    return 'bg-emerald-600 text-white border-emerald-700';
  }
  if (k.includes('branco e amarelo')) {
    return 'bg-gradient-to-r from-slate-100 to-amber-300 text-slate-900 border-amber-400';
  }
  if (k.includes('amarelo')) {
    return 'bg-amber-400 text-slate-900 border-amber-500';
  }
  return 'bg-white text-slate-700 border-slate-300';
}

export default function PerfilCartelAtleta() {
  const { user } = useAuth();
  const [atleta, setAtleta] = useState(null);
  const [listaAtletas, setListaAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [atletaParaEditar, setAtletaParaEditar] = useState(null);

  const perfil = user?.perfil || 'ADMIN';
  const isAdmin = perfil === 'ADMIN';
  const isTreinador = perfil === 'TREINADOR';
  const isAcademia = perfil === 'ACADEMIA';
  const isAtleta = perfil === 'ATLETA';
  const podeEditarCartel = isAdmin || isTreinador;

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);

    try {
      if (isAtleta) {
        // Atleta vê rigorosamente APENAS o seu próprio perfil e histórico pessoal
        const res = await api.get('/api/atletas/me');
        setAtleta(res.data);
        setListaAtletas([]);
      } else if (perfil === 'ARBITRO') {
        // Árbitro oficial não gerencia fichas de atletas
        setErro('Árbitros oficiais não possuem gestão de fichas de atletas. Acesse o módulo de Arbitragem ou Torneios.');
      } else {
        const res = await api.get('/api/atletas');
        const todosAtletas = res.data || [];

        if (isAdmin) {
          // Administrador estadual tem visão global de todos os atletas de todas as academias
          setListaAtletas(todosAtletas);
          if (todosAtletas.length > 0) {
            setAtleta(todosAtletas[0]);
          }
        } else if (isTreinador || isAcademia) {
          // Treinador e Academia enxergam EXCLUSIVAMENTE os atletas vinculados à sua própria agremiação
          const academiaFiltro = user?.email?.includes('imperatriz')
            ? 'Arena Tocantins Muaythai'
            : 'Centro de Treinamento FMTTEMA';

          const atletasMinhaAcademia = todosAtletas.filter(a =>
            (a.academiaNome && a.academiaNome.toLowerCase().includes(academiaFiltro.toLowerCase())) ||
            (a.email === user?.email)
          );

          setListaAtletas(atletasMinhaAcademia);
          if (atletasMinhaAcademia.length > 0) {
            setAtleta(atletasMinhaAcademia[0]);
          } else {
            setAtleta(null);
            setErro('Nenhum atleta vinculado encontrado para a sua agremiação no momento.');
          }
        }
      }
    } catch (err) {
      console.error('Erro ao carregar atleta(s):', err);
      setErro('Não foi possível carregar os dados do atleta no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [user]);

  const handleSucessoEdicao = (atletaAtualizado) => {
    setAtleta(atletaAtualizado);
    setListaAtletas((prev) =>
      prev.map((a) => (a.id === atletaAtualizado.id ? atletaAtualizado : a))
    );
  };

  const abrirModalEdicao = (atl) => {
    setAtletaParaEditar(atl || atleta);
    setModalAberto(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-8 text-center mb-8">
        <RefreshCw className="w-8 h-8 text-fmt-blue animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-600 font-medium">Carregando cartel e histórico do atleta...</p>
      </div>
    );
  }

  if (erro && !atleta) {
    return (
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 mb-8 text-left">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-800">Perfil de Atleta Não Vinculado</h3>
            <p className="text-xs text-slate-600 mt-1">
              {erro} (Usuário atual: {user?.email} - {user?.perfil})
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!atleta) {
    return null;
  }

  const vitorias = atleta.vitorias || 0;
  const derrotas = atleta.derrotas || 0;
  const empates = atleta.empates || 0;
  const totalLutas = vitorias + derrotas + empates;
  const taxaVitoria = totalLutas > 0 ? Math.round((vitorias / totalLutas) * 100) : 0;
  const graduacaoAtual = atleta.kruang || atleta.graduacao || 'Branco';

  return (
    <div className="mb-8 space-y-6">
      {/* Card Principal: Visualização de Cartel & Graduação */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden text-left">
        
        {/* Banner Superior com Identidade FMTTEMA e Badges */}
        <div className="bg-gradient-to-r from-fmt-blue via-slate-900 to-fmt-blue px-6 py-6 sm:px-8 sm:py-7 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            
            {/* Foto/Avatar e Dados Pessoais */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 border-2 border-white/20 shadow-lg flex items-center justify-center text-white font-heading font-black text-2xl sm:text-3xl shrink-0">
                  {atleta.nome ? atleta.nome.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-1 border-2 border-slate-900 shadow">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white border border-white/15">
                    {atleta.categoria || 'Adulto'}
                  </span>
                  {atleta.peso && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {atleta.peso} kg
                    </span>
                  )}
                  <span className="text-[11px] text-slate-300">
                    Academia: <strong className="text-white">{atleta.academiaNome || 'FMTTEMA Oficial'}</strong>
                  </span>
                </div>

                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-white flex items-center gap-2">
                  <span>{atleta.nome}</span>
                  {atleta.apelido && (
                    <span className="text-amber-400 text-lg sm:text-xl font-medium">
                      "{atleta.apelido}"
                    </span>
                  )}
                </h2>

                <p className="text-xs text-slate-300 mt-1">
                  Registro FMTTEMA: <span className="font-mono text-slate-200 font-semibold">MA-{atleta.id?.toString().padStart(4, '0')}</span> • CPF: <span className="font-mono text-slate-200">{atleta.cpf}</span>
                </p>
              </div>
            </div>

            {/* Ação do Treinador / Admin: Botão de Edição */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {podeEditarCartel && !isAtleta && (
                <button
                  id="btn-editar-cartel"
                  onClick={() => abrirModalEdicao(atleta)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-fmt-red to-fmt-red-hover text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar Cartel & Kruang</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Painel Central: Estatísticas de Cartel & Graduação Atual */}
        <div className="p-6 sm:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Bloco 1: Placar Visual do Cartel (US04 - Exibir visualmente o histórico de vitórias/derrotas) */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200/90">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-fmt-blue/10 rounded-lg text-fmt-blue">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-800">
                      Cartel Oficial de Combates
                    </h3>
                    <p className="text-xs text-slate-500">Histórico de lutas chanceladas pela FMTTEMA</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{taxaVitoria}% Aproveitamento</span>
                </div>
              </div>

              {/* Cards dos Contadores: Vitórias / Derrotas / Empates */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                
                {/* Vitórias */}
                <div className="bg-white border-2 border-emerald-500/30 rounded-xl p-4 text-center shadow-sm relative overflow-hidden group hover:border-emerald-500 transition-colors">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500" />
                  <span className="text-[11px] font-heading font-extrabold text-emerald-700 uppercase tracking-wider block">
                    Vitórias (W)
                  </span>
                  <span id="valor-vitorias" className="font-heading font-black text-3xl sm:text-4xl text-emerald-600 block my-1">
                    {vitorias}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Combates Vencidos</span>
                </div>

                {/* Derrotas */}
                <div className="bg-white border-2 border-fmt-red/30 rounded-xl p-4 text-center shadow-sm relative overflow-hidden group hover:border-fmt-red transition-colors">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-fmt-red" />
                  <span className="text-[11px] font-heading font-extrabold text-fmt-red uppercase tracking-wider block">
                    Derrotas (L)
                  </span>
                  <span id="valor-derrotas" className="font-heading font-black text-3xl sm:text-4xl text-fmt-red block my-1">
                    {derrotas}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Combates Perdidos</span>
                </div>

                {/* Empates */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-4 text-center shadow-sm relative overflow-hidden group hover:border-slate-400 transition-colors">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-slate-400" />
                  <span className="text-[11px] font-heading font-extrabold text-slate-600 uppercase tracking-wider block">
                    Empates (D)
                  </span>
                  <span id="valor-empates" className="font-heading font-black text-3xl sm:text-4xl text-slate-700 block my-1">
                    {empates}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Empates Declarados</span>
                </div>

              </div>

              {/* Barra de Progresso Visual de Vitórias vs Derrotas */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-semibold">
                  <span className="text-emerald-700">Vitórias: {vitorias}</span>
                  <span className="text-slate-500 font-mono text-[11px]">Total: {totalLutas} lutas</span>
                  <span className="text-fmt-red">Derrotas: {derrotas}</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${totalLutas > 0 ? (vitorias / totalLutas) * 100 : 0}%` }}
                    title={`${vitorias} Vitórias`}
                  />
                  <div 
                    className="bg-slate-400 h-full transition-all duration-500" 
                    style={{ width: `${totalLutas > 0 ? (empates / totalLutas) * 100 : 0}%` }}
                    title={`${empates} Empates`}
                  />
                  <div 
                    className="bg-fmt-red h-full transition-all duration-500" 
                    style={{ width: `${totalLutas > 0 ? (derrotas / totalLutas) * 100 : 0}%` }}
                    title={`${derrotas} Derrotas`}
                  />
                </div>
              </div>

            </div>

            {/* Bloco 2: Graduação Atual (Kruang / Prajied) */}
            <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/90">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-800">
                      Graduação Oficial
                    </h3>
                    <p className="text-xs text-slate-500">Nível técnico homologado</p>
                  </div>
                </div>

                <div className="text-center py-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Kruang (Prajied) Atual
                  </span>

                  {/* Badge da Cor do Kruang */}
                  <div 
                    id="badge-kruang-atual"
                    className={`inline-block px-5 py-2.5 rounded-xl border-2 text-sm sm:text-base shadow-md font-heading font-extrabold uppercase tracking-wide transition-all ${getKruangColorStyle(graduacaoAtual)}`}
                  >
                    {graduacaoAtual}
                  </div>

                  <p className="text-xs text-slate-500 mt-4 leading-relaxed px-2">
                    A graduação é chancelada exclusivamente pelo Treinador credenciado e pela diretoria técnica da FMTTEMA.
                  </p>
                </div>
              </div>

              {podeEditarCartel && !isAtleta && (
                <div className="pt-4 border-t border-slate-200/80">
                  <button
                    onClick={() => abrirModalEdicao(atleta)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-fmt-blue" />
                    <span>Alterar Kruang do Aluno</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Seção Adicional para Treinador / Admin / Academia: Seletor de Alunos/Atletas */}
      {!isAtleta && listaAtletas.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-fmt-blue" />
              <div>
                <h3 className="font-heading font-bold text-sm text-fmt-blue">
                  {isAdmin
                    ? `Plantel Completo da Federação (${listaAtletas.length} atletas)`
                    : `Atletas Vinculados à Minha Agremiação (${listaAtletas.length} atletas)`}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAdmin
                    ? 'Visão administrativa global de todos os atletas federados no Maranhão'
                    : 'Acompanhamento exclusivo dos atletas vinculados à sua academia'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {listaAtletas.map((atl) => {
              const selecionado = atl.id === atleta.id;
              const kruangAtl = atl.kruang || atl.graduacao || 'Branco';
              return (
                <div
                  key={atl.id}
                  onClick={() => setAtleta(atl)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    selecionado
                      ? 'border-fmt-blue bg-blue-50/50 ring-2 ring-fmt-blue/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-heading font-bold text-sm text-slate-800 block truncate">
                      {atl.nome}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-emerald-700 font-bold">
                        {atl.vitorias || 0}W
                      </span>
                      <span className="text-[11px] font-mono text-fmt-red font-bold">
                        {atl.derrotas || 0}L
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 font-bold">
                        {atl.empates || 0}D
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] text-slate-600 font-medium truncate">
                        {kruangAtl}
                      </span>
                    </div>
                  </div>

                  {podeEditarCartel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirModalEdicao(atl);
                      }}
                      title="Editar cartel deste atleta"
                      className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-fmt-blue hover:border-fmt-blue transition-colors shrink-0 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      <ModalEditarCartel
        atleta={atletaParaEditar}
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={handleSucessoEdicao}
      />
    </div>
  );
}
