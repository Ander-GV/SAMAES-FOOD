import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, RefreshCw, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CategoriasPage = () => {
  const { isAdmin } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deletingCat, setDeletingCat] = useState(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (err) {
      setError('Error al cargar la lista de categorías del menú.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchCategorias();
    }
  }, [isAdmin]);

  const abrirModalCrear = () => {
    setEditingCat(null);
    setNombre('');
    setDescripcion('');
    setEstado(true);
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (cat) => {
    setEditingCat(cat);
    setNombre(cat.nombre || '');
    setDescripcion(cat.descripcion || '');
    setEstado(cat.estado !== false);
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const payload = {
      nombre,
      descripcion,
      estado
    };

    try {
      if (editingCat) {
        await api.put(`/categorias/${editingCat.id}`, payload);
        setMensaje('¡Categoría actualizada correctamente!');
      } else {
        await api.post('/categorias', payload);
        setMensaje('¡Categoría creada exitosamente!');
      }
      setModalAbierto(false);
      fetchCategorias();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la categoría.');
    }
  };

  const confirmarEliminar = async () => {
    if (!deletingCat) return;
    setMensaje('');
    setError('');

    try {
      await api.delete(`/categorias/${deletingCat.id}`);
      setMensaje(`¡Categoría "${deletingCat.nombre}" eliminada con éxito!`);
      setDeletingCat(null);
      fetchCategorias();
    } catch (err) {
      const msgError = err.response?.data?.message || 'No se puede eliminar la categoría porque tiene productos asociados en el menú.';
      setError(msgError);
      setDeletingCat(null);
    }
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '28px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={44} style={{ marginBottom: '14px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>La gestión de categorías está restringida exclusivamente al perfil ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Categorías del Menú</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Crea, edita o elimina las categorías de platos y bebidas.</p>
          </div>
          <div className="page-header-actions">
            <button onClick={fetchCategorias} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              <RefreshCw size={15} /> Actualizar
            </button>
            <button onClick={abrirModalCrear} className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <Plus size={16} /> Nueva Categoría
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

        {/* TABLA DE CATEGORÍAS RESPONSIVA */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando categorías...</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ backgroundColor: 'var(--verde-piedra-dark)', color: 'var(--blanco-arena)' }}>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>ID</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Categoría</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Descripción</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Estado</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--blanco-arena-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--verde-piedra)' }}>#{cat.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: '700', fontSize: '0.95rem', color: 'var(--verde-piedra-dark)' }}>
                      {cat.nombre}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--texto-secundario)', fontSize: '0.85rem' }}>
                      {cat.descripcion || 'Sin descripción'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {cat.estado !== false ? (
                        <span className="badge badge-ok">ACTIVA</span>
                      ) : (
                        <span className="badge badge-critico">INACTIVA</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button onClick={() => abrirModalEditar(cat)} style={{ border: 'none', background: 'var(--trigo-light)', color: 'var(--verde-piedra-dark)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem' }}>
                        <Edit2 size={13} /> Editar
                      </button>
                      <button onClick={() => setDeletingCat(cat)} style={{ border: 'none', background: '#FEE2E2', color: '#991B1B', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <Trash2 size={13} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL REGISTRO / EDICIÓN CATEGORÍA */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)', marginBottom: '16px' }}>
              {editingCat ? 'Editar Categoría' : 'Nueva Categoría de Menú'}
            </h3>

            <form onSubmit={handleGuardar}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nombre de Categoría *</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Entradas, Platos Fuertes, Bebidas" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Descripción</label>
                <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Platos de entrada y aperitivos" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="chkEstado" checked={estado} onChange={(e) => setEstado(e.target.checked)} />
                <label htmlFor="chkEstado" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--verde-piedra-dark)' }}>Categoría Activa en Menú</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN */}
      {deletingCat && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', border: '3px solid #EF4444' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#991B1B', marginBottom: '8px' }}>
              ¿Eliminar Categoría "{deletingCat.nombre}"?
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Esta acción no se puede deshacer. Solo se podrá eliminar si no tiene productos asociados en el menú.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDeletingCat(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Cancelar</button>
              <button type="button" onClick={confirmarEliminar} className="btn btn-danger" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
