import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, RefreshCw, AlertCircle, CheckCircle, ShieldAlert, ShoppingBag, Building2, Scale, ArrowRightLeft, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const InventarioPage = () => {
  const { isAdmin } = useAuth();
  const [ingredientes, setIngredientes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Crear / Editar Insumo
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editingIng, setEditingIng] = useState(null);
  const [deletingIng, setDeletingIng] = useState(null);

  // Modal Compra a Proveedor
  const [modalCompra, setModalCompra] = useState(false);
  const [compraIngrediente, setCompraIngrediente] = useState(null);
  const [compraProveedorId, setCompraProveedorId] = useState('');
  const [compraCantidad, setCompraCantidad] = useState('');
  const [compraUnidadId, setCompraUnidadId] = useState('');
  const [compraMotivo, setCompraMotivo] = useState('');

  // Form State Insumo
  const [nombre, setNombre] = useState('');
  const [stock, setStock] = useState('');
  const [unidadDeMedidaId, setUnidadDeMedidaId] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [resIng, resUni, resProv] = await Promise.all([
        api.get('/ingredientes'),
        api.get('/unidades-medida'),
        api.get('/proveedores')
      ]);
      setIngredientes(resIng.data);
      setUnidades(resUni.data);
      setProveedores(resProv.data);

      if (resUni.data.length > 0 && !unidadDeMedidaId) {
        setUnidadDeMedidaId(resUni.data[0].id.toString());
      }
      if (resProv.data.length > 0 && !compraProveedorId) {
        setCompraProveedorId(resProv.data[0].id.toString());
      }
    } catch (err) {
      setError('Error al cargar la información del inventario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin]);

  const abrirModalCrear = () => {
    setEditingIng(null);
    setNombre('');
    setStock('0');
    if (unidades.length > 0) {
      setUnidadDeMedidaId(unidades[0].id.toString());
    } else {
      setUnidadDeMedidaId('');
    }
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (ing) => {
    setEditingIng(ing);
    setNombre(ing.nombre || '');
    setStock(ing.stock != null ? ing.stock.toString() : '0');
    const uId = ing.unidadDeMedida?.id || (unidades[0]?.id) || '1';
    setUnidadDeMedidaId(uId.toString());
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const abrirModalCompra = (ing) => {
    setCompraIngrediente(ing);
    setCompraCantidad('');
    const uId = ing.unidadDeMedida?.id || (unidades[0]?.id) || '1';
    setCompraUnidadId(uId.toString());
    if (proveedores.length > 0) setCompraProveedorId(proveedores[0].id.toString());
    setCompraMotivo('');
    setMensaje('');
    setError('');
    setModalCompra(true);
  };

  const handleGuardarInsumo = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError('Por favor ingresa el nombre del insumo.');
      return;
    }

    const uId = parseInt(unidadDeMedidaId, 10) || (unidades.length > 0 ? Number(unidades[0].id) : null);
    if (!uId) {
      setError('Debes seleccionar una Unidad de Medida. Si no tienes creadas, ve a la sección "Unidades de Medida" primero.');
      return;
    }

    const stockNum = stock === '' ? 0 : parseInt(stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('El stock inicial debe ser un número mayor o igual a 0.');
      return;
    }

    const payload = {
      nombre: nombreLimpio,
      stock: stockNum,
      unidadDeMedidaId: uId
    };

    try {
      if (editingIng) {
        await api.put(`/ingredientes/${editingIng.id}`, payload);
        setMensaje('¡Insumo actualizado correctamente!');
      } else {
        await api.post('/ingredientes', payload);
        setMensaje('¡Insumo creado exitosamente!');
      }
      setModalAbierto(false);
      loadData();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      let errorMsg = 'Error al guardar el insumo.';
      if (fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length > 0) {
        errorMsg = Object.entries(fieldErrors).map(([field, msg]) => `${field}: ${msg}`).join(', ');
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      setError(errorMsg);
    }
  };

  const handleRegistrarCompra = async (e) => {
    e.preventDefault();
    if (!compraIngrediente) return;
    setMensaje('');
    setError('');

    const unidadSel = unidades.find(u => u.id.toString() === compraUnidadId);
    const factor = unidadSel?.factorDeConversion || 1.0;
    const cantidadEnGramos = Math.round((parseFloat(compraCantidad) || 0) * factor);

    try {
      // 1. Incrementar el stock del ingrediente
      const nuevoStock = (compraIngrediente.stock || 0) + cantidadEnGramos;
      await api.put(`/ingredientes/${compraIngrediente.id}`, {
        nombre: compraIngrediente.nombre,
        stock: Math.round(nuevoStock),
        unidadDeMedidaId: compraIngrediente.unidadDeMedida?.id || parseInt(compraUnidadId, 10) || 1
      });

      setMensaje(`¡Compra registrada con éxito! Se sumaron +${cantidadEnGramos} gramos a "${compraIngrediente.nombre}".`);
      setModalCompra(false);
      loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.errors 
        ? Object.entries(err.response.data.errors).map(([field, msg]) => `${field}: ${msg}`).join(', ')
        : (err.response?.data?.message || 'Error al registrar la compra.');
      setError(errorMsg);
    }
  };

  const confirmarEliminar = async () => {
    if (!deletingIng) return;
    setMensaje('');
    setError('');

    try {
      await api.delete(`/ingredientes/${deletingIng.id}`);
      setMensaje(`¡Insumo "${deletingIng.nombre}" eliminado con éxito!`);
      setDeletingIng(null);
      loadData();
    } catch (err) {
      const msgError = err.response?.data?.message || 'No se puede eliminar el insumo porque está siendo utilizado en una receta de producto o tiene compras registradas.';
      setError(msgError);
      setDeletingIng(null);
    }
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '28px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={44} style={{ marginBottom: '14px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>El control de inventario de materia prima está restringido al ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Inventario de Insumos & Stock</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Asocia compras a proveedores, controla existencias y define unidades.</p>
          </div>
          <div className="page-header-actions">
            <button onClick={loadData} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              <RefreshCw size={15} /> Actualizar
            </button>
            <button onClick={abrirModalCrear} className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <Plus size={16} /> Nuevo Insumo
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

        {/* TABLA DE INSUMOS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando inventario...</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ backgroundColor: 'var(--verde-piedra-dark)', color: 'var(--blanco-arena)' }}>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>ID</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Insumo</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Stock Actual</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Unidad Base</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map((ing) => {
                  const stockBajo = ing.stock <= 500 && ing.unidadDeMedida?.abreviatura === 'g';

                  return (
                    <tr key={ing.id} style={{ borderBottom: '1px solid var(--blanco-arena-subtle)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--verde-piedra)' }}>#{ing.id}</td>
                      <td style={{ padding: '14px 18px', fontWeight: '700', fontSize: '0.95rem', color: 'var(--verde-piedra-dark)' }}>
                        {ing.nombre}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', fontSize: '1.05rem', color: stockBajo ? '#991B1B' : 'var(--verde-piedra)' }}>
                        {ing.stock} {ing.unidadDeMedida?.abreviatura}
                        {stockBajo && (
                          <span className="badge badge-critico" style={{ marginLeft: '6px', fontSize: '0.68rem' }}>
                            Bajo
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className="badge badge-trigo">
                          <Scale size={12} /> {ing.unidadDeMedida?.nombre || 'Gramos'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button 
                          onClick={() => abrirModalCompra(ing)}
                          className="btn btn-trigo"
                          style={{ padding: '5px 10px', fontSize: '0.78rem', marginRight: '6px', minHeight: 'auto' }}
                          title="Registrar Compra a Proveedor"
                        >
                          <ShoppingBag size={13} /> Comprar
                        </button>
                        <button onClick={() => abrirModalEditar(ing)} style={{ border: 'none', background: 'var(--trigo-light)', color: 'var(--verde-piedra-dark)', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.78rem' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeletingIng(ing)} style={{ border: 'none', background: '#FEE2E2', color: '#991B1B', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL CREAR / EDITAR INSUMO BASE */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)' }}>
                {editingIng ? 'Editar Insumo' : 'Nuevo Insumo / Materia Prima'}
              </h3>
              <button onClick={() => setModalAbierto(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>

            <form onSubmit={handleGuardarInsumo}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nombre del Insumo *</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Carne de Res, Queso Cheddar" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Stock Inicial *</label>
                  <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Unidad de Medida *</label>
                  {unidades.length === 0 ? (
                    <div style={{ color: '#991B1B', fontSize: '0.72rem', marginTop: '6px', fontWeight: '600' }}>
                      ⚠️ No hay unidades registradas. Ve a <strong>Unidades de Medida</strong> para crear una (ej. Gramo, Und).
                    </div>
                  ) : (
                    <select value={unidadDeMedidaId} onChange={(e) => setUnidadDeMedidaId(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }}>
                      {unidades.map((u) => (
                        <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Guardar Insumo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ASOCIAR COMPRA A PROVEEDOR */}
      {modalCompra && compraIngrediente && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} color="var(--trigo-dark)" /> Registrar Compra a Proveedor
              </h3>
              <button onClick={() => setModalCompra(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--texto-secundario)', marginBottom: '16px' }}>
              Insumo: <strong>{compraIngrediente.nombre}</strong> (Stock Actual: {compraIngrediente.stock} {compraIngrediente.unidadDeMedida?.abreviatura})
            </p>

            <form onSubmit={handleRegistrarCompra}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--verde-piedra-dark)' }}>Seleccionar Proveedor *</label>
                <select 
                  value={compraProveedorId} 
                  onChange={(e) => setCompraProveedorId(e.target.value)} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--trigo)', marginTop: '4px', fontWeight: '700', fontSize: '0.9rem' }}
                >
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} {p.nit ? `(NIT: ${p.nit})` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Cantidad Comprada *</label>
                  <input 
                    type="number" 
                    step="any" 
                    required 
                    value={compraCantidad} 
                    onChange={(e) => setCompraCantidad(e.target.value)} 
                    placeholder="Ej. 30"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Unidad *</label>
                  <select 
                    value={compraUnidadId} 
                    onChange={(e) => setCompraUnidadId(e.target.value)} 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }}
                  >
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Observaciones / # Factura *</label>
                <input 
                  type="text" 
                  required
                  value={compraMotivo} 
                  onChange={(e) => setCompraMotivo(e.target.value)} 
                  placeholder="Ej. Factura #4029 - 30kg de carne"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalCompra(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Confirmar Compra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN */}
      {deletingIng && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', border: '3px solid #EF4444' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#991B1B', marginBottom: '8px' }}>
              ¿Eliminar Insumo "{deletingIng.nombre}"?
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Esta acción no se puede deshacer. Solo se podrá eliminar si no tiene recetas activas vinculadas.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDeletingIng(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Cancelar</button>
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
