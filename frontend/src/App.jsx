import { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import CadastroPublico from './pages/CadastroPublico';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RankingPublico from './pages/RankingPublico';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-6 text-center shadow-2xl">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-heading font-bold text-lg mb-2">Ops! Ocorreu uma inconsistência</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              O sistema detectou uma falha temporária ao renderizar este módulo.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-fmt-red text-white text-xs font-bold hover:bg-fmt-red-hover transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recarregar Página</span>
              </button>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
              >
                Painel Principal
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas da Vitrine Oficial */}
            <Route path="/" element={<Home />} />
            <Route path="/eventos" element={<Home />} />
            <Route path="/ranking" element={<RankingPublico />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastrar" element={<CadastroPublico />} />

            {/* Rotas protegidas pela Guarda de Rotas (PrivateRoute) */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/:modulo" element={<Dashboard />} />
              <Route path="/chaves" element={<Navigate to="/dashboard/torneios" replace />} />
            </Route>

            {/* Rota coringa - redireciona para a Home principal */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
