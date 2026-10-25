import MainLayout from '../components/MainLayout';
import ArvoreTorneio from '../components/ArvoreTorneio';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChavesTorneio() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Botão de Retorno ao Dashboard */}
        <div className="flex items-center justify-between text-left">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-fmt-blue transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar ao Painel Geral</span>
          </button>
        </div>

        {/* Árvore do Torneio */}
        <ArvoreTorneio />

      </div>
    </MainLayout>
  );
}
