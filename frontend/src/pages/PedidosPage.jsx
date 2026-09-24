import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Ban, Clock, RefreshCw, Printer, DollarSign, CreditCard, Sparkles, AlertCircle, X, ChevronRight, Filter } from 'lucide-react';
import api from '../services/api';
import { ImpresionTicketModal } from '../components/ImpresionTicketModal';

export const PedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pagosMap, setPagosMap] = useState({}); // Mapa de { pedidoId: totalPagado }
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTES'); // 'PENDIENTES' | 'COMPLETADOS' | 'CANCELADOS' | 'TODOS'
  
  // Modales
  const [pedidoImprimir, setPedidoImprimir] = useState(null);
  const [pedidoCobro, setPedidoCobro] = useState(null);
  const [pedidoCancelar, setPedidoCancelar] = useState(null);

  // Formulario de Cobro / Abono Mixto
  const [tipoPagoId, setTipoPagoId] = useState(1); // 1: Efectivo, 2: Tarjeta, 3: Transferencia
  const [montoAbono, setMontoAbono] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [loadingPago, setLoadingPago] = useState(false);
  const [loadingCancelar, setLoadingCancelar] = useState(false);
  const [errorPago, setErrorPago] = useState('');
  const [mensajePago, setMensajePago] = useState('');

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const [resPedidos, resPagos] = await Promise.all([
        api.get('/pedidos'),
        api.get('/pagos')
      ]);

      // Mapear sumatoria de pagos por cada pedido
      const map = {};
      (resPagos.data || []).forEach((pago) => {
        const pedId = pago.pedido?.id || pago.pedidoId;
        if (pedId) {
          map[pedId] = (map[pedId] || 0) + (pago.monto || 0);
        }
      });
      setPagosMap(map);

      // Ordenar por ID descendente (los más recientes primero)
      const sorted = (resPedidos.data || []).sort((a, b) => b.id - a.id);
      setPedidos(sorted);
    } catch (err) {
      console.error('Error al cargar pedidos o pagos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleAbrirCobro = (p) => {
    const totalCuenta = p.total || 0;
    const yaPagado = pagosMap[p.id] || 0;
    const saldoPendiente = Math.max(0, totalCuenta - yaPagado);

    setPedidoCobro(p);
    setMontoAbono(saldoPendiente.toString());
    setMontoRecibido('');
    setTipoPagoId(1);
    setErrorPago('');
    setMensajePago('');
  };

  const handleProcesarPago = async () => {
    if (loadingPago) return;
    if (!montoAbono || parseFloat(montoAbono) <= 0) {
      setErrorPago('Por favor ingresa un monto válido a pagar.');
      return;
    }

    const valorAbono = parseFloat(montoAbono);
    const totalCuenta = pedidoCobro.total || 0;
    const yaPagado = pagosMap[pedidoCobro.id] || 0;
    const saldoPendiente = Math.max(0, totalCuenta - yaPagado);

    if (valorAbono > saldoPendiente + 0.01) {
      setErrorPago(`El monto no puede superar el saldo pendiente (${formatCOP(saldoPendiente)}).`);
      return;
    }

    setLoadingPago(true);
    setErrorPago('');
    setMensajePago('');

    try {
      // 1. Registrar el pago en el backend
      await api.post('/pagos', {
        pedido: { id: pedidoCobro.id },
        tipoPago: { id: tipoPagoId },
        monto: valorAbono
      });

      // 2. Si el abono liquida la cuenta en su totalidad, marcar pedido como COMPLETADO (id: 4)
      if (Math.abs(saldoPendiente - valorAbono) < 1) {
        await api.put(`/pedidos/${pedidoCobro.id}/estado?nuevoEstadoId=4`);
      }

      setMensajePago('¡Pago registrado con éxito!');
      await fetchPedidos();
      setTimeout(() => {
        setPedidoCobro(null);
      }, 1200);
    } catch (err) {
      setErrorPago('Error al registrar el pago en el servidor.');
    } finally {
      setLoadingPago(false);
    }
  };

  const handleCancelarPedido = async () => {
    if (!pedidoCancelar || loadingCancelar) return;
    setLoadingCancelar(true);
    try {
      await api.put(`/pedidos/${pedidoCancelar.id}/estado?nuevoEstadoId=5`);
      setPedidoCancelar(null);
      await fetchPedidos();
    } catch (err) {
      console.error(err);
      alert('Error al cancelar el pedido en el servidor.');
    } finally {
      setLoadingCancelar(false);
    }
  };


  const totalPagadoAnterior = pedidoCobro ? (pagosMap[pedidoCobro.id] || 0) : 0;
  const saldoPendienteActual = pedidoCobro ? Math.max(0, (pedidoCobro.total || 0) - totalPagadoAnterior) : 0;

  // Filtrado de pedidos según pestaña
  const pedidosFiltrados = pedidos.filter((p) => {
    const nombreEstado = (p.estadoPedido?.nombre || '').toUpperCase();
    const esCompletado = nombreEstado.includes('COMPLETADO') || p.estadoPedido?.id === 4;
    const esCancelado = nombreEstado.includes('CANCELADO') || p.estadoPedido?.id === 5;

    if (filtroEstado === 'PENDIENTES') {
      return !esCancelado && !esCompletado;
    }
    if (filtroEstado === 'COMPLETADOS') {
      return esCompletado;
    }
    if (filtroEstado === 'CANCELADOS') {
      return esCancelado;
    }
    return true; // 'TODOS'
  });

  return (
    <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: 'clamp(14px, 3vw, 28px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Tablero de Pedidos & Comandas</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Monitorea pedidos, notas especiales para cocina e imprime tickets térmicos.</p>
          </div>
          <button onClick={fetchPedidos} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>

        {/* PESTAÑAS DE FILTRADO POR ESTADO */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid var(--blanco-arena-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
          <button 
            className={`btn ${filtroEstado === 'PENDIENTES' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltroEstado('PENDIENTES')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            <Clock size={15} /> Pendientes ({pedidos.filter(p => p.estadoPedido?.id !== 4 && p.estadoPedido?.id !== 5 && !p.estadoPedido?.nombre?.toUpperCase().includes('COMPLETADO') && !p.estadoPedido?.nombre?.toUpperCase().includes('CANCELADO')).length})
          </button>

          <button 
            className={`btn ${filtroEstado === 'COMPLETADOS' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltroEstado('COMPLETADOS')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            <CheckCircle2 size={15} /> Completadas ({pedidos.filter(p => p.estadoPedido?.id === 4 || p.estadoPedido?.nombre?.toUpperCase().includes('COMPLETADO')).length})
          </button>

          <button 
            className={`btn ${filtroEstado === 'CANCELADOS' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltroEstado('CANCELADOS')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            <Ban size={15} /> Canceladas ({pedidos.filter(p => p.estadoPedido?.id === 5 || p.estadoPedido?.nombre?.toUpperCase().includes('CANCELADO')).length})
          </button>

          <button 
            className={`btn ${filtroEstado === 'TODOS' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltroEstado('TODOS')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            <Filter size={15} /> Todas ({pedidos.length})
          </button>
        </div>

        {/* GRILLA DE PEDIDOS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando comandas y pagos...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--blanco-arena-card)', borderRadius: 'var(--radius-md)' }}>
            <ClipboardList size={44} color="var(--trigo-dark)" style={{ marginBottom: '14px' }} />
            <h3>No hay pedidos en esta categoría</h3>
            <p style={{ color: 'var(--texto-secundario)', marginTop: '4px', fontSize: '0.88rem' }}>Cambia la pestaña de filtro arriba para ver otras comandas.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
            {pedidosFiltrados.map((p) => {
              const nombreEstado = (p.estadoPedido?.nombre || '').toUpperCase();
              const esCompletado = nombreEstado.includes('COMPLETADO') || p.estadoPedido?.id === 4;
              const esCancelado = nombreEstado.includes('CANCELADO') || p.estadoPedido?.id === 5;

              const totalCuenta = p.total || 0;
              const abonadoActual = pagosMap[p.id] || 0;
              const saldoPendiente = Math.max(0, totalCuenta - abonadoActual);
              const tieneAbonos = abonadoActual > 0;

              return (
                <div key={p.id} style={{
                  backgroundColor: 'var(--blanco-arena-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  boxShadow: 'var(--shadow-sm)',
                  border: esCompletado ? '2px solid var(--exito)' : esCancelado ? '2px solid #EF4444' : '2px solid var(--trigo)',
                  opacity: esCancelado ? 0.75 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--verde-piedra-dark)' }}>Pedido #{p.id}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => setPedidoImprimir(p)}
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', borderRadius: '4px', minHeight: 'auto' }}
                          title="Imprimir comanda o ticket térmico"
                        >
                          <Printer size={12} /> Ticket
                        </button>
                        <span className={`badge ${esCompletado ? 'badge-ok' : esCancelado ? 'badge-critico' : 'badge-bajo'}`}>
                          {esCompletado ? <CheckCircle2 size={13} /> : esCancelado ? <Ban size={13} /> : <Clock size={13} />} {p.estadoPedido?.nombre || 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginBottom: '3px' }}>
                      <strong>Mesa / Ubicación:</strong> {p.direccionEntrega || 'Mesa Local'} ({p.tipoPedido?.nombre || 'Mesa'})
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginBottom: '10px' }}>
                      <strong>Atendido por:</strong> {p.usuario?.codigoEmpleado || 'Atención POS'}
                    </div>

                    {/* LISTA DE PLATOS Y NOTAS DE COCINA */}
                    {p.detalles && p.detalles.length > 0 && (
                      <div style={{ backgroundColor: '#F9FAFB', border: '1px solid rgba(20,56,44,0.08)', borderRadius: '6px', padding: '8px 10px', marginBottom: '12px', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: '700', color: 'var(--verde-piedra-dark)', marginBottom: '4px', borderBottom: '1px solid #E5E7EB', paddingBottom: '2px' }}>
                          Platos Ordenados:
                        </div>
                        {p.detalles.map((d, idx) => (
                          <div key={idx} style={{ marginBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1F2937' }}>
                              <span>• {d.cantidad}x {d.producto?.nombre}</span>
                              <span style={{ fontWeight: '600' }}>{formatCOP(d.precioUnitario * d.cantidad)}</span>
                            </div>
                            {d.observaciones && (
                              <div style={{ fontSize: '0.72rem', color: '#B45309', marginLeft: '10px', fontStyle: 'italic' }}>
                                ↳ Nota cocina: {d.observaciones}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    {/* RESUMEN FINANCIERO DE LA COMANDA */}
                    <div style={{ backgroundColor: 'var(--blanco-arena-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--texto-secundario)' }}>
                        <span>Total de la Cuenta:</span>
                        <span style={{ fontWeight: '700' }}>{formatCOP(totalCuenta)}</span>
                      </div>
                      
                      {tieneAbonos && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--exito)', fontWeight: '700', marginTop: '2px' }}>
                          <span>Abonado hasta hoy:</span>
                          <span>-{formatCOP(abonadoActual)}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '800', color: esCompletado ? 'var(--exito)' : 'var(--verde-piedra-dark)', borderTop: '1px dashed var(--trigo-dark)', paddingTop: '4px', marginTop: '4px' }}>
                        <span>{esCompletado ? 'Cuenta Pagada:' : 'Saldo por Cobrar:'}</span>
                        <span>{formatCOP(esCompletado ? totalCuenta : saldoPendiente)}</span>
                      </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {!esCompletado && !esCancelado && (
                        <>
                          <button 
                            onClick={() => handleAbrirCobro(p)}
                            className="btn btn-trigo"
                            style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', minHeight: '38px' }}
                          >
                            <DollarSign size={15} /> Cobrar / Abono
                          </button>
                          <button 
                            onClick={() => setPedidoCancelar(p)}
                            className="btn"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '8px 10px', fontSize: '0.82rem', minHeight: '38px' }}
                            title="Cancelar este pedido"
                          >
                            <Ban size={15} />
                          </button>
                        </>
                      )}

                      {esCompletado && (
                        <button 
                          onClick={() => setPedidoImprimir(p)}
                          className="btn btn-outline"
                          style={{ width: '100%', padding: '8px', fontSize: '0.82rem', minHeight: '36px' }}
                        >
                          <Printer size={15} /> Imprimir Copia de Ticket
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL DE PAGOS MIXTOS / ABONOS */}
      {pedidoCobro && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)' }}>
                Cobro / Abono Pedido #{pedidoCobro.id}
              </h3>
              <button 
                onClick={() => setPedidoCobro(null)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>

            {/* RESUMEN DE PAGOS */}
            <div style={{ backgroundColor: 'var(--blanco-arena-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: '800', color: 'var(--verde-piedra-dark)', marginBottom: '4px' }}>
                <span>Total de la Cuenta:</span>
                <span>{formatCOP(pedidoCobro.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--exito)', fontWeight: '700', marginBottom: '2px' }}>
                <span>Abonado hasta el momento:</span>
                <span>-{formatCOP(totalPagadoAnterior)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', color: '#991B1B', borderTop: '1px dashed var(--trigo-dark)', paddingTop: '4px' }}>
                <span>Saldo Pendiente:</span>
                <span>{formatCOP(saldoPendienteActual)}</span>
              </div>
            </div>

            {mensajePago && (
              <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '14px' }}>
                <CheckCircle2 size={15} /> {mensajePago}
              </div>
            )}

            {errorPago && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '14px' }}>
                <AlertCircle size={15} /> {errorPago}
              </div>
            )}

            {/* SELECCIÓN DE TIPO DE PAGO */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Método de Pago:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '4px' }}>
                <button type="button" className={`btn ${tipoPagoId === 1 ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 4px', fontSize: '0.75rem', minHeight: '36px' }} onClick={() => setTipoPagoId(1)}>
                  <DollarSign size={13} /> Efectivo
                </button>
                <button type="button" className={`btn ${tipoPagoId === 2 ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 4px', fontSize: '0.75rem', minHeight: '36px' }} onClick={() => setTipoPagoId(2)}>
                  <CreditCard size={13} /> Tarjeta
                </button>
                <button type="button" className={`btn ${tipoPagoId === 3 ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 4px', fontSize: '0.75rem', minHeight: '36px' }} onClick={() => setTipoPagoId(3)}>
                  <Sparkles size={13} /> Transf.
                </button>
              </div>
            </div>

            {/* CAMPOS DE MONTO */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Monto a Cobrar ($):</label>
              <input 
                type="number"
                value={montoAbono}
                onChange={(e) => setMontoAbono(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.95rem' }}
              />
            </div>

            {tipoPagoId === 1 && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Monto Entregado por Cliente ($):</label>
                <input 
                  type="number"
                  placeholder="Ej. 50000"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.95rem' }}
                />
                {montoRecibido && parseFloat(montoRecibido) >= parseFloat(montoAbono) && (
                  <div style={{ marginTop: '6px', color: 'var(--verde-piedra)', fontWeight: '800', fontSize: '0.95rem' }}>
                    Devuelta / Cambio: {formatCOP(parseFloat(montoRecibido) - parseFloat(montoAbono))}
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={handleProcesarPago}
              disabled={loadingPago}
              className="btn btn-trigo"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {loadingPago ? 'Registrando...' : 'Confirmar Abono / Pago'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN CANCELAR PEDIDO */}
      {pedidoCancelar && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', border: '3px solid #EF4444' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#991B1B', marginBottom: '8px' }}>
              ¿Cancelar Pedido #{pedidoCancelar.id}?
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.88rem', marginBottom: '20px' }}>
              El pedido pasará a la pestaña de Canceladas y no podrá procesarse su cobro.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" disabled={loadingCancelar} onClick={() => setPedidoCancelar(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>No, Volver</button>
              <button 
                type="button" 
                onClick={handleCancelarPedido} 
                disabled={loadingCancelar} 
                className="btn btn-danger" 
                style={{ fontSize: '0.82rem', padding: '8px 14px', opacity: loadingCancelar ? 0.6 : 1 }}
              >
                {loadingCancelar ? 'Cancelando...' : 'Sí, Cancelar'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE IMPRESIÓN TÉRMICA */}
      {pedidoImprimir && (
        <ImpresionTicketModal 
          pedido={pedidoImprimir} 
          onClose={() => setPedidoImprimir(null)} 
        />
      )}

    </div>
  );
};
