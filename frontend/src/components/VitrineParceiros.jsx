import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  Handshake,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  GalleryHorizontalEnd,
  Sparkles,
  Award
} from 'lucide-react';

/**
 * Resolve o caminho da logomarca (suporta URLs externas http/https, data URIs
 * ou caminhos estáticos locais retornados pelo upload do backend como /uploads/patrocinadores/...).
 */
export function resolverUrlLogo(logoUrl) {
  if (!logoUrl) return '';
  const trimmed = logoUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const baseUrl = (api.defaults.baseURL || 'http://localhost:8080').replace(/\/$/, '');
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${path}`;
}

/**
 * Normaliza o link do site do parceiro garantindo protocolo http/https para abertura em nova guia.
 */
export function normalizarSiteUrl(siteUrl) {
  if (!siteUrl || !siteUrl.trim()) return null;
  const trimmed = siteUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function VitrineParceiros({ compact = false }) {
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoExibicao, setModoExibicao] = useState('GRID'); // 'GRID' | 'CARROSSEL'
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [imagensComErro, setImagensComErro] = useState({});

  const carregarParceirosAtivos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/patrocinadores/ativos');
      setParceiros(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Erro ao carregar vitrine de patrocinadores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarParceirosAtivos();

    const handleAtualizacao = () => {
      carregarParceirosAtivos();
    };

    window.addEventListener('patrocinadores:atualizado', handleAtualizacao);
    return () => {
      window.removeEventListener('patrocinadores:atualizado', handleAtualizacao);
    };
  }, [carregarParceirosAtivos]);

  // Rotação automática quando no modo Carrossel
  useEffect(() => {
    if (modoExibicao !== 'CARROSSEL' || parceiros.length <= 1 || pausado) return;

    const timer = setInterval(() => {
      setIndiceAtivo((prev) => (prev + 1) % parceiros.length);
    }, 3800);

    return () => clearInterval(timer);
  }, [modoExibicao, parceiros.length, pausado]);

  const avancarSlide = () => {
    if (parceiros.length === 0) return;
    setIndiceAtivo((prev) => (prev + 1) % parceiros.length);
  };

  const voltarSlide = () => {
    if (parceiros.length === 0) return;
    setIndiceAtivo((prev) => (prev - 1 + parceiros.length) % parceiros.length);
  };

  const registrarErroImagem = (id) => {
    setImagensComErro((prev) => ({ ...prev, [id]: true }));
  };

  const getBadgeCategoria = (categoria) => {
    const cat = (categoria || '').toLowerCase();
    if (cat.includes('master')) {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    if (cat.includes('ouro') || cat.includes('premium')) {
      return 'bg-yellow-50 text-yellow-800 border-yellow-300';
    }
    if (cat.includes('institucional')) {
      return 'bg-blue-50 text-fmt-blue border-blue-200';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  if (loading && parceiros.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (parceiros.length === 0) {
    return null;
  }

  // Calcula itens visíveis no carrossel (janela deslizante de até 3 itens em telas maiores)
  const obterItensCarrossel = () => {
    if (parceiros.length <= 3) return parceiros;
    const itens = [];
    for (let i = 0; i < 3; i++) {
      itens.push(parceiros[(indiceAtivo + i) % parceiros.length]);
    }
    return itens;
  };

  const renderCardParceiro = (parceiro, destaqueCarrossel = false) => {
    const urlDestino = normalizarSiteUrl(parceiro.siteUrl);
    const urlImagem = resolverUrlLogo(parceiro.logoUrl);
    const falhouImagem = imagensComErro[parceiro.id] || !urlImagem;

    const conteudoCard = (
      <div
        className={`group relative flex flex-col items-center justify-between rounded-xl border bg-white p-4 transition-all duration-200 h-full ${
          destaqueCarrossel
            ? 'border-fmt-blue/30 shadow-md hover:border-fmt-blue hover:shadow-lg'
            : 'border-slate-200/90 shadow-xs hover:border-fmt-blue/50 hover:shadow-md hover:-translate-y-0.5'
        }`}
      >
        {/* Topo: Categoria e ícone de link externo */}
        <div className="w-full flex items-center justify-between gap-2 mb-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border truncate ${getBadgeCategoria(
              parceiro.categoria
            )}`}
          >
            {parceiro.categoria || 'Parceiro Oficial'}
          </span>

          {urlDestino && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-fmt-blue transition-colors shrink-0"
              title="Abre em nova guia"
            >
              <ExternalLink className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* Área Central da Logomarca Alinhada */}
        <div className="w-full h-20 sm:h-24 flex items-center justify-center p-2 my-1 rounded-lg bg-slate-50/80 border border-slate-100 group-hover:bg-white transition-colors overflow-hidden">
          {!falhouImagem ? (
            <img
              src={urlImagem}
              alt={`Logomarca ${parceiro.nome}`}
              onError={() => registrarErroImagem(parceiro.id)}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-2">
              <div className="w-9 h-9 rounded-full bg-fmt-blue/10 text-fmt-blue flex items-center justify-center font-heading font-extrabold text-xs mb-1">
                {parceiro.nome?.substring(0, 2).toUpperCase() || 'FM'}
              </div>
              <span className="font-heading font-bold text-xs text-fmt-blue line-clamp-1">
                {parceiro.nome}
              </span>
            </div>
          )}
        </div>

        {/* Rodapé do Card: Nome e Call to Action */}
        <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-1">
          <span className="font-heading font-bold text-xs text-slate-800 group-hover:text-fmt-blue truncate">
            {parceiro.nome}
          </span>
          {urlDestino ? (
            <span className="text-[10px] font-semibold text-fmt-blue group-hover:underline shrink-0">
              Visitar site &rarr;
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 shrink-0">Oficial</span>
          )}
        </div>
      </div>
    );

    // Convenção Obrigatória do Grupo: O link de redirecionamento deve obrigatoriamente abrir em nova aba (target="_blank")
    if (urlDestino) {
      return (
        <a
          key={parceiro.id}
          href={urlDestino}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full focus:outline-none focus:ring-2 focus:ring-fmt-blue rounded-xl"
          title={`Visitar site oficial de ${parceiro.nome} em nova aba`}
        >
          {conteudoCard}
        </a>
      );
    }

    return (
      <div key={parceiro.id} className="h-full">
        {conteudoCard}
      </div>
    );
  };

  return (
    <section
      aria-label="Patrocinadores e Parceiros Oficiais FMTTEMA"
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'my-6' : 'mt-10 mb-4'}`}
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 text-left">
        {/* Cabeçalho da Vitrine Comercial */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fmt-blue/10 border border-fmt-blue/20 flex items-center justify-center text-fmt-blue shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-fmt-red">
                <Award className="w-3.5 h-3.5" />
                <span>Vitrine Comercial Oficial</span>
              </div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-fmt-blue leading-tight">
                Patrocinadores e Parceiros Institucionais
              </h3>
            </div>
          </div>

          {/* Controles de Alternância Grid / Carrossel */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setModoExibicao('GRID')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  modoExibicao === 'GRID'
                    ? 'bg-white text-fmt-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setModoExibicao('CARROSSEL')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  modoExibicao === 'CARROSSEL'
                    ? 'bg-white text-fmt-blue shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GalleryHorizontalEnd className="w-3.5 h-3.5" />
                <span>Carrossel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Exibição em Modo GRID Alinhado */}
        {modoExibicao === 'GRID' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
            {parceiros.map((parceiro) => renderCardParceiro(parceiro, false))}
          </div>
        ) : (
          /* Exibição em Modo CARROSSEL Interativo */
          <div
            className="relative"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
          >
            <div className="flex items-center gap-3">
              {parceiros.length > 1 && (
                <button
                  type="button"
                  onClick={voltarSlide}
                  aria-label="Parceiro anterior"
                  className="p-2 rounded-full bg-slate-100 hover:bg-fmt-blue hover:text-white text-slate-700 border border-slate-200 transition-colors shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                {obterItensCarrossel().map((parceiro, idx) =>
                  renderCardParceiro(parceiro, idx === 0)
                )}
              </div>

              {parceiros.length > 1 && (
                <button
                  type="button"
                  onClick={avancarSlide}
                  aria-label="Próximo parceiro"
                  className="p-2 rounded-full bg-slate-100 hover:bg-fmt-blue hover:text-white text-slate-700 border border-slate-200 transition-colors shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Indicadores de Posição do Carrossel */}
            {parceiros.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {parceiros.map((p, index) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIndiceAtivo(index)}
                    aria-label={`Ir para patrocinador ${p.nome}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      index === indiceAtivo
                        ? 'w-6 bg-fmt-red'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

