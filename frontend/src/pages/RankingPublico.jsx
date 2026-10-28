import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FmttemaLogo from '../components/FmttemaLogo';
import Navbar from '../components/Navbar';
import TabelaRankingEstadual from '../components/TabelaRankingEstadual';
import VitrineParceiros from '../components/VitrineParceiros';
import { Shield, LogIn, ArrowLeft } from 'lucide-react';

export default function RankingPublico() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-fmt-light text-fmt-dark flex flex-col font-sans antialiased">
      {/* Se autenticado, mostra a Navbar completa; se visitante público, mostra cabeçalho público oficial */}
      {isAuthenticated ? (
        <Navbar />
      ) : (
        <header className="bg-fmt-blue text-white shadow-md border-b-4 border-fmt-red sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/ranking" className="cursor-pointer">
              <FmttemaLogo size="md" light={true} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs border border-white/10 font-medium">
                <Shield className="w-3.5 h-3.5 text-fmt-red" />
                <span>Vitrine Pública Oficial</span>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-heading font-bold text-white bg-fmt-red hover:bg-fmt-red-hover shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Área Restrita (Login)</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Conteúdo Central da Vitrine de Ranking */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isAuthenticated && (
          <div className="mb-4 text-left">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-fmt-blue transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Painel Principal</span>
            </Link>
          </div>
        )}

        <TabelaRankingEstadual />
      </main>

      {/* Vitrine Comercial de Parceiros */}
      <VitrineParceiros />

      {/* Rodapé Institucional */}
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

