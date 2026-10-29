import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ChavesTorneio from './pages/ChavesTorneio';
import RankingPublico from './pages/RankingPublico';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas da Vitrine Oficial (Landing Page, Ranking, Eventos e Login) */}
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<Home />} />
          <Route path="/ranking" element={<RankingPublico />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas pela Guarda de Rotas (PrivateRoute) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chaves" element={<ChavesTorneio />} />
          </Route>

          {/* Rota coringa - redireciona para a Home principal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
