import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FmttemaLogo from '../components/FmttemaLogo';
import VitrineParceiros from '../components/VitrineParceiros';
import TabelaRankingEstadual from '../components/TabelaRankingEstadual';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, Sparkles, Shield, Trophy } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Se já estiver logado, redireciona diretamente para o dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !senha.trim()) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), senha);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMessage('Credenciais inválidas: e-mail ou senha incorretos. Por favor, tente novamente.');
      } else if (!err.response) {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique se o backend está iniciado na porta 8080.');
      } else {
        setErrorMessage(err.response?.data?.mensagem || 'Ocorreu um erro ao processar o login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreencherAdmin = () => {
    const testEmail = import.meta.env.VITE_TEST_ADMIN_EMAIL || 'admin@fmttema.com';
    const testPassword = import.meta.env.VITE_TEST_ADMIN_PASSWORD || 'admin123';
    setEmail(testEmail);
    setSenha(testPassword);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-fmt-light text-fmt-dark antialiased">
      {/* Faixa Superior Institucional (Bandeira do Maranhão - Azul e Vermelho) */}
      <div className="h-2 w-full bg-fmt-blue border-b-2 border-fmt-red"></div>

      {/* Conteúdo Central */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          
          {/* Card Institucional */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 transition-all text-left">
            
            {/* Cabeçalho com Escudo Oficial */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-4">
                <FmttemaLogo size="xl" showText={false} />
              </div>
              
              <h1 className="font-heading font-extrabold text-2xl text-fmt-blue tracking-tight">
                FMTTEMA
              </h1>
              <p className="text-xs uppercase font-bold tracking-wider text-fmt-red mt-1">
                Federação de Muaythai Tradicional - MA
              </p>
              <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                <Shield className="w-3.5 h-3.5 text-fmt-blue" />
                <span>Portal Oficial de Gestão Esportiva</span>
              </div>
            </div>

            {/* Mensagem de Erro 401 ou Conexão */}
            {errorMessage && (
              <div 
                role="alert" 
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-5 h-5 text-fmt-red shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Formulário de Autenticação */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  E-mail Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@fmttema.com"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-fmt-dark placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-fmt-blue focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Senha de Acesso
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="senha-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-fmt-dark placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-fmt-blue focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão de Login no Vermelho Oficial com Spinner */}
              <button
                id="btn-login"
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 bg-fmt-red hover:bg-fmt-red-hover text-white font-heading font-bold text-sm rounded-lg shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <span>Entrar no Sistema</span>
                )}
              </button>
            </form>

            {/* Botão rápido para testes e Acesso à Vitrine Pública de Ranking */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-center">
              <button
                type="button"
                onClick={handlePreencherAdmin}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-fmt-blue transition-colors px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Preencher com credenciais padrão (admin)</span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-heading font-bold text-fmt-blue hover:text-white hover:bg-fmt-blue transition-colors px-3 py-2 rounded-lg bg-blue-50 border border-blue-200"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Voltar para a Vitrine Principal (Eventos & Ranking)</span>
              </Link>
            </div>
          </div>

          {/* Subtítulo institucional */}
          <p className="mt-4 text-center text-xs text-slate-500">
            Acesso restrito para atletas, técnicos e administradores homologados.
          </p>
        </div>
      </div>

      {/* Vitrine Pública do Ranking Estadual Oficial (US12 - Acesso Público Direto) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TabelaRankingEstadual />
      </div>

      {/* Vitrine Pública de Patrocinadores e Parceiros Oficiais (US11) */}
      <VitrineParceiros compact={true} />

      {/* Rodapé Oficial da página de login */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        Federação de Muaythai Tradicional do Estado do Maranhão &bull; CNPJ 25.194.198/0001-** &bull; 2026
      </footer>
    </div>
  );
}
