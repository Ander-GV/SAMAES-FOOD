import React, { useState, useEffect } from 'react';
import { Table, Plus, Trash2, CheckCircle, ShieldAlert, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const MESAS_PREDETERMINADAS = [
  'Mesa #1', 'Mesa #2', 'Mesa #3', 'Mesa #4', 'Mesa #5', 
  'Mesa #6', 'Mesa #7', 'Mesa #8', 'Mesa #9', 'Mesa #10', 
  'Barra #1', 'Barra #2', 'Terraza #1', 'Terraza #2'
];

export const MesasPage = () => {
  const { isAdmin } = useAuth();
  const [mesas, setMesas] = useState([]);
  const [nuevaMesa, setNuevaMesa] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const guardadas = localStorage.getItem('samaes_mesas_config');
    if (guardadas) {
      try {
        setMesas(JSON.parse(guardadas));
      } catch (e) {
        setMesas(MESAS_PREDETERMINADAS);
      }
    } else {
      setMesas(MESAS_PREDETERMINADAS);
      localStorage.setItem('samaes_mesas_config', JSON.stringify(MESAS_PREDETERMINADAS));
    }
  }, []);

  const guardarMesasEnStorage = (nuevasMesas) => {
    setMesas(nuevasMesas);
    localStorage.setItem('samaes_mesas_config', JSON.stringify(nuevasMesas));
  };

  const handleAgregarMesa = (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const nombreLimpio = nuevaMesa.trim();
    if (!nombreLimpio) {
      setError('El nombre de la mesa es obligatorio.');
      return;
    }

    if (mesas.some(m => m.toLowerCase() === nombreLimpio.toLowerCase())) {
      setError(`Ya existe una mesa o ubicación registrada como "${nombreLimpio}".`);
      return;
    }

    const listaActualizada = [...mesas, nombreLimpio];
    guardarMesasEnStorage(listaActualizada);
    setMensaje(`¡Mesa "${nombreLimpio}" agregada correctamente!`);
    setNuevaMesa('');
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  const handleEliminarMesa = (mesaAEliminar) => {
    const listaActualizada = mesas.filter(m => m !== mesaAEliminar);
    guardarMesasEnStorage(listaActualizada);
    setMensaje(`Mesa "${mesaAEliminar}" eliminada del mapa del restaurante.`);
  };

  const handleRestablecerDefault = () => {
    guardarMesasEnStorage(MESAS_PREDETERMINADAS);
    setMensaje('Mesas restablecidas a la configuración predeterminada.');
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '28px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={44} style={{ marginBottom: '14px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>La administración de mesas y ubicaciones está restringida al ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Mesas & Ubicaciones</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Agrega o elimina mesas, barras o terrazas para el Punto de Venta (POS).</p>
          </div>
          <div className="page-header-actions">
            <button onClick={handleRestablecerDefault} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
              <RefreshCw size={14} /> Restablecer
            </button>
          </div>
        </div>

        {mensaje && (
          <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <CheckCircle size={18} /> {mensaje}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* FORMULARIO AGREGAR MESA */}
        <div style={{ backgroundColor: 'var(--blanco-arena-card)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '2px solid var(--trigo)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--verde-piedra-dark)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--trigo-dark)" /> Crear Nueva Mesa o Ubicación
          </h3>
          <form onSubmit={handleAgregarMesa} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              value={nuevaMesa}
              onChange={(e) => setNuevaMesa(e.target.value)}
              placeholder="Ej. Mesa #11, Terraza VIP, Barra #3"
              style={{ flex: '1 1 220px', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', fontWeight: '700', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.88rem', padding: '8px 16px' }}>
              <Plus size={16} /> Agregar Mesa
            </button>
          </form>
        </div>

        {/* LISTADO DE MESAS ACTIVAS */}
        <div style={{ backgroundColor: 'var(--blanco-arena-card)', borderRadius: 'var(--radius-lg)', padding: 'clamp(16px, 3vw, 24px)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(20,56,44,0.08)' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--verde-piedra-dark)', marginBottom: '16px' }}>
            Mesas y Ubicaciones Configuradas ({mesas.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 170px), 1fr))', gap: '12px' }}>
            {mesas.map((m) => (
              <div key={m} style={{
                backgroundColor: 'var(--blanco-arena-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--trigo)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table size={16} color="var(--verde-piedra)" />
                  <span style={{ fontWeight: '800', color: 'var(--verde-piedra-dark)', fontSize: '0.95rem' }}>{m}</span>
                </div>

                <button 
                  onClick={() => handleEliminarMesa(m)}
                  style={{ border: 'none', background: '#FEE2E2', color: '#991B1B', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  title={`Eliminar ${m}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
