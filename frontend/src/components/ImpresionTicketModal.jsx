import React, { useState } from 'react';
import { Printer, X, ChefHat, Receipt, Check } from 'lucide-react';

export const ImpresionTicketModal = ({ pedido, onClose }) => {
  const [modo, setModo] = useState('COCINA'); // 'COCINA' o 'CLIENTE'
  const [formato, setFormato] = useState(() => localStorage.getItem('samaes_formato_impresora') || '80mm');

  if (!pedido) return null;

  const handleCambiarFormato = (nuevoFormato) => {
    setFormato(nuevoFormato);
    localStorage.setItem('samaes_formato_impresora', nuevoFormato);
  };

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const fechaFormateada = pedido.fechaInicio 
    ? new Date(pedido.fechaInicio).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
    : new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

  // Extraer costo de domicilio si viene en pedido.costoDomicilio / costoEnvio o en el texto
  let costoEnvioCalculado = pedido.costoDomicilio || pedido.costoEnvio || 0;
  if (!costoEnvioCalculado && pedido.direccionEntrega && pedido.direccionEntrega.includes('Envío:')) {
    const match = pedido.direccionEntrega.match(/Envío:\s*\$?([\d\.,]+)/i);
    if (match) {
      costoEnvioCalculado = Number(match[1].replace(/\./g, '').replace(/,/g, '')) || 0;
    }
  }

  // Ancho de previsualización en pantalla según formato
  const anchoPreview = formato === '58mm' ? '260px' : formato === 'a4' ? '420px' : '340px';

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="modal-content" style={{
        backgroundColor: '#FFF',
        borderRadius: '12px',
        maxWidth: '520px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* CABECERA MODAL (NO SE IMPRIME) */}
        <div className="no-print" style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--verde-piedra-dark)',
          color: '#FFF',
          borderRadius: '12px 12px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={20} color="var(--trigo)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF' }}>Configuración de Impresión</h3>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* SELECTOR DE TIPO DE IMPRESORA / TAMAÑO (NO SE IMPRIME) */}
        <div className="no-print" style={{
          padding: '12px 20px',
          backgroundColor: '#F3F4F6',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--texto-secundario)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
            🖨️ Tipo / Formato de Impresora:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleCambiarFormato('80mm')}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                border: formato === '80mm' ? '2px solid var(--verde-piedra)' : '1px solid #D1D5DB',
                backgroundColor: formato === '80mm' ? 'var(--verde-piedra)' : '#FFF',
                color: formato === '80mm' ? '#FFF' : '#374151',
                transition: 'all 0.15s ease'
              }}
            >
              Térmica 80mm
            </button>

            <button
              type="button"
              onClick={() => handleCambiarFormato('58mm')}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                border: formato === '58mm' ? '2px solid var(--verde-piedra)' : '1px solid #D1D5DB',
                backgroundColor: formato === '58mm' ? 'var(--verde-piedra)' : '#FFF',
                color: formato === '58mm' ? '#FFF' : '#374151',
                transition: 'all 0.15s ease'
              }}
            >
              Térmica 58mm
            </button>

            <button
              type="button"
              onClick={() => handleCambiarFormato('a4')}
              style={{
                padding: '6px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                border: formato === 'a4' ? '2px solid var(--verde-piedra)' : '1px solid #D1D5DB',
                backgroundColor: formato === 'a4' ? 'var(--verde-piedra)' : '#FFF',
                color: formato === 'a4' ? '#FFF' : '#374151',
                transition: 'all 0.15s ease'
              }}
            >
              Epson / A4
            </button>
          </div>
        </div>

        {/* SELECTOR DE MODO: COCINA VS CLIENTE (NO SE IMPRIME) */}
        <div className="no-print" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          padding: '14px 20px',
          backgroundColor: '#FAFAFA',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <button 
            type="button"
            className={`btn ${modo === 'COCINA' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setModo('COCINA')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <ChefHat size={16} /> Comanda Cocina
          </button>
          <button 
            type="button"
            className={`btn ${modo === 'CLIENTE' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setModo('CLIENTE')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <Receipt size={16} /> Ticket Cliente
          </button>
        </div>

        {/* ÁREA DE TICKET IMPRIMIBLE */}
        <div style={{ padding: '20px', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center' }}>
          <div id="ticket-imprimible" className={`ticket-termico formato-${formato}`} style={{
            backgroundColor: '#FFF',
            width: '100%',
            maxWidth: anchoPreview,
            padding: formato === '58mm' ? '12px 10px' : formato === 'a4' ? '24px 20px' : '20px 16px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: formato === '58mm' ? '11px' : formato === 'a4' ? '14px' : '13px',
            color: '#000',
            lineHeight: 1.3
          }}>

            {/* VISTA 1: COMANDA DE COCINA */}
            {modo === 'COCINA' ? (
              <div>
                <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>*** COCINA ***</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '4px' }}>ORDEN #{pedido.id}</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px', backgroundColor: '#000', color: '#FFF', padding: '3px 6px', display: 'inline-block', borderRadius: '3px' }}>
                    {pedido.direccionEntrega || pedido.tipoPedido?.nombre || 'MESA'}
                  </div>
                  <div style={{ fontSize: '11px', marginTop: '6px' }}>Fecha/Hora: {fechaFormateada}</div>
                  <div style={{ fontSize: '11px' }}>Atendido por: {pedido.usuario?.codigoEmpleado || 'POS'}</div>
                </div>

                <div style={{ borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '6px' }}>
                    <span>CANT</span>
                    <span>DESCRIPCIÓN / NOTAS</span>
                  </div>

                  {(!pedido.detalles || pedido.detalles.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '10px' }}>* Sin detalles registrados *</div>
                  ) : (
                    pedido.detalles.map((d, idx) => (
                      <div key={idx} style={{ marginBottom: '10px', borderBottom: '1px dotted #ccc', paddingBottom: '6px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '17px', fontWeight: '900' }}>{d.cantidad}x</span>
                          <span style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {d.nombreProducto || (d.producto && d.producto.nombre) || `Plato #${d.productoId}`}
                          </span>
                        </div>
                        {d.observaciones && d.observaciones.trim() && (
                          <div style={{
                            marginLeft: '36px',
                            marginTop: '3px',
                            fontSize: '13px',
                            fontWeight: '900',
                            backgroundColor: '#E5E7EB',
                            padding: '3px 6px',
                            borderRadius: '3px',
                            border: '1px dashed #000'
                          }}>
                            👉 NOTA: {d.observaciones}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                  --- FIN DE COMANDA COCINA ---
                </div>
              </div>
            ) : (
              /* VISTA 2: TICKET DE CLIENTE / FACTURA */
              <div>
                <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>SAMAES FOOD</div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>Buen Sabor, Buen Ambiente</div>
                  <div style={{ fontSize: '10px', marginTop: '2px' }}>Tel / Domicilios: 316 553 0486</div>
                  <div style={{ fontSize: '10px' }}>Ubicación: Al lado de Vacilao</div>
                  
                  <div style={{ marginTop: '8px', borderTop: '1px dotted #000', paddingTop: '6px', textAlign: 'left', fontSize: '11px' }}>
                    <div><strong>Ticket / Factura:</strong> #{pedido.id}</div>
                    <div><strong>Fecha:</strong> {fechaFormateada}</div>
                    <div><strong>Atendido por:</strong> {pedido.usuario?.codigoEmpleado || 'Cajero'}</div>
                    <div><strong>Ubicación:</strong> {pedido.direccionEntrega || pedido.tipoPedido?.nombre || 'Local'}</div>
                    {pedido.nombreDestinatario && (
                      <div><strong>Cliente:</strong> {pedido.nombreDestinatario}</div>
                    )}
                  </div>
                </div>

                {/* TABLA DE PRODUCTOS */}
                <div style={{ borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 70px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '6px', fontSize: '11px' }}>
                    <span>CT</span>
                    <span>DESCRIPCIÓN</span>
                    <span style={{ textAlign: 'right' }}>TOTAL</span>
                  </div>

                  {(!pedido.detalles || pedido.detalles.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '10px' }}>* Sin detalles registrados *</div>
                  ) : (
                    pedido.detalles.map((d, idx) => (
                      <div key={idx} style={{ marginBottom: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 70px' }}>
                          <span style={{ fontWeight: 'bold' }}>{d.cantidad}</span>
                          <span>{d.nombreProducto || (d.producto && d.producto.nombre) || `Plato #${d.productoId}`}</span>
                          <span style={{ textAlign: 'right', fontWeight: 'bold' }}>
                            {formatCOP(d.precioTotal || (d.precioUnitario * d.cantidad) || 0)}
                          </span>
                        </div>
                        {d.observaciones && d.observaciones.trim() && (
                          <div style={{ marginLeft: '24px', fontSize: '10px', fontStyle: 'italic', color: '#4B5563' }}>
                            * {d.observaciones}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* TOTALES */}
                <div style={{ borderBottom: '2px dashed #000', paddingBottom: '8px', marginBottom: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>SUBTOTAL PLATOS:</span>
                    <span>{formatCOP(pedido.subtotal || pedido.total || 0)}</span>
                  </div>
                  {costoEnvioCalculado > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 'bold' }}>
                      <span>DOMICILIO / ENVÍO:</span>
                      <span>+{formatCOP(costoEnvioCalculado)}</span>
                    </div>
                  )}
                  {pedido.descuento > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', fontWeight: 'bold' }}>
                      <span>DESCUENTO ({pedido.promocion?.nombre || 'Cupón'}):</span>
                      <span>-{formatCOP(pedido.descuento)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '4px' }}>
                    <span>TOTAL A PAGAR:</span>
                    <span>{formatCOP(pedido.total || 0)}</span>
                  </div>
                </div>

                {/* MENSAJE DE PIE */}
                <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>¡GRACIAS POR SU COMPRA!</div>
                  <div>Esperamos servirle de nuevo pronto</div>
                  <div style={{ fontSize: '9px', marginTop: '6px', color: '#666' }}>SAMAES FOOD POS System</div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* BOTONES DE ACCIÓN (NO SE IMPRIMEN) */}
        <div className="no-print" style={{
          padding: '16px 20px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFF',
          borderRadius: '0 0 12px 12px'
        }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={onClose}
          >
            Cerrar
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: '700' }}
          >
            <Printer size={18} /> Imprimir {modo === 'COCINA' ? 'Comanda' : 'Ticket'}
          </button>
        </div>

      </div>
    </div>
  );
};
