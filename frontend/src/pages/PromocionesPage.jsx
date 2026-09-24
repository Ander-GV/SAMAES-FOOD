import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, CheckCircle, ShieldAlert, AlertCircle, Copy, Sparkles, Percent, DollarSign, Calendar, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const PromocionesPage = () => {
  const { isAdmin } = useAuth();
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [deletingPromo, setDeletingPromo] = useState(null);
  const [copiadoCode, setCopiadoCode] = useState(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [codigoCupon, setCodigoCupon] = useState('');
  const [tipoDescuento, setTipoDescuento] = useState('PORCENTAJE'); // 'PORCENTAJE' | 'MONTO_FIJO'
  const [valor, setValor] = useState('');
  const [usosMaximos, setUsosMaximos] = useState('');
  const [montoMinimoPedido, setMontoMinimoPedido] = useState('');
  const [activa, setActiva] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const fetchPromociones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/promociones');
      setPromociones(response.data);
    } catch (err) {
      setError('Error al cargar la lista de promociones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchPromociones();
    }
  }, [isAdmin]);

  const abrirModalCrear = () => {
    setEditingPromo(null);
    setNombre('');
    setCodigoCupon('');
    setTipoDescuento('PORCENTAJE');
    setValor('');
    setUsosMaximos('');
    setMontoMinimoPedido('');
    setActiva(true);
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (promo) => {
    setEditingPromo(promo);
    setNombre(promo.nombre || '');
    setCodigoCupon(promo.codigoCupon || promo.codigo || '');
    setTipoDescuento(promo.tipoDescuento || (promo.porcentajeDescuento ? 'PORCENTAJE' : 'MONTO_FIJO'));
    setValor(promo.valor ? promo.valor.toString() : (promo.porcentajeDescuento ? promo.porcentajeDescuento.toString() : (promo.montoFijoDescuento ? promo.montoFijoDescuento.toString() : '')));
    setUsosMaximos(promo.usosMaximos ? promo.usosMaximos.toString() : '');
    setMontoMinimoPedido(promo.montoMinimoPedido ? promo.montoMinimoPedido.toString() : '');
    setActiva(promo.activa !== false);
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const handleGenerarCodigoAleatorio = () => {
    const prefijos = ['SAMAES', 'PROMO', 'DESCUENTO', 'VIP', 'FEST'];
    const randomPrefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setCodigoCupon(`${randomPrefijo}${randomNum}`);
  };

  const handleSubmitPromo = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const valNum = parseFloat(valor) || 0;
    const payload = {
      nombre,
      codigo: codigoCupon.trim().toUpperCase(),
      codigoCupon: codigoCupon.trim().toUpperCase(),
      tipoDescuento,
      valor: valNum,
      porcentajeDescuento: tipoDescuento === 'PORCENTAJE' ? valNum : null,
      montoFijoDescuento: tipoDescuento === 'MONTO_FIJO' ? valNum : null,
      usosMaximos: usosMaximos ? parseInt(usosMaximos) : null,
      montoMinimoPedido: montoMinimoPedido ? parseFloat(montoMinimoPedido) : null,
      activa
    };

    try {
      if (editingPromo) {
        await api.put(`/promociones/${editingPromo.id}`, payload);
        setMensaje(`¡Promoción "${nombre}" actualizada correctamente!`);
      } else {
        await api.post('/promociones', payload);
        setMensaje(`¡Promoción "${nombre}" creada con éxito!`);
      }
      setModalAbierto(false);
      fetchPromociones();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la promoción.');
    }
  };

  const confirmarEliminar = async () => {
    if (!deletingPromo) return;
    setMensaje('');
    setError('');

    try {
      await api.delete(`/promociones/${deletingPromo.id}`);
      setMensaje(`¡Promoción "${deletingPromo.nombre}" eliminada correctamente!`);
      setDeletingPromo(null);
      fetchPromociones();
    } catch (err) {
      setError('Error al eliminar la promoción.');
      setDeletingPromo(null);
    }
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiadoCode(codigo);
    setTimeout(() => setCopiadoCode(null), 2000);
  };

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '28px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={44} style={{ marginBottom: '14px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>La administración de promociones y cupones de descuento está restringida al ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Promociones & Cupones de Descuento</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Configura cupones de uso ilimitado o establece un límite de usos permitidos.</p>
          </div>
          <button onClick={abrirModalCrear} className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
            <Plus size={16} /> Nueva Promoción
          </button>
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

        {/* GRILLA DE PROMOCIONES Y CUPONES */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando cupones y promociones...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            {promociones.map((p) => {
              const limite = p.usosMaximos;
              const usados = p.usosActuales || 0;
              const agotado = limite && usados >= limite;

              return (
                <div key={p.id} style={{
                  backgroundColor: 'var(--blanco-arena-card)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  border: p.activa && !agotado ? '2px solid var(--trigo)' : '2px solid #D1D5DB',
                  opacity: p.activa && !agotado ? 1 : 0.7,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span className="badge badge-trigo" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag size={13} /> {p.tipoDescuento === 'PORCENTAJE' ? `${p.valor}% DESC.` : formatCOP(p.valor)}
                      </span>
                      <span className={`badge ${p.activa && !agotado ? 'badge-ok' : 'badge-critico'}`}>
                        {agotado ? 'Agotado' : p.activa ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: 'var(--verde-piedra-dark)', marginBottom: '4px' }}>{p.nombre}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginBottom: '14px' }}>{p.descripcion || 'Sin descripción'}</p>

                    {/* CÓDIGO CUPÓN COPIABLE */}
                    {p.codigoCupon && (
                      <div style={{
                        backgroundColor: 'var(--verde-piedra)',
                        color: 'var(--trigo)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                        fontFamily: 'monospace',
                        fontWeight: '800',
                        fontSize: '1rem'
                      }}>
                        <span>{p.codigoCupon}</span>
                        <button 
                          onClick={() => copiarCodigo(p.codigoCupon)}
                          style={{ background: 'none', border: 'none', color: 'var(--blanco-arena)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                        >
                          <Copy size={13} /> {copiadoCode === p.codigoCupon ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    )}

                    {/* CONTROL DE USOS Y LÍMITES */}
                    <div style={{ backgroundColor: 'var(--blanco-arena-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ color: 'var(--texto-secundario)' }}>Límite de Usos:</span>
                        <span style={{ fontWeight: '700', color: 'var(--verde-piedra-dark)' }}>{limite ? `${usados} / ${limite}` : 'Ilimitado (∞)'}</span>
                      </div>
                      {p.montoMinimoPedido && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--texto-secundario)' }}>Monto Mínimo:</span>
                          <span style={{ fontWeight: '700', color: 'var(--verde-piedra)' }}>{formatCOP(p.montoMinimoPedido)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ACCIONES */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--blanco-arena-subtle)', paddingTop: '12px' }}>
                    <button onClick={() => abrirModalEditar(p)} className="btn btn-outline" style={{ flex: 1, padding: '6px', fontSize: '0.78rem', minHeight: '34px' }}>
                      <Edit2 size={13} /> Editar
                    </button>
                    <button onClick={() => setDeletingPromo(p)} style={{ border: 'none', background: '#FEE2E2', color: '#991B1B', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL CREAR / EDITAR PROMOCIÓN */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)' }}>
                {editingPromo ? 'Editar Promoción' : 'Crear Nueva Promoción'}
              </h3>
              <button onClick={() => setModalAbierto(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>

            <form onSubmit={handleSubmitPromo}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nombre de la Promoción *</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. 10% Descuento Frecuentes" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Código del Cupón (POS) *</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input type="text" required value={codigoCupon} onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())} placeholder="Ej. SAMAES10" style={{ flex: 1, padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--trigo)', fontWeight: '800', fontFamily: 'monospace', textTransform: 'uppercase', fontSize: '0.9rem' }} />
                  <button type="button" onClick={handleGenerarCodigoAleatorio} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '8px 10px', minHeight: 'auto' }}>
                    <Sparkles size={13} /> Generar
                  </button>
                </div>
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Tipo de Descuento *</label>
                  <select value={tipoDescuento} onChange={(e) => setTipoDescuento(e.target.value)} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontWeight: '700', fontSize: '0.85rem' }}>
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="MONTO_FIJO">Monto Fijo (COP $)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Valor del Descuento *</label>
                  <input type="number" step="any" required value={valor} onChange={(e) => setValor(e.target.value)} placeholder={tipoDescuento === 'PORCENTAJE' ? 'Ej. 15' : 'Ej. 5000'} style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Límite Máximo de Usos</label>
                  <input type="number" value={usosMaximos} onChange={(e) => setUsosMaximos(e.target.value)} placeholder="Ej. 50 (o vacío = Ilimitado)" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Monto Mínimo (COP)</label>
                  <input type="number" value={montoMinimoPedido} onChange={(e) => setMontoMinimoPedido(e.target.value)} placeholder="Ej. 30000" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--verde-piedra)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Promoción Activa en Caja (POS)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>{editingPromo ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN ELIMINAR */}
      {deletingPromo && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', border: '3px solid #EF4444' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#991B1B', marginBottom: '8px' }}>
              ¿Eliminar Promoción "{deletingPromo.nombre}"?
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.88rem', marginBottom: '20px' }}>
              El cupón "{deletingPromo.codigoCupon}" ya no podrá ser aplicado en el Punto de Venta (POS).
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDeletingPromo(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Cancelar</button>
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
