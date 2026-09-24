import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Duración de la sesión: 12 horas en milisegundos (43.200.000 ms)
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('samaes_token');
    localStorage.removeItem('samaes_user');
    localStorage.removeItem('samaes_login_timestamp');
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('samaes_token');
    const savedUser = localStorage.getItem('samaes_user');
    const loginTimestamp = localStorage.getItem('samaes_login_timestamp');

    if (savedToken && savedUser) {
      const now = Date.now();
      const loginTime = loginTimestamp ? parseInt(loginTimestamp, 10) : null;

      // Verificar si ya transcurrieron más de 12 horas desde el inicio de sesión
      if (loginTime && (now - loginTime >= SESSION_DURATION_MS)) {
        logout();
      } else {
        setToken(savedToken);
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          logout();
        }
      }
    }
    setLoading(false);
  }, []);

  // Temporizador automático en tiempo real para cerrar sesión cuando pasen las 12 horas
  useEffect(() => {
    if (!token) return;

    const loginTimestamp = localStorage.getItem('samaes_login_timestamp');
    const loginTime = loginTimestamp ? parseInt(loginTimestamp, 10) : Date.now();
    const tiempoRestante = SESSION_DURATION_MS - (Date.now() - loginTime);

    if (tiempoRestante <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, tiempoRestante);

    return () => clearTimeout(timer);
  }, [token]);

  const login = async (codigoEmpleado, password) => {
    const response = await api.post('/auth/login', { codigoEmpleado, password });
    const data = response.data;

    const userData = {
      codigoEmpleado: data.codigoEmpleado,
      role: data.role,
      nombreEmpleado: data.nombreEmpleado
    };

    const now = Date.now();
    setToken(data.accessToken);
    setUser(userData);

    localStorage.setItem('samaes_token', data.accessToken);
    localStorage.setItem('samaes_user', JSON.stringify(userData));
    localStorage.setItem('samaes_login_timestamp', now.toString());

    return userData;
  };

  const isAdmin = () => user && (user.role === 'ADMINISTRADOR' || user.role === 'ROLE_ADMINISTRADOR');
  const isCajero = () => user && (user.role === 'CAJERO' || user.role === 'ROLE_CAJERO');

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isCajero }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
