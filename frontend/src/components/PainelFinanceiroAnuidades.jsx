import { useState, useEffect } from 'react';
import api from '../services/api';
import ModalBaixaAnuidade from './ModalBaixaAnuidade';
import { 
  Coins, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  FileText, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  X, 
  Check, 
  Building2, 
  User 
} from 'lucide-react';

export default function PainelFinanceiroAnuidades() {
  const [anuidades, setAnuidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [beneficiarioParaPagar, setBeneficiarioParaPagar] = useState(null);
  const [comprovanteVisualizar, setComprovanteVisualizar] = useState(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS'); // TODOS, PENDENTE, PAGO
  const [filtroTipo, setFiltroTipo] = useState('TODOS'); // TODOS, ATLETA, ACADEMIA

  // Toast System (Convenção Obrigatória do Grupo)
  const [toast, setToast] = useState(null);

  const exibirToast = (tipo, mensagem) => {
    setToast({ tipo, mensagem });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const carregarAnuidades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/financeiro/anuidades');
      setAnuidades(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar anuidades:', err);
      exibirToast('erro', 'Erro ao conectar à API para listar as anuidades financeiras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAnuidades();
  }, []);

  const handleSucessoBaixa = (dadosRetorno) => {
    // Critério de conclusão: Atualiza o status na tela automaticamente
    setAnuidades((prev) =>
      prev.map((item) =>
        item.id === dadosRetorno.beneficiarioId && item.tipo === dadosRetorno.tipoBeneficiario
          ? {
              ...item,
              statusPagamento: 'PAGO',
              comprovante: dadosRetorno.comprovante
            }
          : item
      )
    );

    exibirToast(
      'sucesso',
      `Baixa confirmada com sucesso para ${dadosRetorno.beneficiarioNome}! Comprovante vinculado e receita lançada no Fluxo de Caixa.`
    );
  };

  const handleErroBaixa = (msg) => {
    exibirToast('erro', msg);
  };

  // Cálculos de Estatísticas
  const totalGeral = anuidades.length;
  const totalPagos = anuidades.filter((a) => a.statusPagamento === 'PAGO').length;
  const totalPendentes = anuidades.filter((a) => a.statusPagamento === 'PENDENTE').length;
  const percentualAdimplencia = totalGeral > 0 ? Math.round((totalPagos / totalGeral) * 100) : 0;

  // Filtragem Dinâmica
  const anuidadesFiltradas = anuidades.filter((item) => {
    const matchBusca =
      (item.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (item.documento || '').toLowerCase().includes(busca.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === 'TODOS' ? true : item.statusPagamento === filtroStatus;

    const matchTipo =
      filtroTipo === 'TODOS' ? true : item.tipo === filtroTipo;

    return matchBusca && matchStatus && matchTipo;
  });

  return (
    <div id="painel-financeiro" className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8 text-left relative">
      
      {/* Toast Flutuante (Convenção Obrigatória do Grupo) */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-semibold transition-all animate-bounceIn ${
            toast.tipo === 'sucesso'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/20'
              : 'bg-rose-600 text-white border-rose-500 shadow-rose-900/20'
          }`}
        >
          {toast.tipo === 'sucesso' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.mensagem}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2">
            <Coins className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tesouraria Oficial FMTTEMA</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
            Gestão Financeira de Anuidades
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Controle de adimplência, baixa manual com anexo de comprovante e integração atômica com o fluxo de caixa.
          </p>
        </div>

        <button
          onClick={carregarAnuidades}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* Cards de Métricas e Adimplência */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Cadastrado</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 font-heading">{totalGeral}</span>
            <span className="text-[11px] text-slate-500">filiados</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Adimplentes (Pagos)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-800 font-heading">{totalPagos}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">{percentualAdimplencia}% do total</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">Inadimplentes (Pendentes)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-800 font-heading">{totalPendentes}</span>
            <span className="text-[11px] text-amber-600 font-medium">aguardando baixa</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">Taxa de Regularidade</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-fmt-blue font-heading">{percentualAdimplencia}%</span>
            <span className="text-[11px] text-blue-600">homologados</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
        {/* Campo de Busca */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-fmt-blue"
          />
        </div>

        {/* Seletores de Filtro */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold hidden sm:inline">Status:</span>
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-fmt-blue"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="PENDENTE">Apenas Pendentes (Devendo)</option>
            <option value="PAGO">Apenas Pagos (Em dia)</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-fmt-blue"
          >
            <option value="TODOS">Atletas & Academias</option>
            <option value="ATLETA">Apenas Atletas</option>
            <option value="ACADEMIA">Apenas Academias</option>
          </select>
        </div>
      </div>

      {/* Tabela de Anuidades */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-fmt-blue" />
          <span className="text-xs font-medium">Carregando dados financeiros...</span>
        </div>
      ) : anuidadesFiltradas.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Nenhum registro financeiro encontrado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-heading font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Beneficiário</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Documento / Vínculo</th>
                <th className="px-4 py-3">Status Anuidade</th>
                <th className="px-4 py-3">Comprovante</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {anuidadesFiltradas.map((item) => {
                const isPago = item.statusPagamento === 'PAGO';

                return (
                  <tr key={`${item.tipo}_${item.id}`} className="hover:bg-slate-50/80 transition-colors">
                    {/* Beneficiário */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.tipo === 'ACADEMIA' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-fmt-blue'
                        }`}>
                          {item.tipo === 'ACADEMIA' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{item.nome}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{item.email || '-'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.tipo === 'ACADEMIA'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.tipo}
                      </span>
                    </td>

                    {/* Documento */}
                    <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                      {item.documento || item.academiaNome || '-'}
                    </td>

                    {/* Status Anuidade */}
                    <td className="px-4 py-3.5">
                      {isPago ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pago (Em dia)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pendente (Devendo)</span>
                        </span>
                      )}
                    </td>

                    {/* Comprovante */}
                    <td className="px-4 py-3.5">
                      {item.comprovante ? (
                        <button
                          onClick={() => setComprovanteVisualizar({ nome: item.nome, url: item.comprovante })}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-fmt-blue hover:text-fmt-red hover:underline cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver recibo</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Sem anexo</span>
                      )}
                    </td>

                    {/* Botão de Ação */}
                    <td className="px-4 py-3.5 text-right">
                      {!isPago ? (
                        <button
                          onClick={() => setBeneficiarioParaPagar(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirmar Pagamento</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Regularizado</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Baixa Manual */}
      {beneficiarioParaPagar && (
        <ModalBaixaAnuidade
          beneficiario={beneficiarioParaPagar}
          onClose={() => setBeneficiarioParaPagar(null)}
          onSuccess={handleSucessoBaixa}
          onError={handleErroBaixa}
        />
      )}

      {/* Modal para Visualização Rápida de Comprovante */}
      {comprovanteVisualizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-heading font-extrabold text-base text-fmt-blue">
                Comprovante de Pagamento
              </h3>
              <button
                onClick={() => setComprovanteVisualizar(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Beneficiário: <strong className="text-slate-800">{comprovanteVisualizar.nome}</strong>
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono break-all text-slate-700 mb-4">
              {comprovanteVisualizar.url}
            </div>

            <div className="flex items-center justify-end gap-2">
              {comprovanteVisualizar.url.startsWith('http') && (
                <a
                  href={comprovanteVisualizar.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-fmt-blue text-white text-xs font-semibold hover:bg-fmt-blue-hover"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir Link Externo</span>
                </a>
              )}
              <button
                onClick={() => setComprovanteVisualizar(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
