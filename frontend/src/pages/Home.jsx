import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FmttemaLogo from '../components/FmttemaLogo';
import CalendarioEventosPublico from '../components/CalendarioEventosPublico';
import TabelaRankingEstadual from '../components/TabelaRankingEstadual';
import VitrineParceiros from '../components/VitrineParceiros';
import {
  Shield,
  Calendar,
  Trophy,
  Handshake,
  LogIn,
  LayoutDashboard,
  Award,
  Users,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const rolarParaSecao = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-fmt-light text-fmt-dark flex flex-col font-sans antialiased">
      {/* Barra de Navegação da Landing Page Oficial */}
      <header className="bg-fmt-blue text-white shadow-md border-b-4 border-fmt-red sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="cursor-pointer">
              <FmttemaLogo size="md" light={true} />
            </Link>

            <nav className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => rolarParaSecao('calendario-eventos')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-fmt-red" />
                <span>Calendário & Ingressos</span>
              </button>

              <button
                type="button"
                onClick={() => rolarParaSecao('vitrine-ranking-estadual')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Ranking Estadual</span>
              </button>

              <Link
                to="/ranking"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all"
              >
                <Award className="w-3.5 h-3.5 text-yellow-400" />
                <span>Página de Ranking</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs border border-white/10 font-medium">
              <Shield className="w-3.5 h-3.5 text-fmt-red" />
              <span>Portal Oficial Aberto ao Público</span>
            </div>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-heading font-bold text-white bg-fmt-red hover:bg-fmt-red-hover shadow-sm transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Acessar Meu Painel</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-heading font-bold text-white bg-fmt-red hover:bg-fmt-red-hover shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Área do Filiado (Login)</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Banner Institucional da Landing Page */}
      <section className="relative bg-gradient-to-br from-fmt-blue via-slate-900 to-fmt-blue text-white border-b border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-bold tracking-wide">
                <Award className="w-4 h-4 text-fmt-red" />
                <span>Entidade Oficial de Administração do Desporto no Maranhão</span>
              </div>

              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                Federação de Muaythai Tradicional do Estado do Maranhão
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Acompanhe o calendário oficial de competições estaduais, adquira ingressos para os próximos eventos, consulte o ranking homologado de atletas por categoria e conheça nossos parceiros institucionais.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => rolarParaSecao('calendario-eventos')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-fmt-red hover:bg-fmt-red-hover text-white font-heading font-bold text-xs sm:text-sm shadow-lg transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Ver Agenda e Ingressos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => rolarParaSecao('vitrine-ranking-estadual')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Consultar Ranking Estadual</span>
                </button>

                {!isAuthenticated && (
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-slate-200 hover:text-white text-xs sm:text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    <span>Acesso para Atletas, Árbitros e Diretoria &rarr;</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Card Lateral de Destaques Institucionais */}
            <div className="lg:col-span-4 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/15 p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <FmttemaLogo size="md" showText={false} light={true} />
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400 block">
                    Temporada Oficial 2026
                  </span>
                  <h2 className="font-heading font-bold text-base text-white">
                    Circuito Maranhense FMTTEMA
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Users className="w-4 h-4 text-amber-400 mb-1" />
                  <span className="block font-heading font-black text-lg text-white">9</span>
                  <span className="text-[11px] text-slate-300">Categorias Oficiais</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <MapPin className="w-4 h-4 text-fmt-red mb-1" />
                  <span className="block font-heading font-black text-lg text-white">MA</span>
                  <span className="text-[11px] text-slate-300">Homologação Estadual</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Fundada em 17/06/2016 em São Luís - MA, promovendo o Muaythai Tradicional com transparência técnica e segurança desportiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal da Vitrine Pública */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* 1. Calendário de Eventos Ativos e Links Externos de Ingressos (US13) */}
        <CalendarioEventosPublico />

        {/* 2. Tabelas Dinâmicas do Ranking Estadual (US12) */}
        <TabelaRankingEstadual />
      </main>

      {/* 3. Vitrine de Patrocinadores e Parceiros Oficiais (US11) */}
      <VitrineParceiros />

      {/* Rodapé Institucional Oficial */}
      <footer className="bg-white border-t border-slate-200 mt-10 py-8 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-heading font-bold text-fmt-blue text-sm">
              Federação de Muaythai Tradicional do Estado do Maranhão - FMTTEMA
            </p>
            <p className="text-slate-500 mt-1">
              CNPJ: 25.194.198/0001-** &bull; Fundada em 17/06/2016 &bull; São Luís - MA
            </p>
          </div>
          <div className="text-slate-500 text-[11px]">
            Sistema Oficial de Gestão Esportiva &bull; POO / UNDB 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

