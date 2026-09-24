import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, RefreshCw, AlertCircle, CheckCircle, ShieldAlert, Phone, Mail, MapPin, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProveedoresPage = () => {
  const { isAdmin } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editingProv, setEditingProv] = useState(null);
  const [deletingProv, setDeletingProv] = useState(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const response = await api.get('/proveedores');
      setProveedores(response.data);
    } catch (err) {
      setError('Error al cargar la lista de proveedores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchProveedores();
    }
  }, [isAdmin]);

  const abrirModalCrear = () => {
    setEditingProv(null);
    setNombre('');
    setNit('');
    setTelefono('');
    setEmail('');
    setDireccion('');
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (prov) => {
    setEditingProv(prov);
    setNombre(prov.nombre || '');
    setNit(prov.nit || '');
    setTelefono(prov.telefono || '');
    setEmail(prov.email || '');
    setDireccion(prov.direccion || '');
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
      nit: nit ? nit : null,
      telefono,
      email: email ? email : null,
      direccion: direccion ? direccion : null
    };

    try {
      if (editingProv) {
        await api.put(`/proveedores/${editingProv.id}`, payload);
        setMensaje('¡Proveedor actualizado correctamente!');
      } else {
        await api.post('/proveedores', payload);
        setMensaje('¡Proveedor registrado exitosamente!');
      }
      setModalAbierto(false);
      fetchProveedores();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el proveedor.');
    }
  };

  const confirmarEliminar = async () => {
    if (!deletingProv) return;
    setMensaje('');
    setError('');

    try {
      await api.delete(`/proveedores/${deletingProv.id}`);
      setMensaje(`¡Proveedor "${deletingProv.nombre}" eliminado con éxito!`);
      setDeletingProv(null);
      fetchProveedores();
    } catch (err) {
      const msgError = err.response?.data?.message || 'Error al eliminar el proveedor.';
      setError(msgError);
      setDeletingProv(null);
    }
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '28px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={44} style={{ marginBottom: '14px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>La gestión de proveedores está restringida exclusivamente al perfil ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Gestión de Proveedores</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Administra los proveedores de materia prima e insumos (formales e informales).</p>
          </div>
          <div className="page-header-actions">
            <button onClick={fetchProveedores} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              <RefreshCw size={15} /> Actualizar
            </button>
            <button onClick={abrirModalCrear} className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <Plus size={16} /> Nuevo Proveedor
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

        {/* TABLA DE PROVEEDORES */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando proveedores...</div>
        ) : proveedores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--blanco-arena-card)', borderRadius: 'var(--radius-md)' }}>
            <Building2 size={44} color="var(--trigo-dark)" style={{ marginBottom: '14px' }} />
            <h3>No hay proveedores registrados aún</h3>
            <p style={{ color: 'var(--texto-secundario)', marginTop: '4px', fontSize: '0.88rem' }}>Agrega tu primer proveedor de carnes, verduras, lácteos o vendedor informal.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ backgroundColor: 'var(--verde-piedra-dark)', color: 'var(--blanco-arena)' }}>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>ID</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Empresa / Proveedor</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>NIT / Tipo</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Teléfono & Email</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Dirección</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--blanco-arena-subtle)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--verde-piedra)' }}>#{p.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: '700', fontSize: '0.95rem', color: 'var(--verde-piedra-dark)' }}>
                      {p.nombre}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {p.nit ? (
                        <span className="badge badge-trigo" style={{ fontWeight: '700' }}>NIT: {p.nit}</span>
                      ) : (
                        <span className="badge badge-ok" style={{ fontSize: '0.72rem' }}>Informal</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.85rem' }}>
                      {p.telefono && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {p.telefono}</div>}
                      {p.email && <div style={{ color: 'var(--texto-secundario)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Mail size={12} /> {p.email}</div>}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--texto-secundario)', fontSize: '0.85rem' }}>
                      {p.direccion ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {p.direccion}</span> : 'No especificada'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button onClick={() => abrirModalEditar(p)} style={{ border: 'none', background: 'var(--trigo-light)', color: 'var(--verde-piedra-dark)', padding: '5px 9px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.78rem' }}>
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeletingProv(p)} style={{ border: 'none', background: '#FEE2E2', color: '#991B1B', padding: '5px 9px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL REGISTRO / EDICIÓN PROVEEDOR */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)' }}>
                {editingProv ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
              </h3>
              <button onClick={() => setModalAbierto(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>

            <form onSubmit={handleGuardar}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nombre del Proveedor / Vendedor *</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Don Pedro (Verduras) o Distribuidora SAMAES" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>NIT (Opcional)</label>
                  <input type="text" value={nit} onChange={(e) => setNit(e.target.value)} placeholder="Ej. 900123456-7" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Teléfono *</label>
                  <input type="text" required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 3001234567" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Correo Electrónico (Opcional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contacto@proveedor.com" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Dirección (Opcional)</label>
                <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej. Mercado Central Puesto 14" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Guardar Proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN */}
      {deletingProv && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', border: '3px solid #EF4444' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#991B1B', marginBottom: '8px' }}>
              ¿Eliminar Proveedor "{deletingProv.nombre}"?
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Esta acción eliminará al proveedor del sistema y desvinculará sus movimientos del historial.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDeletingProv(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Cancelar</button>
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
