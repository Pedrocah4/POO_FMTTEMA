import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChavesTorneio from './pages/ChavesTorneio';
import RankingPublico from './pages/RankingPublico';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas (sem exigência de login) */}
          <Route path="/login" element={<Login />} />
          <Route path="/ranking" element={<RankingPublico />} />

          {/* Rotas protegidas pela Guarda de Rotas (PrivateRoute) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chaves" element={<ChavesTorneio />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Rota coringa - redireciona para dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
