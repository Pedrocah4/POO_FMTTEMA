import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FmttemaLogo from './FmttemaLogo';
import { LogOut, User, Shield, Home } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-fmt-blue text-white shadow-md border-b-4 border-fmt-red sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Identidade Visual / Escudo */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="cursor-pointer" title="Ir para a Visão Geral do Painel">
            <FmttemaLogo size="md" light={true} />
          </Link>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs border border-white/10 font-medium">
            <Shield className="w-3.5 h-3.5 text-fmt-red" />
            <span>Portal Esportivo Oficial</span>
          </div>
        </div>

        {/* Área do Usuário Autenticado & Ações */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Atalho para Página Inicial Pública */}
          <Link
            to="/"
            title="Voltar à Página Inicial Pública"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
          >
            <Home className="w-3.5 h-3.5 text-fmt-red" />
            <span className="hidden sm:inline">Página Inicial</span>
          </Link>

          {/* Info do Usuário */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black/20 border border-white/10">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-semibold text-white leading-tight">
                {user?.email || 'Usuário'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-red-300">
                {user?.perfil || 'ADMIN'}
              </span>
            </div>
          </div>

          {/* Botão de Logout */}
          <button
            id="btn-logout"
            onClick={logout}
            title="Encerrar sessão"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-fmt-red hover:bg-fmt-red-hover active:scale-[0.98] shadow-sm transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
