import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
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
import {
  Users,
  Trophy,
  Calendar,
  Coins,
  KeyRound,
  ShieldCheck,
  FileText,
  Activity,
  Handshake
} from 'lucide-react';

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const getTituloPainel = () => {
    if (user?.perfil === 'ATLETA') return 'Painel do Atleta FMTTEMA';
    if (user?.perfil === 'TREINADOR') return 'Painel do Treinador FMTTEMA';
    if (user?.perfil === 'ARBITRO') return 'Painel do Árbitro Oficial FMTTEMA';
    return 'Painel Administrativo FMTTEMA';
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* Banner de Boas-Vindas Institucional */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sessão Oficial Ativa</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-fmt-blue tracking-tight">
                {getTituloPainel()}
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                Bem-vindo ao portal unificado da Federação de Muaythai Tradicional do Maranhão. Gerencie atletas, homologue inscrições em torneios e acompanhe os processos esportivos estaduais.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Credencial</span>
              <span className="text-xs font-mono font-bold text-fmt-blue mt-0.5">{user?.email}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mt-1 rounded bg-fmt-red-light text-fmt-red border border-fmt-red/20">
                {user?.perfil || 'ADMIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Painel Analítico: Cards Superiores e Gráficos Consolidados (US10) */}
        {(user?.perfil === 'ADMIN' || user?.perfil === 'TREINADOR') && <PainelDashboardAnalitico />}

        {/* Painel do Árbitro: Convocações e Confirmação de Presença (US08) */}
        {(user?.perfil === 'ARBITRO' || user?.perfil === 'ADMIN') && <PainelEscalaArbitro />}

        {/* Perfil e Cartel do Atleta / Gestão do Treinador (US04 - Não exibido para Árbitro) */}
        {user?.perfil !== 'ARBITRO' && <PerfilCartelAtleta />}

        {/* Fila de Pendências de Credenciamento (US03) */}
        {user?.perfil === 'ADMIN' && <TabelaPendencias />}

        {/* Gestão e Acompanhamento de Escalas de Árbitros (US08 - Visão Admin) */}
        {user?.perfil === 'ADMIN' && <GestaoEscalasArbitros />}

        {/* Painel Financeiro de Aprovação e Baixa de Pagamentos (US09) */}
        {user?.perfil === 'ADMIN' && <PainelFinanceiroAnuidades />}

        {/* Painel Comercial: Gestão de Patrocinadores e Exibição de Parceiros (US11) */}
        {user?.perfil === 'ADMIN' && <PainelComercialParceiros />}

        {/* Vitrine de Ranking Estadual Dinâmico (US12) */}
        <TabelaRankingEstadual />

        {/* Calendário Oficial de Eventos Ativos e Bilheteria (US13) */}
        <CalendarioEventosPublico />

        {/* Seção dos Módulos Principais com DashboardCards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-fmt-blue">
              Módulos do Sistema
            </h2>
            <span className="text-xs text-slate-500 font-medium">Temporada Oficial 2026</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <DashboardCard
              title="Gestão de Atletas"
              description="Controle de fichas cadastrais, academias filiadas, categorias de peso e graduações (Prajied)."
              icon={Users}
              badge="Cadastros"
              actionText="Acessar atletas"
              stat={{ value: "142", label: "atletas homologados" }}
            />

            <DashboardCard
              title="Chaves de Luta"
              description="Chaveamento de torneios com geração automática de combates e aplicação da regra do Bye."
              icon={Trophy}
              badge="Torneios"
              actionText="Ver chaveamentos"
              onAction={() => navigate('/chaves')}
              stat={{ value: "08", label: "categorias ativas" }}
            />

            <DashboardCard
              title="Calendário e Eventos"
              description="Cronograma oficial do circuito maranhense, pesagens oficiais e regulamentos técnicos."
              icon={Calendar}
              badge="Circuito MA"
              actionText="Ver calendário"
              onAction={() => document.getElementById('calendario-eventos')?.scrollIntoView({ behavior: 'smooth' })}
              stat={{ value: "04", label: "etapas previstas" }}
            />

            <DashboardCard
              title="Financeiro e Anuidades"
              description="Gestão de anuidades federativas, confirmação de inscrições e emissão de comprovantes."
              icon={Coins}
              badge="Tesouraria"
              actionText="Ver financeiro"
              onAction={() => document.getElementById('painel-financeiro')?.scrollIntoView({ behavior: 'smooth' })}
              stat={{ value: "98%", label: "adimplência" }}
            />
          </div>
        </div>

        {/* Painel Técnico de Validação da Sessão (US01) */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-fmt-blue" />
              <h3 className="font-heading font-bold text-sm text-fmt-blue">
                Inspeção de Segurança e Autenticação (US01)
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Spring Security + JWT + BCrypt
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                E-mail Autenticado
              </span>
              <span className="text-xs font-mono font-medium text-slate-800">{user?.email}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                Perfil de Acesso (RBAC)
              </span>
              <span className="text-xs font-mono font-bold text-fmt-red">{user?.perfil}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                Guarda de Rotas (PrivateRoute)
              </span>
              <span className="text-xs font-semibold text-emerald-700">Ativa e Monitorando ✅</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-600">Token JWT Ativo (Bearer):</span>
              <span className="text-[11px] text-slate-400 font-mono">armazenado em localStorage</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 break-all select-all leading-relaxed">
              {token || 'Nenhum token encontrado'}
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
