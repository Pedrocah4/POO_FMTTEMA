import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FmttemaLogo from '../components/FmttemaLogo';
import api from '../services/api';
import { CORES_KRUANG } from '../components/ModalEditarCartel';
import {
  User,
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  Award,
  Scale,
  Sparkles,
  Lock
} from 'lucide-react';

const CATEGORIAS_PESO = [
  'Peso-Mosca (Até 51.0 kg)',
  'Peso-Galo (Até 54.0 kg)',
  'Peso-Pena (Até 57.0 kg)',
  'Peso-Leve (Até 63.5 kg)',
  'Peso-Meio-Médio (Até 71.0 kg)',
  'Peso-Médio (Até 75.0 kg)',
  'Peso-Meio-Pesado (Até 81.0 kg)',
  'Peso-Pesado (Até 91.0 kg)',
  'Peso-Super-Pesado (Acima de 91.0 kg)'
];

// Utilitários de Máscaras
function formatarCPF(valor) {
  const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11);
  return apenasNumeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(valor) {
  const apenasNumeros = valor.replace(/\D/g, '').slice(0, 11);
  if (apenasNumeros.length <= 10) {
    return apenasNumeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return apenasNumeros
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export default function CadastroPublico() {
  const navigate = useNavigate();
  const [tipoCadastro, setTipoCadastro] = useState('ATLETA'); // 'ATLETA' | 'ACADEMIA'
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [academias, setAcademias] = useState([]);

  // Form Atleta
  const [formAtleta, setFormAtleta] = useState({
    nome: '',
    apelido: '',
    cpf: '',
    dataNascimento: '',
    peso: '',
    categoria: 'Peso-Leve',
    graduacao: 'Branco',
    academiaId: '',
    email: '',
    senha: '',
    confirmaSenha: ''
  });

  // Form Academia
  const [formAcademia, setFormAcademia] = useState({
    nome: '',
    responsavel: '',
    telefone: '',
    cidade: 'São Luís - MA',
    email: '',
    senha: '',
    confirmaSenha: ''
  });

  // Carrega lista de academias para vínculo do atleta
  useEffect(() => {
    api.get('/api/academias')
      .then(res => setAcademias(res.data || []))
      .catch(() => setAcademias([]));
  }, []);

  const handleChangeAtleta = (campo, valor) => {
    if (campo === 'cpf') {
      valor = formatarCPF(valor);
    }
    setFormAtleta(prev => ({ ...prev, [campo]: valor }));
  };

  const handleChangeAcademia = (campo, valor) => {
    if (campo === 'telefone') {
      valor = formatarTelefone(valor);
    }
    setFormAcademia(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmitAtleta = async (e) => {
    e.preventDefault();
    setErro(null);

    if (formAtleta.senha !== formAtleta.confirmaSenha) {
      setErro('A confirmação de senha não confere.');
      return;
    }
    if (formAtleta.senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }
    const pesoNum = parseFloat(formAtleta.peso);
    if (isNaN(pesoNum) || pesoNum <= 0) {
      setErro('Informe um peso válido maior que zero.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: formAtleta.nome.trim(),
        apelido: formAtleta.apelido.trim() || null,
        cpf: formAtleta.cpf.trim(),
        dataNascimento: formAtleta.dataNascimento,
        peso: pesoNum,
        categoria: formAtleta.categoria,
        graduacao: formAtleta.graduacao,
        academiaId: formAtleta.academiaId ? Number(formAtleta.academiaId) : null,
        email: formAtleta.email.trim(),
        senha: formAtleta.senha
      };

      await api.post('/api/atletas', payload);
      // Redireciona para /login com mensagem de sucesso
      navigate('/login?sucesso=cadastro_pendente', {
        state: {
          mensagemSucesso: 'Cadastro recebido com sucesso! Sua solicitação está sob análise de homologação (status PENDENTE_APROVACAO).'
        }
      });
    } catch (err) {
      const msg = err.response?.data?.mensagem || err.response?.data?.erro || 'Erro ao realizar cadastro do atleta.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAcademia = async (e) => {
    e.preventDefault();
    setErro(null);

    if (formAcademia.senha !== formAcademia.confirmaSenha) {
      setErro('A confirmação de senha não confere.');
      return;
    }
    if (formAcademia.senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: formAcademia.nome.trim(),
        responsavel: formAcademia.responsavel.trim(),
        telefone: formAcademia.telefone.trim(),
        cidade: formAcademia.cidade.trim(),
        email: formAcademia.email.trim(),
        senha: formAcademia.senha
      };

      await api.post('/api/academias', payload);
      // Redireciona para /login com mensagem de sucesso
      navigate('/login?sucesso=cadastro_pendente', {
        state: {
          mensagemSucesso: 'Cadastro da agremiação recebido com sucesso! Aguarde a homologação da FMTTEMA (status PENDENTE_APROVACAO).'
        }
      });
    } catch (err) {
      const msg = err.response?.data?.mensagem || err.response?.data?.erro || 'Erro ao realizar cadastro da academia.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-fmt-red selection:text-white relative overflow-hidden py-10 px-4 sm:px-6">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-fmt-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fmt-red/15 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-white/10 z-10">
        <Link to="/" className="flex items-center gap-3">
          <FmttemaLogo size="md" light={true} />
        </Link>
        <Link
          to="/login"
          className="text-xs font-heading font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg border border-white/10 transition-colors"
        >
          Já é filiado? Entrar
        </Link>
      </header>

      {/* Card Central */}
      <main className="max-w-2xl mx-auto w-full my-8 z-10">
        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Título e Apresentação */}
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fmt-red/20 text-fmt-red border border-fmt-red/30 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Filiação Oficial FMTTEMA
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
              Solicitação de Cadastro Público
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              Preencha os dados oficiais para requerer a sua filiação na Federação de Muaythai Tradicional do Maranhão.
            </p>
          </div>

          {/* Aviso Obrigatório do Grupo: PENDENTE_APROVACAO */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-heading font-bold text-amber-300 uppercase tracking-wide text-xs mb-0.5">
                Regulamento Oficial FMTTEMA
              </strong>
              Todo novo cadastro inicia automaticamente com o status{' '}
              <span className="font-mono bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                PENDENTE_APROVACAO
              </span>
              . Seu acesso completo ao portal esportivo será liberado após a validação cadastral da Diretoria da Federação.
            </div>
          </div>

          {/* Abas de Escolha de Perfil */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/10 mb-8">
            <button
              type="button"
              onClick={() => {
                setTipoCadastro('ATLETA');
                setErro(null);
              }}
              className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                tipoCadastro === 'ATLETA'
                  ? 'bg-gradient-to-r from-fmt-red to-fmt-red-hover text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Atleta Individual</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipoCadastro('ACADEMIA');
                setErro(null);
              }}
              className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                tipoCadastro === 'ACADEMIA'
                  ? 'bg-gradient-to-r from-fmt-blue to-fmt-blue-hover text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Academia / Agremiação</span>
            </button>
          </div>

          {/* Banner de Erro */}
          {erro && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* FORMULÁRIO 1: ATLETA */}
          {tipoCadastro === 'ATLETA' && (
            <form onSubmit={handleSubmitAtleta} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formAtleta.nome}
                    onChange={(e) => handleChangeAtleta('nome', e.target.value)}
                    placeholder="Ex: Lucas Oliveira"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Apelido de Luta (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formAtleta.apelido}
                    onChange={(e) => handleChangeAtleta('apelido', e.target.value)}
                    placeholder="Ex: Pitbull / Demolidor"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    CPF (com máscara) *
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formAtleta.cpf}
                      onChange={(e) => handleChangeAtleta('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Data de Nascimento *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="date"
                      required
                      value={formAtleta.dataNascimento}
                      onChange={(e) => handleChangeAtleta('dataNascimento', e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Peso Atual (kg) *
                  </label>
                  <div className="relative">
                    <Scale className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="150"
                      required
                      value={formAtleta.peso}
                      onChange={(e) => handleChangeAtleta('peso', e.target.value)}
                      placeholder="Ex: 68.5"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Categoria Oficial de Peso *
                  </label>
                  <select
                    value={formAtleta.categoria}
                    onChange={(e) => handleChangeAtleta('categoria', e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                  >
                    {CATEGORIAS_PESO.map(cat => (
                      <option key={cat} value={cat.split(' ')[0]} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Graduação Inicial (Kruang) *
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <select
                      value={formAtleta.graduacao}
                      onChange={(e) => handleChangeAtleta('graduacao', e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                    >
                      {CORES_KRUANG.map(cor => (
                        <option key={cor} value={cor} className="bg-slate-900 text-white">
                          {cor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academia de Origem
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <select
                      value={formAtleta.academiaId}
                      onChange={(e) => handleChangeAtleta('academiaId', e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                    >
                      <option value="" className="bg-slate-900 text-white">
                        -- Atleta Independente / Não listada --
                      </option>
                      {academias.map(ac => (
                        <option key={ac.id} value={ac.id} className="bg-slate-900 text-white">
                          {ac.nome} ({ac.cidade})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  value={formAtleta.email}
                  onChange={(e) => handleChangeAtleta('email', e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Senha (mínimo 6 dígitos) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formAtleta.senha}
                      onChange={(e) => handleChangeAtleta('senha', e.target.value)}
                      placeholder="******"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(prev => !prev)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formAtleta.confirmaSenha}
                      onChange={(e) => handleChangeAtleta('confirmaSenha', e.target.value)}
                      placeholder="******"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-red focus:ring-1 focus:ring-fmt-red transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-fmt-red to-fmt-red-hover hover:from-red-600 hover:to-red-700 text-white font-heading font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando Cadastro...' : 'Concluir Cadastro de Atleta'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORMULÁRIO 2: ACADEMIA */}
          {tipoCadastro === 'ACADEMIA' && (
            <form onSubmit={handleSubmitAcademia} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome da Academia / Centro de Treinamento *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={formAcademia.nome}
                    onChange={(e) => handleChangeAcademia('nome', e.target.value)}
                    placeholder="Ex: CT Ilha Fight Muaythai"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-blue focus:ring-1 focus:ring-fmt-blue transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mestre / Kru Responsável *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formAcademia.responsavel}
                      onChange={(e) => handleChangeAcademia('responsavel', e.target.value)}
                      placeholder="Ex: Kru Marcos Silva"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-blue focus:ring-1 focus:ring-fmt-blue transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Telefone / WhatsApp (com máscara) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formAcademia.telefone}
                      onChange={(e) => handleChangeAcademia('telefone', e.target.value)}
                      placeholder="(98) 98888-7777"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-fmt-blue focus:ring-1 focus:ring-fmt-blue transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Cidade / Polo Regional *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={formAcademia.cidade}
                      onChange={(e) => handleChangeAcademia('cidade', e.target.value)}
                      placeholder="Ex: São Luís - MA"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-blue focus:ring-1 focus:ring-fmt-blue transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail Institucional *
                  </label>
                  <input
                    type="email"
                    required
                    value={formAcademia.email}
                    onChange={(e) => handleChangeAcademia('email', e.target.value)}
                    placeholder="contato@ctilhafight.com"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-blue focus:ring-1 focus:ring-fmt-blue transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Senha de Acesso (mínimo 6 dígitos) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formAcademia.senha}
                      onChange={(e) => handleChangeAcademia('senha', e.target.value)}
                      placeholder="******"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-blue focus:ring-1 focus:ring-fmt-blue transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(prev => !prev)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                    >
                      {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formAcademia.confirmaSenha}
                      onChange={(e) => handleChangeAcademia('confirmaSenha', e.target.value)}
                      placeholder="******"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fmt-blue focus:ring-1 focus:ring-fmt-blue transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-fmt-blue to-fmt-blue-hover hover:from-blue-700 hover:to-blue-800 text-white font-heading font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando Cadastro...' : 'Concluir Cadastro da Academia'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Rodapé Interno do Card */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
            Dúvidas com seu credenciamento? Contate a secretaria estadual:{' '}
            <span className="text-slate-300 font-medium">contato@fmttema.com.br</span>
          </div>
        </div>
      </main>

      {/* Rodapé da Página */}
      <footer className="max-w-4xl mx-auto w-full text-center text-slate-500 text-xs pt-4 border-t border-white/5 z-10">
        &copy; 2026 Federação de Muaythai Tradicional do Estado do Maranhão &bull; Todos os direitos reservados.
      </footer>
    </div>
  );
}

