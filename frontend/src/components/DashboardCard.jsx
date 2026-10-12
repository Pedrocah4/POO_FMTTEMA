import { ArrowRight } from 'lucide-react';

export default function DashboardCard({
  title,
  description,
  icon: Icon,
  badge,
  actionText = 'Acessar módulo',
  onAction,
  stat,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-6 flex flex-col justify-between text-left group">
      <div>
        {/* Topo do card: Ícone + Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-fmt-blue-light text-fmt-blue flex items-center justify-center group-hover:scale-105 transition-transform">
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          {badge && (
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {badge}
            </span>
          )}
        </div>

        {/* Título no Azul da Federação (#002868) */}
        <h3 className="font-heading font-bold text-lg text-fmt-blue leading-snug group-hover:text-fmt-blue-hover transition-colors">
          {title}
        </h3>

        {/* Descrição limpa */}
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          {description}
        </p>

        {/* Dado ou Estatística Opcional */}
        {stat && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline gap-2">
            <span className="text-2xl font-heading font-bold text-fmt-dark">{stat.value}</span>
            <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
          </div>
        )}
      </div>

      {/* Botão de Ação no Vermelho da Federação (#D91C22) */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onAction}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-fmt-red hover:bg-fmt-red-hover active:scale-[0.99] shadow-sm transition-all cursor-pointer"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
