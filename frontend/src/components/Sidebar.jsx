import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Trophy, 
  Scale, 
  Landmark, 
  Handshake, 
  Medal, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const MODULOS_SISTEMA = [
  {
    id: 'visao-geral',
    label: 'Visão Geral',
    icon: LayoutDashboard,
    perfis: ['ADMIN', 'TREINADOR', 'ATLETA', 'ARBITRO', 'ACADEMIA'],
    descricao: 'Resumo e atalhos rápidos'
  },
  {
    id: 'pendencias',
    label: 'Homologações',
    icon: UserCheck,
    perfis: ['ADMIN'],
    descricao: 'Fila de aprovação de cadastros'
  },
  {
    id: 'atletas',
    label: 'Atletas & Cartel',
    icon: Users,
    perfis: ['ADMIN', 'TREINADOR', 'ATLETA', 'ACADEMIA'],
    descricao: 'Fichas, cartel e graduação'
  },
  {
    id: 'torneios',
    label: 'Torneios & Chaves',
    icon: Trophy,
    perfis: ['ADMIN', 'TREINADOR', 'ATLETA', 'ARBITRO', 'ACADEMIA'],
    descricao: 'Chaveamento e calendário'
  },
  {
    id: 'arbitragem',
    label: 'Arbitragem',
    icon: Scale,
    perfis: ['ADMIN', 'ARBITRO'],
    descricao: 'Escalas e convocações'
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: Landmark,
    perfis: ['ADMIN', 'ACADEMIA', 'ATLETA'],
    descricao: 'Anuidades e comprovantes'
  },
  {
    id: 'parceiros',
    label: 'Patrocinadores',
    icon: Handshake,
    perfis: ['ADMIN'],
    descricao: 'Gestão comercial e parceiros'
  },
  {
    id: 'ranking',
    label: 'Ranking Estadual',
    icon: Medal,
    perfis: ['ADMIN', 'TREINADOR', 'ATLETA', 'ARBITRO', 'ACADEMIA'],
    descricao: 'Classificação oficial'
  }
];

/**
 * Personaliza o nome e subtítulo de cada item da Sidebar conforme o perfil do usuário logado.
 */
export function obterRotulosModulo(item, perfil = 'ADMIN') {
  if (item.id === 'atletas') {
    if (perfil === 'ATLETA') {
      return { label: 'Meu Perfil & Cartel', descricao: 'Meu histórico e graduação' };
    }
    if (perfil === 'TREINADOR') {
      return { label: 'Meus Atletas', descricao: 'Plantel da minha academia' };
    }
    if (perfil === 'ACADEMIA') {
      return { label: 'Atletas Filiados', descricao: 'Equipe da minha academia' };
    }
    return { label: 'Atletas & Filiações', descricao: 'Plantel estadual de atletas' };
  }

  if (item.id === 'financeiro') {
    if (perfil === 'ATLETA') {
      return { label: 'Minha Anuidade', descricao: 'Situação e regularidade' };
    }
    if (perfil === 'ACADEMIA') {
      return { label: 'Anuidade da Academia', descricao: 'Regularidade e recibo' };
    }
    return { label: 'Tesouraria & Anuidades', descricao: 'Controle financeiro geral' };
  }

  if (item.id === 'arbitragem') {
    if (perfil === 'ARBITRO') {
      return { label: 'Minhas Convocações', descricao: 'Escalas e confirmação' };
    }
    return { label: 'Escalas de Arbitragem', descricao: 'Gestão do quadro oficial' };
  }

  return { label: item.label, descricao: item.descricao };
}

export default function Sidebar({
  moduloAtivo,
  onSelecionarModulo,
  perfilUsuario = 'ADMIN',
  colapsada = false,
  onToggleColapsar,
  mobileOpen = false,
  onCloseMobile
}) {
  const modulosPermitidos = MODULOS_SISTEMA.filter(item => 
    item.perfis.includes(perfilUsuario)
  );

  const renderContent = () => (
    <div className="flex flex-col h-full bg-fmt-blue text-white select-none">
      {/* Topo da Sidebar: Status e Botão de Colapsar */}
      <div className={`p-4 border-b border-white/10 flex items-center ${colapsada ? 'justify-center' : 'justify-between'}`}>
        {!colapsada && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-fmt-red flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm tracking-wide text-white block leading-tight">
                Portal FMTTEMA
              </span>
              <span className="text-[10px] text-slate-300 font-medium">Navegação Oficial</span>
            </div>
          </div>
        )}

        {/* Botão de recolher/expandir (oculto no mobile drawer) */}
        <button
          type="button"
          onClick={onToggleColapsar}
          title={colapsada ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          className="hidden md:inline-flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {colapsada ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Lista de Itens do Menu */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {modulosPermitidos.map((item) => {
          const Icon = item.icon;
          const isAtivo = moduloAtivo === item.id;
          const rotulo = obterRotulosModulo(item, perfilUsuario);

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelecionarModulo(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              title={colapsada ? `${rotulo.label} - ${rotulo.descricao}` : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left relative group ${
                isAtivo
                  ? 'bg-white/15 text-white shadow-sm font-bold border-l-4 border-fmt-red pl-2.5'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              } ${colapsada ? 'justify-center px-0' : ''}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isAtivo ? 'text-fmt-red' : 'text-slate-300 group-hover:text-white'}`} />
              
              {!colapsada && (
                <div className="flex-1 truncate">
                  <span className="block truncate">{rotulo.label}</span>
                  <span className="block text-[10px] text-slate-400 font-normal truncate">
                    {rotulo.descricao}
                  </span>
                </div>
              )}

              {/* Tooltip flutuante quando colapsado no desktop */}
              {colapsada && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 whitespace-nowrap">
                  <span className="font-bold block">{rotulo.label}</span>
                  <span className="text-[10px] text-slate-300 block">{rotulo.descricao}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className={`p-3 border-t border-white/10 text-slate-400 text-[11px] ${colapsada ? 'text-center' : 'text-left'}`}>
        {!colapsada ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Perfil Ativo</span>
              <span className="text-xs font-mono font-bold text-white">{perfilUsuario}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
              Conectado
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-mono font-bold text-slate-300">{perfilUsuario.slice(0, 3)}</span>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Versão Desktop: Barra Fixa na lateral esquerda */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out border-r border-slate-200 shadow-sm ${
          colapsada ? 'w-20' : 'w-64'
        }`}
      >
        <div className="sticky top-20 h-[calc(100vh-5rem)]">
          {renderContent()}
        </div>
      </aside>

      {/* Versão Mobile: Drawer com Backdrop Escuro */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Gaveta Lateral */}
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 flex flex-col">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
