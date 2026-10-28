import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { resolverUrlLogo, normalizarSiteUrl } from './VitrineParceiros';
import {
  Handshake,
  Plus,
  Upload,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  X,
  Image as ImageIcon,
  Sparkles,
  Award,
  Search,
  LayoutGrid,
  GalleryHorizontalEnd,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const CATEGORIAS_PATROCINIO = [
  'Patrocinador Master',
  'Patrocinador Ouro',
  'Material Esportivo',
  'Nutrição Esportiva',
  'Saúde e Performance',
  'Apoio Institucional',
  'Apoiador Oficial'
];

export default function PainelComercialParceiros() {
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estado do Formulário de Cadastro / Edição
  const [editandoId, setEditandoId] = useState(null);
  const [nome, setNome] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [categoria, setCategoria] = useState('Patrocinador Master');
  const [ordemExibicao, setOrdemExibicao] = useState(1);
  const [ativo, setAtivo] = useState(true);

  // Modo de Logomarca: 'URL' ou 'ARQUIVO'
  const [modoLogo, setModoLogo] = useState('URL');
  const [logoUrl, setLogoUrl] = useState('');
  const [arquivoLogo, setArquivoLogo] = useState(null);
  const [previewArquivo, setPreviewArquivo] = useState('');
  const fileInputRef = useRef(null);

  // Filtros e Visualização (Grid ou Carrossel)
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS'); // TODOS, ATIVOS, INATIVOS
  const [modoVisualizacao, setModoVisualizacao] = useState('GRID'); // GRID | CARROSSEL
  const [indiceCarrossel, setIndiceCarrossel] = useState(0);
  const [confirmarExclusao, setConfirmarExclusao] = useState(null);
  const [imagensComErro, setImagensComErro] = useState({});

  // Toast System (Convenção Obrigatória do Grupo)
  const [toast, setToast] = useState(null);

  const exibirToast = (tipo, mensagem) => {
    setToast({ tipo, mensagem });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const notificarVitrinePublica = () => {
    window.dispatchEvent(new CustomEvent('patrocinadores:atualizado'));
  };

  const carregarPatrocinadores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patrocinadores');
      const lista = Array.isArray(response.data) ? response.data : [];
      setPatrocinadores(lista);
      if (!editandoId) {
        setOrdemExibicao(lista.length + 1);
      }
    } catch (err) {
      console.error('Erro ao carregar patrocinadores:', err);
      exibirToast('erro', 'Erro ao conectar à API para listar os patrocinadores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPatrocinadores();
  }, []);

  const limparFormulario = (proximaOrdem = patrocinadores.length + 1) => {
    setEditandoId(null);
    setNome('');
    setSiteUrl('');
    setCategoria('Patrocinador Master');
    setOrdemExibicao(proximaOrdem);
    setAtivo(true);
    setModoLogo('URL');
    setLogoUrl('');
    setArquivoLogo(null);
    setPreviewArquivo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelecionarArquivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivoLogo(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewArquivo(objectUrl);
  };

  const handleGerarLogoExemplo = () => {
    const texto = (nome.trim() || 'PARCEIRO FMTTEMA').toUpperCase().replace(/\s+/g, '+');
    const cores = ['002868', 'D91C22', '0f172a', '059669', '7c3aed'];
    const cor = cores[Math.floor(Math.random() * cores.length)];
    setModoLogo('URL');
    setLogoUrl(`https://placehold.co/320x120/${cor}/FFFFFF?text=${encodeURIComponent(texto)}`);
    if (!siteUrl.trim()) {
      const slug = (nome.trim() || 'parceiro').toLowerCase().replace(/[^a-z0-9]/g, '');
      setSiteUrl(`https://www.${slug || 'parceirofmttema'}.com.br`);
    }
  };

  const handleIniciarEdicao = (parceiro) => {
    setEditandoId(parceiro.id);
    setNome(parceiro.nome || '');
    setSiteUrl(parceiro.siteUrl || '');
    setCategoria(parceiro.categoria || 'Patrocinador Master');
    setOrdemExibicao(parceiro.ordemExibicao ?? 1);
    setAtivo(parceiro.ativo ?? true);
    setModoLogo('URL');
    setLogoUrl(parceiro.logoUrl || '');
    setArquivoLogo(null);
    setPreviewArquivo('');
    document.getElementById('form-patrocinador')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome.trim()) {
      exibirToast('erro', 'O nome do patrocinador é obrigatório.');
      return;
    }

    if (modoLogo === 'URL' && !logoUrl.trim()) {
      exibirToast('erro', 'Informe o link direto da logomarca ou selecione o modo Upload de Arquivo.');
      return;
    }

    if (modoLogo === 'ARQUIVO' && !arquivoLogo && !editandoId) {
      exibirToast('erro', 'Selecione um arquivo de imagem (PNG, JPG, WEBP, SVG) para a logomarca.');
      return;
    }

    const dadosDto = {
      nome: nome.trim(),
      siteUrl: normalizarSiteUrl(siteUrl) || '',
      logoUrl: modoLogo === 'URL' ? logoUrl.trim() : (logoUrl.trim() || null),
      categoria: categoria || 'Apoiador Oficial',
      ativo: Boolean(ativo),
      ordemExibicao: Number(ordemExibicao) || 1
    };

    try {
      setSubmitting(true);
      let response;

      if (modoLogo === 'ARQUIVO' && arquivoLogo) {
        const formData = new FormData();
        formData.append(
          'dados',
          new Blob([JSON.stringify(dadosDto)], { type: 'application/json' })
        );
        formData.append('arquivo', arquivoLogo);

        if (editandoId) {
          response = await api.put(`/api/patrocinadores/${editandoId}/com-arquivo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          response = await api.post('/api/patrocinadores/com-arquivo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      } else {
        if (editandoId) {
          response = await api.put(`/api/patrocinadores/${editandoId}`, dadosDto);
        } else {
          response = await api.post('/api/patrocinadores', dadosDto);
        }
      }

      const salvo = response.data;

      if (editandoId) {
        setPatrocinadores((prev) => prev.map((item) => (item.id === salvo.id ? salvo : item)));
        exibirToast('sucesso', `Parceiro "${salvo.nome}" atualizado com sucesso!`);
      } else {
        setPatrocinadores((prev) => [...prev, salvo]);
        exibirToast('sucesso', `Patrocinador "${salvo.nome}" cadastrado e publicado na vitrine!`);
      }

      limparFormulario(patrocinadores.length + (editandoId ? 1 : 2));
      notificarVitrinePublica();
    } catch (err) {
      console.error('Erro ao salvar patrocinador:', err);
      const msg =
        err.response?.data?.mensagem ||
        err.response?.data?.erro ||
        'Falha ao salvar patrocinador. Verifique os dados e tente novamente.';
      exibirToast('erro', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAlternarStatus = async (parceiro) => {
    try {
      const novoStatus = !parceiro.ativo;
      const response = await api.patch(
        `/api/patrocinadores/${parceiro.id}/status?ativo=${novoStatus}`
      );
      const atualizado = response.data;
      setPatrocinadores((prev) =>
        prev.map((item) => (item.id === atualizado.id ? atualizado : item))
      );
      exibirToast(
        'sucesso',
        `Visibilidade de "${atualizado.nome}" alterada para ${atualizado.ativo ? 'Ativo na Vitrine' : 'Oculto'}.`
      );
      notificarVitrinePublica();
    } catch (err) {
      console.error('Erro ao alterar status do patrocinador:', err);
      exibirToast('erro', 'Não foi possível alterar o status de visibilidade do parceiro.');
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!confirmarExclusao) return;
    try {
      await api.delete(`/api/patrocinadores/${confirmarExclusao.id}`);
      setPatrocinadores((prev) => prev.filter((item) => item.id !== confirmarExclusao.id));
      exibirToast('sucesso', `Patrocinador "${confirmarExclusao.nome}" removido com sucesso.`);
      setConfirmarExclusao(null);
      notificarVitrinePublica();
    } catch (err) {
      console.error('Erro ao excluir patrocinador:', err);
      exibirToast('erro', 'Não foi possível excluir o patrocinador selecionado.');
    }
  };

  // Estatísticas
  const totalParceiros = patrocinadores.length;
  const totalAtivos = patrocinadores.filter((p) => p.ativo).length;
  const totalInativos = totalParceiros - totalAtivos;
  const totalMasterOuro = patrocinadores.filter((p) => {
    const c = (p.categoria || '').toLowerCase();
    return c.includes('master') || c.includes('ouro');
  }).length;

  // Filtragem
  const parceirosFiltrados = patrocinadores.filter((p) => {
    const matchBusca =
      (p.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
      (p.categoria || '').toLowerCase().includes(busca.toLowerCase()) ||
      (p.siteUrl || '').toLowerCase().includes(busca.toLowerCase());

    const matchStatus =
      filtroStatus === 'TODOS'
        ? true
        : filtroStatus === 'ATIVOS'
        ? Boolean(p.ativo)
        : !p.ativo;

    return matchBusca && matchStatus;
  });

  // Preview da imagem no formulário
  const urlPreviewFormulario =
    modoLogo === 'ARQUIVO'
      ? previewArquivo
      : logoUrl.trim()
      ? resolverUrlLogo(logoUrl)
      : '';

  const obterItensCarrosselAdmin = () => {
    if (parceirosFiltrados.length <= 3) return parceirosFiltrados;
    const itens = [];
    for (let i = 0; i < 3; i++) {
      itens.push(parceirosFiltrados[(indiceCarrossel + i) % parceirosFiltrados.length]);
    }
    return itens;
  };

  const renderCardParceiroAdmin = (parceiro) => {
    const linkExterno = normalizarSiteUrl(parceiro.siteUrl);
    const imgUrl = resolverUrlLogo(parceiro.logoUrl);
    const erroImg = imagensComErro[parceiro.id] || !imgUrl;

    return (
      <div
        key={parceiro.id}
        className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
          parceiro.ativo
            ? 'bg-white border-slate-200/90 shadow-xs hover:border-fmt-blue/40 hover:shadow-md'
            : 'bg-slate-50/80 border-slate-200 opacity-75'
        }`}
      >
        {/* Cabeçalho do Card: Categoria + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-fmt-blue border border-blue-200 truncate">
            {parceiro.categoria || 'Apoiador Oficial'}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
              parceiro.ativo
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-200 text-slate-600 border-slate-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                parceiro.ativo ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            ></span>
            {parceiro.ativo ? 'Ativo' : 'Oculto'}
          </span>
        </div>

        {/* Logomarca Alinhada e Clicável (Convenção Obrigatória: target="_blank") */}
        {linkExterno ? (
          <a
            href={linkExterno}
            target="_blank"
            rel="noopener noreferrer"
            title={`Abrir ${linkExterno} em nova aba`}
            className="group relative w-full h-28 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-3 overflow-hidden hover:bg-white hover:border-fmt-blue transition-all"
          >
            {!erroImg ? (
              <img
                src={imgUrl}
                alt={`Logomarca ${parceiro.nome}`}
                onError={() =>
                  setImagensComErro((prev) => ({ ...prev, [parceiro.id]: true }))
                }
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-fmt-blue/10 text-fmt-blue flex items-center justify-center font-heading font-extrabold text-sm mb-1">
                  {parceiro.nome?.substring(0, 2).toUpperCase() || 'FM'}
                </div>
                <span className="text-xs font-bold text-fmt-blue">{parceiro.nome}</span>
              </div>
            )}
            <span className="absolute bottom-1.5 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-fmt-blue/90 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Visitar</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </a>
        ) : (
          <div className="w-full h-28 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center p-3 overflow-hidden">
            {!erroImg ? (
              <img
                src={imgUrl}
                alt={`Logomarca ${parceiro.nome}`}
                onError={() =>
                  setImagensComErro((prev) => ({ ...prev, [parceiro.id]: true }))
                }
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs font-bold text-slate-600">{parceiro.nome}</span>
            )}
          </div>
        )}

        {/* Informações do Parceiro */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
              {parceiro.nome}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">
              #{parceiro.ordemExibicao ?? 0}
            </span>
          </div>

          {linkExterno ? (
            <a
              href={linkExterno}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-fmt-blue hover:text-fmt-red hover:underline mt-0.5 truncate max-w-full"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{linkExterno}</span>
            </a>
          ) : (
            <span className="block text-[11px] text-slate-400 italic mt-0.5">
              Sem site externo vinculado
            </span>
          )}
        </div>

        {/* Barra de Ações Administrativas */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => handleAlternarStatus(parceiro)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
              parceiro.ativo
                ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
            title={parceiro.ativo ? 'Ocultar da vitrine' : 'Ativar na vitrine'}
          >
            {parceiro.ativo ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ocultar</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Ativar</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleIniciarEdicao(parceiro)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-fmt-blue hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
              title="Editar patrocinador"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmarExclusao(parceiro)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
              title="Excluir patrocinador"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      id="painel-comercial"
      className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8 text-left relative"
    >
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
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabeçalho do Módulo Comercial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-fmt-blue text-xs font-semibold mb-2">
            <Handshake className="w-3.5 h-3.5 text-fmt-red" />
            <span>Módulo Comercial & Marketing Esportivo</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-fmt-blue">
            Gestão de Patrocinadores e Exibição de Parceiros (US11)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cadastre marcas parceiras via link direto ou upload de logomarca e gerencie o carrossel/grid institucional da Federação.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarPatrocinadores}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Parceiros</span>
        </button>
      </div>

      {/* Cards de Resumo Comercial */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total de Parceiros
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-800 font-heading">{totalParceiros}</span>
            <span className="text-[11px] text-slate-500">marcas registradas</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Ativos na Vitrine
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-800 font-heading">{totalAtivos}</span>
            <span className="text-[11px] text-emerald-600 font-semibold">visíveis nas telas</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/90">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
            Cotas Master & Ouro
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-800 font-heading">{totalMasterOuro}</span>
            <span className="text-[11px] text-amber-600 font-medium">destaques principais</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-fmt-blue block">
            Ocultos / Inativos
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-fmt-blue font-heading">{totalInativos}</span>
            <span className="text-[11px] text-blue-600">fora de exibição</span>
          </div>
        </div>
      </div>

      {/* Layout Principal: Formulário de Cadastro (Esquerda) + Grid/Carrossel de Parceiros (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna 1: Formulário Administrativo de Cadastro / Edição (5 colunas no desktop) */}
        <div
          id="form-patrocinador"
          className="lg:col-span-5 bg-slate-50/80 rounded-xl border border-slate-200 p-5"
        >
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-fmt-blue text-white flex items-center justify-center">
                {editandoId ? <Edit3 className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
              </div>
              <h3 className="font-heading font-extrabold text-sm text-fmt-blue">
                {editandoId ? 'Editar Patrocinador' : 'Novo Patrocinador / Parceiro'}
              </h3>
            </div>

            {editandoId && (
              <button
                type="button"
                onClick={() => limparFormulario()}
                className="text-[11px] font-semibold text-slate-500 hover:text-fmt-red cursor-pointer"
              >
                Cancelar edição
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome da Marca / Empresa */}
            <div>
              <label
                htmlFor="input-nome-patrocinador"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Nome da Marca / Patrocinador *
              </label>
              <input
                id="input-nome-patrocinador"
                type="text"
                required
                maxLength={150}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Top King Boxing Brasil"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
              />
            </div>

            {/* Site Oficial do Parceiro */}
            <div>
              <label
                htmlFor="input-site-patrocinador"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                Site Oficial do Parceiro (abre em nova aba)
              </label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  id="input-site-patrocinador"
                  type="text"
                  maxLength={500}
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://www.empresa-parceira.com.br"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
                />
              </div>
            </div>

            {/* Categoria e Ordem */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label
                  htmlFor="select-categoria-patrocinador"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Cota / Categoria
                </label>
                <select
                  id="select-categoria-patrocinador"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-fmt-blue"
                >
                  {CATEGORIAS_PATROCINIO.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="input-ordem-patrocinador"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Ordem
                </label>
                <input
                  id="input-ordem-patrocinador"
                  type="number"
                  min={0}
                  max={999}
                  value={ordemExibicao}
                  onChange={(e) => setOrdemExibicao(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
                />
              </div>
            </div>

            {/* Seletor de Origem da Logomarca: Link Direto vs Upload de Arquivo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Logomarca do Parceiro *
                </label>
                <button
                  type="button"
                  onClick={handleGerarLogoExemplo}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-fmt-blue hover:text-fmt-red cursor-pointer"
                  title="Preencher automaticamente com um banner de teste"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Gerar logo de teste</span>
                </button>
              </div>

              {/* Abas de Modo */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-lg mb-2.5">
                <button
                  type="button"
                  onClick={() => setModoLogo('URL')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    modoLogo === 'URL'
                      ? 'bg-white text-fmt-blue shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link da Imagem</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModoLogo('ARQUIVO')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    modoLogo === 'ARQUIVO'
                      ? 'bg-white text-fmt-blue shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Local</span>
                </button>
              </div>

              {modoLogo === 'URL' ? (
                <input
                  id="input-logo-url"
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://site.com.br/logomarca.png"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
                />
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 bg-white text-center hover:border-fmt-blue transition-colors">
                  <input
                    ref={fileInputRef}
                    id="input-logo-arquivo"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.svg,.gif,image/*"
                    onChange={handleSelecionarArquivo}
                    className="hidden"
                  />
                  <label
                    htmlFor="input-logo-arquivo"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <Upload className="w-5 h-5 text-fmt-blue" />
                    <span className="text-xs font-semibold text-slate-700">
                      {arquivoLogo ? arquivoLogo.name : 'Clique para enviar imagem da logomarca'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Formatos aceitos: PNG, JPG, WEBP, SVG ou GIF
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Pré-visualização Instantânea da Logomarca */}
            {urlPreviewFormulario && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                <div className="w-20 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img
                    src={urlPreviewFormulario}
                    alt="Preview Logomarca"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Pré-visualização da Vitrine
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate block">
                    {nome || 'Nome do Parceiro'}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate block">
                    {categoria}
                  </span>
                </div>
              </div>
            )}

            {/* Checkbox Status Ativo */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                className="w-4 h-4 rounded text-fmt-blue focus:ring-fmt-blue border-slate-300"
              />
              <span className="text-xs font-medium text-slate-700">
                Exibir imediatamente na vitrine pública de parceiros
              </span>
            </label>

            {/* Botão de Submissão */}
            <button
              id="btn-salvar-patrocinador"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-fmt-red hover:bg-fmt-red-hover text-white font-heading font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando Parceiro...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{editandoId ? 'Salvar Alterações' : 'Cadastrar Patrocinador'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Coluna 2: Vitrine Gerenciável - Grid e Carrossel de Logomarcas (7 colunas no desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barra de Busca, Filtro e Alternador Grid/Carrossel */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar parceiro por nome ou categoria..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-fmt-blue"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-fmt-blue"
              >
                <option value="TODOS">Todos ({totalParceiros})</option>
                <option value="ATIVOS">Ativos ({totalAtivos})</option>
                <option value="INATIVOS">Ocultos ({totalInativos})</option>
              </select>

              <div className="inline-flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setModoVisualizacao('GRID')}
                  className={`p-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    modoVisualizacao === 'GRID'
                      ? 'bg-white text-fmt-blue shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Visualizar em Grid Alinhado"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setModoVisualizacao('CARROSSEL')}
                  className={`p-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    modoVisualizacao === 'CARROSSEL'
                      ? 'bg-white text-fmt-blue shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Visualizar em Carrossel"
                >
                  <GalleryHorizontalEnd className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Parceiros em Grid ou Carrossel */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200 rounded-xl">
              <RefreshCw className="w-7 h-7 animate-spin text-fmt-blue" />
              <span className="text-xs font-medium">Carregando logomarcas parceiras...</span>
            </div>
          ) : parceirosFiltrados.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                Nenhum patrocinador encontrado com os filtros selecionados.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Utilize o formulário ao lado para cadastrar um novo parceiro comercial.
              </p>
            </div>
          ) : modoVisualizacao === 'GRID' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {parceirosFiltrados.map((parceiro) => renderCardParceiroAdmin(parceiro))}
            </div>
          ) : (
            /* Modo Carrossel no Painel Admin */
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-fmt-blue flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-fmt-red" />
                  <span>Simulação do Carrossel de Logomarcas</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setIndiceCarrossel(
                        (prev) => (prev - 1 + parceirosFiltrados.length) % parceirosFiltrados.length
                      )
                    }
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-fmt-blue hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setIndiceCarrossel((prev) => (prev + 1) % parceirosFiltrados.length)
                    }
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-fmt-blue hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {obterItensCarrosselAdmin().map((parceiro) => renderCardParceiroAdmin(parceiro))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {confirmarExclusao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-heading font-extrabold text-base text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Remover Patrocinador</span>
              </h3>
              <button
                type="button"
                onClick={() => setConfirmarExclusao(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Tem certeza que deseja excluir o parceiro{' '}
              <strong className="text-slate-900">{confirmarExclusao.nome}</strong>? Sua logomarca
              deixará de ser exibida na vitrine comercial da FMTTEMA.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmarExclusao(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

