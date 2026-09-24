import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldAlert, KeyRound, User } from 'lucide-react';

export const LoginPage = () => {
  const [codigoEmpleado, setCodigoEmpleado] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/pos');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(codigoEmpleado, password);
      navigate('/pos');
    } catch (err) {
      setError(err.response?.data?.message || 'Código de empleado o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--verde-piedra-dark)',
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(16px, 4vw, 32px)',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <div style={{
        backgroundColor: 'var(--blanco-arena-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'clamp(24px, 5vw, 40px)',
        maxWidth: '440px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)',
        border: '3px solid var(--trigo)',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/images/logo.jpg" alt="Logo SAMAES" style={{ width: '58px', height: '58px', borderRadius: '50%', marginBottom: '10px', border: '2px solid var(--trigo)' }} />
          <h2 style={{ color: 'var(--verde-piedra-dark)', fontSize: 'clamp(1.4rem, 4vw, 1.8rem)' }}>Acceso al Sistema POS</h2>
          <p style={{ color: 'var(--texto-secundario)', fontSize: '0.85rem' }}>SAMAES FOOD — Ingresa tu Código de Empleado</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--verde-piedra)' }}>
              Código de Empleado *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                required
                placeholder="Ingresa tu código (ej. ADM-7492 o CAJ-3058)"
                value={codigoEmpleado}
                onChange={(e) => setCodigoEmpleado(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--blanco-arena-subtle)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--verde-piedra)' }}>
              Contraseña *
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--blanco-arena-subtle)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '1rem' }}
          >
            <LogIn size={18} /> {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
};
