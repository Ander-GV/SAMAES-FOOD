import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, AlertCircle, CheckCircle, ShieldAlert, FileText, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const MovimientosInventarioPage = () => {
  const { isAdmin } = useAuth();
  const [movimientos, setMovimientos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tipoMovimientoId, setTipoMovimientoId] = useState(1); // 1: ENTRADA, 2: SALIDA
  const [ingredienteId, setIngredienteId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidadId, setUnidadId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [motivo, setMotivo] = useState('Compra de insumo a proveedor');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [resMov, resIng, resProv, resUni] = await Promise.all([
        api.get('/movimientos-inventario'),
        api.get('/ingredientes'),
        api.get('/proveedores'),
        api.get('/unidades-medida')
      ]);

      const sorted = resMov.data.sort((a, b) => b.id - a.id);
      setMovimientos(sorted);
      setIngredientes(resIng.data);
      setProveedores(resProv.data);
      setUnidades(resUni.data);

      if (resIng.data.length > 0 && !ingredienteId) {
        setIngredienteId(resIng.data[0].id.toString());
      }
      if (resProv.data.length > 0 && !proveedorId) {
        setProveedorId(resProv.data[0].id.toString());
      }
      if (resUni.data.length > 0 && !unidadId) {
        setUnidadId(resUni.data[0].id.toString());
      }
    } catch (err) {
      setError('Error al cargar la información de movimientos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin]);

  const abrirModal = () => {
    setTipoMovimientoId(1);
    setCantidad('');
    setMotivo('Compra de insumo a proveedor');
    if (ingredientes.length > 0) setIngredienteId(ingredientes[0].id.toString());
    if (proveedores.length > 0) setProveedorId(proveedores[0].id.toString());
    if (unidades.length > 0) setUnidadId(unidades[0].id.toString());
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const handleGuardarMovimiento = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const unidadSel = unidades.find(u => u.id.toString() === unidadId);
    const factor = unidadSel?.factorDeConversion || 1.0;
    const cantidadEnGramos = (parseFloat(cantidad) || 0) * factor;

    const payload = {
      tipoMovimiento: tipoMovimientoId === 1 ? 'ENTRADA' : 'SALIDA',
      motivo,
      cantidad: cantidadEnGramos,
      ingrediente: { id: parseInt(ingredienteId) },
      proveedor: tipoMovimientoId === 1 && proveedorId ? { id: parseInt(proveedorId) } : null
    };

    try {
      await api.post('/movimientos-inventario', payload);
      
      // Actualizar el stock del ingrediente
      const ing = ingredientes.find(i => i.id.toString() === ingredienteId);
      if (ing) {
        const delta = tipoMovimientoId === 1 ? cantidadEnGramos : -cantidadEnGramos;
        const nuevoStock = Math.max(0, (ing.stock || 0) + delta);
        await api.put(`/ingredientes/${ing.id}`, {
          nombre: ing.nombre,
          stock: Math.round(nuevoStock),
          unidadDeMedidaId: ing.unidadDeMedida?.id || 1
        });
      }

      setMensaje('¡Movimiento de inventario registrado con éxito!');
      setModalAbierto(false);
      loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.errors 
        ? Object.entries(err.response.data.errors).map(([field, msg]) => `${field}: ${msg}`).join(', ')
        : (err.response?.data?.message || 'Error al registrar el movimiento.');
      setError(errorMsg);
    }
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '28px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={44} style={{ marginBottom: '14px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>El Kárdex y Movimientos de Inventario están restringidos al perfil ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Kárdex & Movimientos de Inventario</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Registro de entradas por compras y salidas por mermas o desperdicios.</p>
          </div>
          <div className="page-header-actions">
            <button onClick={loadData} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              <RefreshCw size={15} /> Actualizar
            </button>
            <button onClick={abrirModal} className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <Plus size={16} /> Registrar Movimiento
            </button>
          </div>
        </div>

        {mensaje && (
          <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <CheckCircle size={18} /> {mensaje}
          </div>
        )}

        {/* TABLA KÁRDEX DE MOVIMIENTOS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando historial Kárdex...</div>
        ) : movimientos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--blanco-arena-card)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={44} color="var(--trigo-dark)" style={{ marginBottom: '14px' }} />
            <h3>No hay movimientos registrados aún</h3>
            <p style={{ color: 'var(--texto-secundario)', marginTop: '4px', fontSize: '0.88rem' }}>Registra compras a proveedores o ajustes de stock.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ backgroundColor: 'var(--verde-piedra-dark)', color: 'var(--blanco-arena)' }}>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>ID / Fecha</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Tipo Movimiento</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Insumo</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Cantidad</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Motivo / Observación</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Proveedor / Responsable</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m) => {
                  const esEntrada = m.tipoDeMovimiento?.nombre?.toLowerCase().includes('entrada') || m.tipoDeMovimiento?.id === 1;

                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--blanco-arena-subtle)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--verde-piedra)' }}>
                        #{m.id} <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--texto-secundario)', fontWeight: 'normal' }}>
                          {m.fecha ? new Date(m.fecha).toLocaleString('es-CO') : 'Reciente'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {esEntrada ? (
                          <span className="badge badge-ok">
                            <ArrowDownLeft size={13} /> ENTRADA (COMPRA)
                          </span>
                        ) : (
                          <span className="badge badge-critico">
                            <ArrowUpRight size={13} /> SALIDA (MERMA)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--verde-piedra-dark)' }}>
                        {m.ingrediente?.nombre}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', fontSize: '1rem', color: esEntrada ? 'var(--verde-piedra)' : '#991B1B' }}>
                        {esEntrada ? `+${m.cantidad}` : `-${m.cantidad}`} {m.ingrediente?.unidadDeMedida?.abreviatura || 'g'}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--texto-secundario)' }}>
                        {m.motivo}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.85rem' }}>
                        {m.proveedor ? (
                          <span style={{ fontWeight: '600', color: 'var(--verde-piedra-dark)' }}>{m.proveedor.nombre}</span>
                        ) : (
                          <span style={{ color: 'var(--texto-secundario)' }}>Interno / Cocina</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL REGISTRO DE MOVIMIENTO */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)' }}>
                Registrar Movimiento de Inventario
              </h3>
              <button onClick={() => setModalAbierto(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>

            {error && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '0.85rem' }}>
                <AlertCircle size={15} /> {error}
              </div>
            )}

            <form onSubmit={handleGuardarMovimiento}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Tipo de Movimiento *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                  <button type="button" className={`btn ${tipoMovimientoId === 1 ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px 4px', fontSize: '0.78rem', minHeight: '38px' }} onClick={() => { setTipoMovimientoId(1); setMotivo('Compra de insumo a proveedor'); }}>
                    <ArrowDownLeft size={15} /> Entrada (Compra)
                  </button>
                  <button type="button" className={`btn ${tipoMovimientoId === 2 ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '8px 4px', fontSize: '0.78rem', minHeight: '38px' }} onClick={() => { setTipoMovimientoId(2); setMotivo('Salida por merma o desperdicio'); }}>
                    <ArrowUpRight size={15} /> Salida (Merma)
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Insumo / Ingrediente *</label>
                <select value={ingredienteId} onChange={(e) => setIngredienteId(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }}>
                  {ingredientes.map((ing) => (
                    <option key={ing.id} value={ing.id}>{ing.nombre} (Stock: {ing.stock})</option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Cantidad *</label>
                  <input type="number" step="0.01" required value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Unidad de Medida *</label>
                  <select value={unidadId} onChange={(e) => setUnidadId(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }}>
                    {unidades.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>
                    ))}
                  </select>
                </div>
              </div>

              {tipoMovimientoId === 1 && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Proveedor</label>
                  <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }}>
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Motivo / Observación *</label>
                <input type="text" required value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Confirmar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
