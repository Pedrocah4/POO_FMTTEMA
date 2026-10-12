import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fmttema_token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fmttema_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('fmttema_token');
    const savedUser = localStorage.getItem('fmttema_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    const { token: jwtToken, email: userEmail, perfil } = response.data;

    const userData = { email: userEmail, perfil };

    // Salvar no LocalStorage conforme convenção da tarefa
    localStorage.setItem('fmttema_token', jwtToken);
    localStorage.setItem('fmttema_user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('fmttema_token');
    localStorage.removeItem('fmttema_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
