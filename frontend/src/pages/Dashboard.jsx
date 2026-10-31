import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar, { MODULOS_SISTEMA, obterRotulosModulo } from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import TabelaPendencias from '../components/TabelaPendencias';
import PerfilCartelAtleta from '../components/PerfilCartelAtleta';
import PainelEscalaArbitro from '../components/PainelEscalaArbitro';
import GestaoEscalasArbitros from '../components/GestaoEscalasArbitros';
import PainelFinanceiroAnuidades from '../components/PainelFinanceiroAnuidades';
import PainelDashboardAnalitico from '../components/PainelDashboardAnalitico';
import PainelComercialParceiros from '../components/PainelComercialParceiros';
import TabelaRankingEstadual from '../components/TabelaRankingEstadual';
import CalendarioEventosPublico from '../components/CalendarioEventosPublico';
import ArvoreTorneio from '../components/ArvoreTorneio';
import {
  Menu,
  ShieldCheck,
  AlertCircle,
  Users,
  Trophy,
  Calendar,
  Coins,
  Scale,
  UserCheck,
  Medal,
  Layers,
  Swords
} from 'lucide-react';

// Mensagens e cabeçalhos customizados rigorosamente para cada nível de acesso (RBAC)
const MENSAGENS_POR_PERFIL = {
  ADMIN: {
    badge: 'Gestão Estadual & Governança',
    titulo: 'Painel Administrativo FMTTEMA',
    descricao: 'Bem-vindo ao centro de comando da Federação de Muaythai Tradicional do Maranhão. Gerencie homologações, escalas de arbitragem, tesouraria e parceiros institucionais.',
    badgeColor: 'bg-red-50 text-fmt-red border-red-200'
  },
  TREINADOR: {
    badge: 'Comissão Técnica Oficial',
    titulo: 'Painel do Treinador & Equipe Técnica',
    descricao: 'Bem-vindo ao portal da comissão técnica. Acompanhe a evolução do cartel e graduação dos seus atletas, consulte o calendário estadual e gerencie as inscrições.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  ATLETA: {
    badge: 'Atleta Federado Oficial',
    titulo: 'Portal do Atleta FMTTEMA',
    descricao: 'Bem-vindo ao seu portal esportivo oficial. Acompanhe seu histórico de lutas (cartel), graduação registrada (Prajied), chaveamentos de torneios e anuidade.',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  ARBITRO: {
    badge: 'Quadro Oficial de Arbitragem',
    titulo: 'Painel do Árbitro Oficial',
    descricao: 'Bem-vindo ao portal da comissão de arbitragem. Consulte suas convocações e escalas oficiais para os torneios, confirme presença e acompanhe as súmulas.',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  ACADEMIA: {
    badge: 'Agremiação Filiada Ativa',
    titulo: 'Painel da Academia Filiada',
    descricao: 'Bem-vindo ao portal da academia credenciada. Acompanhe a situação cadastral da sua agremiação, atletas vinculados, anuidades federativas e torneios.',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const { modulo } = useParams();
  const navigate = useNavigate();

  const perfil = user?.perfil || 'ADMIN';
  const infoPerfil = MENSAGENS_POR_PERFIL[perfil] || MENSAGENS_POR_PERFIL.ADMIN;

  // Controle de estado da Sidebar (recolhida ou expandida)
  const [colapsada, setColapsada] = useState(() => {
    return localStorage.getItem('fmttema_sidebar_colapsada') === 'true';
  });
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);

  // Sub-aba interna para Torneios (Chaves vs Calendário)
  const [subAbaTorneios, setSubAbaTorneios] = useState('chaves');

  const toggleColapsar = () => {
    setColapsada(prev => {
      const proximo = !prev;
      localStorage.setItem('fmttema_sidebar_colapsada', String(proximo));
      return proximo;
    });
  };

  // Módulo ativo com fallback para visão-geral
  const moduloAtual = modulo || 'visao-geral';

  // Validação de acesso RBAC ao módulo atual
  const configModulo = MODULOS_SISTEMA.find(m => m.id === moduloAtual);
  const temPermissao = configModulo ? configModulo.perfis.includes(perfil) : true;

  // Se o usuário não tiver permissão para a URL digitada, redireciona para a visão geral
  useEffect(() => {
    if (!temPermissao && moduloAtual !== 'visao-geral') {
      navigate('/dashboard/visao-geral', { replace: true });
    }
  }, [temPermissao, moduloAtual, navigate]);

  const handleSelecionarModulo = (id) => {
    if (id === 'visao-geral') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${id}`);
    }
  };

  // Renderizador do Conteúdo do Módulo Selecionado
  const renderModuloConteudo = () => {
    if (!temPermissao) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-xl mx-auto my-12">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-amber-900 mb-2">Acesso Restrito ao Módulo</h3>
          <p className="text-sm text-amber-700 mb-6">
            Seu perfil atual ({perfil}) não possui permissão para acessar esta seção do sistema federativo.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-lg bg-fmt-blue text-white text-xs font-semibold hover:bg-fmt-blue-hover transition-colors"
          >
            Voltar para Visão Geral
          </button>
        </div>
      );
    }

    switch (moduloAtual) {
      case 'pendencias':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
                  Fila de Homologação e Credenciamento
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Avaliação e aprovação de filiações de atletas e agremiações.
                </p>
              </div>
            </div>
            <TabelaPendencias />
          </div>
        );

      case 'atletas':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
                  {perfil === 'ATLETA'
                    ? 'Meu Perfil & Cartel Oficial'
                    : perfil === 'ADMIN'
                    ? 'Gestão Estadual de Atletas e Filiações'
                    : 'Atletas Vinculados à Minha Academia'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {perfil === 'ATLETA'
                    ? 'Histórico oficial de combates, vitórias, derrotas e graduação registrada.'
                    : perfil === 'ADMIN'
                    ? 'Controle de todas as fichas cadastrais, categorias de peso e histórico competitivo.'
                    : 'Acompanhamento exclusivo do plantel e graduações dos atletas da sua academia.'}
                </p>
              </div>
            </div>
            <PerfilCartelAtleta />
          </div>
        );

      case 'torneios':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
                  Torneios, Chaves e Calendário Oficial
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {perfil === 'ADMIN'
                    ? 'Gerenciamento de confrontos por categoria e cronograma oficial da temporada.'
                    : 'Acompanhe as chaves de luta por categoria e consulte o calendário de etapas oficiais.'}
                </p>
              </div>

              {/* Seletor de visualização interna do Torneio */}
              <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setSubAbaTorneios('chaves')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    subAbaTorneios === 'chaves'
                      ? 'bg-white text-fmt-blue shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5 text-fmt-red" />
                  <span>Árvore de Chaveamento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubAbaTorneios('calendario')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    subAbaTorneios === 'calendario'
                      ? 'bg-white text-fmt-blue shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-fmt-blue" />
                  <span>Calendário de Eventos</span>
                </button>
              </div>
            </div>

            {subAbaTorneios === 'chaves' ? (
              <ArvoreTorneio />
            ) : (
              <CalendarioEventosPublico />
            )}
          </div>
        );

      case 'arbitragem':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
                  {perfil === 'ARBITRO' ? 'Minhas Convocações Oficiais' : 'Gestão e Escalas de Arbitragem'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {perfil === 'ARBITRO'
                    ? 'Confirmação de presença em eventos estaduais e escala por área de luta.'
                    : 'Designação do corpo de arbitragem por evento, ringue e categoria.'}
                </p>
              </div>
            </div>

            {perfil === 'ADMIN' ? <GestaoEscalasArbitros /> : <PainelEscalaArbitro />}
          </div>
        );

      case 'financeiro':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
                  {perfil === 'ATLETA'
                    ? 'Minha Anuidade Federativa'
                    : perfil === 'ACADEMIA'
                    ? 'Anuidade da Minha Academia'
                    : 'Tesouraria e Anuidades Federativas'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {perfil === 'ADMIN'
                    ? 'Controle de regularidade financeira, baixa de pagamentos e comprovantes.'
                    : 'Consulte a situação de regularidade da sua taxa anual e recibo registrado.'}
                </p>
              </div>
            </div>
            <PainelFinanceiroAnuidades />
          </div>
        );

      case 'parceiros':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
                  Gestão Comercial e Parceiros Institucionais
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Controle de patrocinadores e ativações comerciais no circuito estadual.
                </p>
              </div>
            </div>
            <PainelComercialParceiros />
          </div>
        );

      case 'ranking':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
                  Ranking Oficial do Estado do Maranhão
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pontuação consolidada dos atletas por categoria e temporada oficial.
                </p>
              </div>
            </div>
            <TabelaRankingEstadual />
          </div>
        );

      case 'visao-geral':
      default:
        return (
          <div className="space-y-8">
            {/* Banner de Boas-Vindas Customizado por Perfil (exibido na Visão Geral) */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold mb-2.5 ${infoPerfil.badgeColor}`}>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{infoPerfil.badge}</span>
                  </div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-fmt-blue tracking-tight">
                    {infoPerfil.titulo}
                  </h1>
                  <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                    {infoPerfil.descricao}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Credencial Ativa</span>
                  <span className="text-xs font-mono font-bold text-fmt-blue mt-0.5">{user?.email}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded bg-fmt-red-light text-fmt-red border border-fmt-red/20">
                    {perfil}
                  </span>
                </div>
              </div>
            </div>

            {/* Cards Analíticos de Resumo (exclusivo para Administrador Geral) */}
            {perfil === 'ADMIN' && (
              <PainelDashboardAnalitico />
            )}

            {/* Seção de Atalhos Rápidos por Perfil */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-base text-fmt-blue flex items-center gap-2">
                  <Layers className="w-4 h-4 text-fmt-red" />
                  <span>Acesso Rápido aos Módulos</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">Temporada Oficial 2026</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {perfil === 'ADMIN' && (
                  <DashboardCard
                    title="Fila de Homologação"
                    description="Avalie e delibere sobre solicitações pendentes de cadastro de novos atletas e agremiações."
                    icon={UserCheck}
                    badge="Cadastros"
                    actionText="Ver pendências"
                    onAction={() => handleSelecionarModulo('pendencias')}
                  />
                )}

                {perfil !== 'ARBITRO' && (
                  <DashboardCard
                    title={
                      perfil === 'ATLETA'
                        ? 'Meu Perfil & Cartel'
                        : perfil === 'ADMIN'
                        ? 'Atletas & Filiações'
                        : 'Meus Atletas'
                    }
                    description={
                      perfil === 'ATLETA'
                        ? 'Consulte seu histórico de combates, vitórias, graduação e status de filiação.'
                        : perfil === 'ADMIN'
                        ? 'Controle completo de fichas cadastrais, graduações e histórico competitivo.'
                        : 'Acompanhe o cartel e graduação dos atletas vinculados à sua academia.'
                    }
                    icon={Users}
                    badge="Atletas"
                    actionText="Acessar módulo"
                    onAction={() => handleSelecionarModulo('atletas')}
                  />
                )}

                <DashboardCard
                  title="Torneios & Chaves"
                  description="Acompanhe as chaves de luta por categoria e consulte o calendário de eventos oficiais."
                  icon={Trophy}
                  badge="Competições"
                  actionText="Abrir torneios"
                  onAction={() => handleSelecionarModulo('torneios')}
                />

                {(perfil === 'ADMIN' || perfil === 'ARBITRO') && (
                  <DashboardCard
                    title={perfil === 'ARBITRO' ? 'Minhas Convocações' : 'Arbitragem Oficial'}
                    description={
                      perfil === 'ARBITRO'
                        ? 'Consulte suas escalas em torneios estaduais e confirme sua presença nos ringues.'
                        : 'Organize o corpo de arbitragem por evento, ringue e categoria.'
                    }
                    icon={Scale}
                    badge="Arbitragem"
                    actionText="Ver escalas"
                    onAction={() => handleSelecionarModulo('arbitragem')}
                  />
                )}

                {(perfil === 'ADMIN' || perfil === 'ACADEMIA' || perfil === 'ATLETA') && (
                  <DashboardCard
                    title={perfil === 'ADMIN' ? 'Tesouraria e Anuidades' : 'Minha Anuidade'}
                    description={
                      perfil === 'ADMIN'
                        ? 'Controle de anuidades, baixa de pagamentos e emissão de comprovantes.'
                        : 'Consulte a situação de regularidade da sua anuidade e recibo registrado.'
                    }
                    icon={Coins}
                    badge="Financeiro"
                    actionText="Acessar financeiro"
                    onAction={() => handleSelecionarModulo('financeiro')}
                  />
                )}

                <DashboardCard
                  title="Ranking Estadual"
                  description="Consulte a tabela de classificação e pontuação por categoria na temporada 2026."
                  icon={Medal}
                  badge="Classificação"
                  actionText="Ver ranking"
                  onAction={() => handleSelecionarModulo('ranking')}
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-fmt-dark">
      {/* Topo Institucional Fixo */}
      <Navbar />

      {/* Barra de Ação Mobile (aparece em telas pequenas para abrir o menu gaveta) */}
      <div className="md:hidden bg-fmt-blue text-white px-4 py-3 flex items-center justify-between border-b border-white/10 shadow-sm sticky top-20 z-20">
        <button
          type="button"
          onClick={() => setMobileMenuAberto(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer transition-colors"
        >
          <Menu className="w-4 h-4 text-fmt-red" />
          <span>Menu do Sistema</span>
        </button>

        <span className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
          {configModulo ? obterRotulosModulo(configModulo, perfil).label : 'Visão Geral'}
        </span>
      </div>

      {/* Área Principal de Trabalho (Sidebar + Conteúdo Modular) */}
      <div className="flex-1 flex w-full">
        {/* Barra Lateral Retrátil com RBAC */}
        <Sidebar
          moduloAtivo={moduloAtual}
          onSelecionarModulo={handleSelecionarModulo}
          perfilUsuario={perfil}
          colapsada={colapsada}
          onToggleColapsar={toggleColapsar}
          mobileOpen={mobileMenuAberto}
          onCloseMobile={() => setMobileMenuAberto(false)}
        />

        {/* Conteúdo Central Exclusivo do Módulo Ativo */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Renderização Condicional Exclusiva do Módulo Selecionado */}
            {renderModuloConteudo()}
          </div>
        </main>
      </div>

      {/* Rodapé Institucional Compacto */}
      <footer className="bg-white border-t border-slate-200 py-4 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>Federação de Muaythai Tradicional do Estado do Maranhão - FMTTEMA</span>
          <span className="text-[11px] text-slate-400">Portal de Gestão Esportiva &bull; 2026</span>
        </div>
      </footer>
    </div>
  );
}
