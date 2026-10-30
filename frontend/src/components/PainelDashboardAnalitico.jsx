import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  ShieldCheck,
  Scale
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function PainelDashboardAnalitico() {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  const carregarResumo = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/dashboard/resumo');
      setResumo(response.data);
      setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Erro ao carregar resumo do dashboard:', err);
      setError('Não foi possível obter os dados analíticos da federação.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarResumo();
  }, [carregarResumo]);

  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Cores institucionais para gráficos
  const CORES_GRAFICOS = ['#002868', '#D91C22', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

  // Dados para o Gráfico de Origem Financeira
  const dadosFinanceiros = resumo ? [
    { name: 'Anuidades Atletas', valor: resumo.receitaAnuidadesAtletas || 0, color: '#002868' },
    { name: 'Anuidades Academias', valor: resumo.receitaAnuidadesAcademias || 0, color: '#2563eb' },
    { name: 'Despesas Operacionais', valor: resumo.totalDespesas || 0, color: '#D91C22' }
  ].filter(d => d.valor > 0) : [];

  // Dados para o Gráfico de Adimplência
  const dadosAdimplencia = resumo ? [
    { name: 'Atletas Adimplentes', valor: resumo.atletasAdimplentes || 0, color: '#10b981' },
    { name: 'Atletas Inadimplentes', valor: resumo.atletasInadimplentes || 0, color: '#f59e0b' }
  ].filter(d => d.valor > 0) : [];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 mb-8 text-left animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-lg"></div>
          <div className="h-64 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left flex items-start justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h3 className="font-heading font-bold text-sm text-red-800">Falha na Conexão Analítica</h3>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={() => carregarResumo(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!resumo) return null;

  return (
    <section className="mb-8 text-left" id="painel-analitico">
      {/* Cabeçalho da Seção Analítica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-fmt-blue uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-fmt-blue" />
            <span>Painel de Inteligência Analítica</span>
          </div>
          <h2 className="font-heading font-bold text-xl text-fmt-blue">
            Métricas e Indicadores da Federação
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dados e totais consolidados da administração esportiva e financeira.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {ultimaAtualizacao && (
            <span className="text-[11px] text-slate-400 font-mono">
              Sincronizado às {ultimaAtualizacao}
            </span>
          )}
          <button
            onClick={() => carregarResumo(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-fmt-blue text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-60"
            title="Recalcular métricas analíticas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-fmt-blue' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Principais de Topo (Responsivos: Empilhados no mobile, 4 colunas no PC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Card 1: Receita Total */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Receita Total
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            {formatarMoeda(resumo.receitaTotal)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              Saldo: {formatarMoeda(resumo.saldoLiquido)}
            </span>
            <span className="text-[11px] text-slate-400">
              Despesas: {formatarMoeda(resumo.totalDespesas)}
            </span>
          </div>
        </div>

        {/* Card 2: Total de Atletas */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 hover:border-blue-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Atletas Filiados
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            {resumo.totalAtletas || 0}
            <span className="text-xs font-normal text-slate-400 ml-1.5">competidores</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold">
              {resumo.atletasAtivos || 0} ativos
            </span>
            <span className="text-amber-600 font-medium">
              {resumo.atletasPendentes || 0} em aprovação
            </span>
          </div>
        </div>

        {/* Card 3: Academias Filiadas */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 hover:border-indigo-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Academias & CTs
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            {resumo.totalAcademias || 0}
            <span className="text-xs font-normal text-slate-400 ml-1.5">entidades</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold">
              {resumo.academiasAtivas || 0} ativas
            </span>
            <span className="text-slate-400">
              {resumo.academiasAdimplentes || 0} adimplentes
            </span>
          </div>
        </div>

        {/* Card 4: Taxa de Adimplência */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 hover:border-amber-300 transition group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Adimplência Geral
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-105 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            {resumo.taxaAdimplencia !== undefined ? `${resumo.taxaAdimplencia}%` : '100%'}
          </div>
          {/* Barra de progresso visual */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, resumo.taxaAdimplencia || 0))}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span className="text-emerald-700 font-medium">{resumo.atletasAdimplentes || 0} em dia</span>
            <span className="text-amber-600 font-medium">{resumo.atletasInadimplentes || 0} pendentes</span>
          </div>
        </div>
      </div>

      {/* Faixa Complementar de Indicadores Operacionais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-white border border-slate-200/90 rounded-lg shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Árbitros</span>
            <span className="text-sm font-bold text-slate-800">{resumo.totalArbitros || 0} oficiais</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200/90 rounded-lg shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Eventos 2026</span>
            <span className="text-sm font-bold text-slate-800">
              {resumo.totalEventos || 0} <span className="text-xs text-emerald-600 font-semibold">({resumo.eventosAtivos || 0} ativos)</span>
            </span>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200/90 rounded-lg shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Inscrições</span>
            <span className="text-sm font-bold text-slate-800">{resumo.totalInscricoes || 0} em lutas</span>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200/90 rounded-lg shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <ShieldCheck className="w-4 h-4 text-fmt-blue" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Anuidades Atletas</span>
            <span className="text-sm font-bold text-slate-800">{formatarMoeda(resumo.receitaAnuidadesAtletas)}</span>
          </div>
        </div>
      </div>

      {/* Seção de Gráficos Visuais com Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Distribuição de Atletas por Graduação (Prajied / Kruang) */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-sm text-fmt-blue flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-fmt-red" />
                Atletas por Graduação (Prajied)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Distribuição homologada por nível técnico de graduação
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {resumo.distribuicaoGraduacao?.length || 0} níveis
            </span>
          </div>

          <div className="h-64 w-full">
            {resumo.distribuicaoGraduacao && resumo.distribuicaoGraduacao.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={resumo.distribuicaoGraduacao}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="rotulo"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(valor) => [`${valor} atletas`, 'Quantidade']}
                  />
                  <Bar
                    dataKey="quantidade"
                    fill="#002868"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
                Nenhum dado de graduação registrado ainda
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Composição Financeira e Origem das Receitas */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-sm text-fmt-blue flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-emerald-600" />
                Origem Financeira e Despesas
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Valores consolidados de entradas vs despesas operacionais
              </p>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              {formatarMoeda(resumo.saldoLiquido)} líq.
            </span>
          </div>

          <div className="h-64 w-full">
            {dadosFinanceiros.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosFinanceiros}
                    dataKey="valor"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {dadosFinanceiros.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(valor) => [formatarMoeda(valor), 'Total']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <PieChartIcon className="w-8 h-8 mb-2 opacity-40" />
                Sem movimentações financeiras consolidadas
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
