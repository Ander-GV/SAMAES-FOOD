import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, CheckCircle, Send, Table, 
  Truck, PackageCheck, AlertCircle, User, Tag, UtensilsCrossed, 
  FileText, Printer, ArrowLeft, Search, X, Layers, ChevronLeft, ChevronRight, ZoomIn
} from 'lucide-react';
import api from '../services/api';
import { ImpresionTicketModal } from '../components/ImpresionTicketModal';

const MESAS_DEFAULT = [
  'Mesa #1', 'Mesa #2', 'Mesa #3', 'Mesa #4', 'Mesa #5', 
  'Mesa #6', 'Mesa #7', 'Mesa #8', 'Mesa #9', 'Mesa #10', 
  'Barra #1', 'Barra #2', 'Terraza #1', 'Terraza #2'
];

export const PosPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [categoriaSel, setCategoriaSel] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [productoZoomModal, setProductoZoomModal] = useState(null);
  const [tipoPedidoId, setTipoPedidoId] = useState(1); // 1: Mesa, 2: Para Llevar, 3: Domicilio
  const [numeroMesa, setNumeroMesa] = useState('Mesa #1');
  const [listaMesasDisponibles, setListaMesasDisponibles] = useState(MESAS_DEFAULT);

  // Vista activa en móvil: 'catalogo' | 'comanda'
  const [vistaMovil, setVistaMovil] = useState('catalogo');
  const categoriesContainerRef = useRef(null);

  const scrollCategorias = (direccion) => {
    const el = categoriesContainerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const step = 180;

    if (direccion === 'right') {
      if (el.scrollLeft >= maxScroll - 15) {
        // Da la vuelta al inicio (loop)
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: Math.min(step, maxScroll - el.scrollLeft), behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 15) {
        // Da la vuelta al final (loop)
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -Math.min(step, el.scrollLeft), behavior: 'smooth' });
      }
    }
  };

  // Datos específicos del Cliente para Domicilio
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [direccionCliente, setDireccionCliente] = useState('');
  const [costoDomicilio, setCostoDomicilio] = useState('');

  // Cupones y Descuentos
  const [codigoCupon, setCodigoCupon] = useState('');
  const [descuentoMonto, setDescuentoMonto] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState('');

  const [loading, setLoading] = useState(true);
  const [enviandoComanda, setEnviandoComanda] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [alertaInventario, setAlertaInventario] = useState('');
  const [error, setError] = useState('');
  const [pedidoReciente, setPedidoReciente] = useState(null);
  const [recetas, setRecetas] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [resProd, resCat, resPed, resRecetas] = await Promise.all([
        api.get('/productos').catch(() => ({ data: [] })),
        api.get('/categorias').catch(() => ({ data: [] })),
        api.get('/pedidos').catch(() => ({ data: [] })),
        api.get('/ingredientes-productos').catch(() => ({ data: [] }))
      ]);

      const rawProd = Array.isArray(resProd.data) ? resProd.data : [];
      const rawCat = Array.isArray(resCat.data) ? resCat.data : [];
      const rawPed = Array.isArray(resPed.data) ? resPed.data : [];
      const rawRec = Array.isArray(resRecetas.data) ? resRecetas.data : [];

      // Filtrar únicamente categorías activas para la barra de selección
      const categoriasActivas = rawCat.filter(c => c.estado !== false);
      
      // Filtrar únicamente productos con estado disponible/activo Y cuya categoría esté activa
      const productosActivos = rawProd.filter(p => {
        const prodActivo = p.estadoDelProducto?.id !== 3 && !p.estadoDelProducto?.nombre?.toLowerCase().includes('inactivo');
        const catActiva = !p.categoria || p.categoria.estado !== false;
        return prodActivo && catActiva;
      });

      setProductos(productosActivos);
      setCategorias(categoriasActivas);
      setRecetas(rawRec);

      // Cargar configuración de Mesas desde LocalStorage
      const mesasGuardadas = localStorage.getItem('samaes_mesas_config');
      if (mesasGuardadas) {
        try {
          const parsed = JSON.parse(mesasGuardadas);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setListaMesasDisponibles(parsed);
            setNumeroMesa(parsed[0]);
          }
        } catch (e) {
          setListaMesasDisponibles(MESAS_DEFAULT);
        }
      }

      // Filtrar órdenes activas pendientes (para indicar qué mesas están ocupadas)
      const pendientes = rawPed.filter(p => 
        p.estadoPedido?.id !== 4 && 
        p.estadoPedido?.id !== 5 && 
        !p.estadoPedido?.nombre?.toUpperCase().includes('COMPLETADO') && 
        !p.estadoPedido?.nombre?.toUpperCase().includes('CANCELADO')
      );
      setPedidosActivos(pendientes);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la información del punto de venta.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const agregarAlCarrito = (prod) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.producto.id === prod.id);
      if (existe) {
        return prev.map((item) =>
          item.producto.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { producto: prod, cantidad: 1, precioUnitario: prod.precio, observaciones: '' }];
    });
  };

  const modificarCantidad = (prodId, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.producto.id === prodId) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const modificarObservaciones = (prodId, obs) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.producto.id === prodId ? { ...item, observaciones: obs } : item
      )
    );
  };

  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => sum + (item.producto.precio || 0) * item.cantidad, 0);
  };

  const calcularTotalFinal = () => {
    const sub = calcularSubtotal();
    const costoEnvioNum = tipoPedidoId === 3 ? (Number(costoDomicilio) || 0) : 0;
    return Math.max(0, sub - descuentoMonto + costoEnvioNum);
  };

  const aplicarCuponDescuento = async () => {
    if (!codigoCupon.trim()) return;
    try {
      const res = await api.get('/promociones');
      const promo = (res.data || []).find(p => 
        (p.codigoCupon && p.codigoCupon.toUpperCase() === codigoCupon.trim().toUpperCase()) ||
        (p.codigo && p.codigo.toUpperCase() === codigoCupon.trim().toUpperCase())
      );
      
      if (promo && promo.activa !== false) {
        const sub = calcularSubtotal();
        let desc = 0;
        const tipoDesc = promo.tipoDescuento || (promo.porcentajeDescuento ? 'PORCENTAJE' : 'MONTO_FIJO');
        const valorPromo = promo.valor || promo.porcentajeDescuento || promo.montoFijoDescuento || 0;

        if (tipoDesc === 'PORCENTAJE') {
          desc = (sub * valorPromo) / 100;
        } else {
          desc = valorPromo;
        }
        setDescuentoMonto(desc);
        setMensajeCupon(`Cupón "${promo.codigoCupon || promo.codigo}" aplicado: -${formatCOP(desc)}`);
      } else {
        setDescuentoMonto(0);
        setMensajeCupon('Cupón no válido, inactivo o vencido');
      }
    } catch (e) {
      setDescuentoMonto(0);
      setMensajeCupon('Error al verificar el cupón');
    }
  };

  const totalCantidadItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const handleCrearPedido = async () => {
    if (carrito.length === 0 || enviandoComanda) {
      if (carrito.length === 0) setError('El carrito está vacío.');
      return;
    }

    if (tipoPedidoId === 3 && (!nombreCliente.trim() || !direccionCliente.trim())) {
      setError('Para domicilios es obligatorio el nombre y la dirección de entrega.');
      return;
    }

    setError('');
    setMensajeExito('');
    setAlertaInventario('');
    setEnviandoComanda(true);


    try {
      let direccionFinal = numeroMesa;
      const costoEnvioNum = tipoPedidoId === 3 ? (Number(costoDomicilio) || 0) : 0;
      if (tipoPedidoId === 2) {
        direccionFinal = 'Para Llevar / Takeout';
      } else if (tipoPedidoId === 3) {
        const envioText = costoEnvioNum > 0 ? ` (Envío: ${formatCOP(costoEnvioNum)})` : '';
        direccionFinal = `Domicilio: ${nombreCliente} - Tel: ${telefonoCliente} - Dir: ${direccionCliente}${envioText}`;
      }

      const subtotalCalculado = calcularSubtotal();
      const totalCalculado = calcularTotalFinal();

      // Verificar qué productos del carrito no tienen ingredientes vinculados en el inventario
      const productosSinInventario = carrito
        .filter(item => {
          const pId = item.producto.id;
          return !recetas.some(r => 
            (r.productos && r.productos.id === pId) || 
            (r.producto && r.producto.id === pId) ||
            (r.productoId === pId)
          );
        })
        .map(item => item.producto.nombre);

      const payload = {
        fechaInicio: new Date().toISOString(),
        tipoPedido: { id: tipoPedidoId },
        estadoPedido: { id: 1 },
        subtotal: subtotalCalculado,
        descuento: descuentoMonto,
        total: totalCalculado,
        direccionEntrega: direccionFinal,
        codigoCupon: codigoCupon.trim() || null,
        detalles: carrito.map((item) => ({
          productoId: item.producto.id,
          producto: { id: item.producto.id },
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
          observaciones: item.observaciones || ''
        }))
      };

      const res = await api.post('/pedidos', payload);
      
      // Abrir inmediatamente la pantalla / modal de impresión de tickets con todos los datos detallados
      const pedidoParaImprimir = {
        ...res.data,
        costoDomicilio: costoEnvioNum,
        costoEnvio: costoEnvioNum,
        direccionEntrega: res.data?.direccionEntrega || direccionFinal,
        subtotal: res.data?.subtotal ?? subtotalCalculado,
        descuento: res.data?.descuento ?? descuentoMonto,
        total: res.data?.total ?? totalCalculado,
        detalles: (res.data?.detalles && res.data.detalles.length > 0)
          ? res.data.detalles.map((d, i) => ({
              ...d,
              nombreProducto: d.nombreProducto || (d.producto && d.producto.nombre) || (carrito[i] ? carrito[i].producto.nombre : `Plato #${d.productoId}`),
              observaciones: d.observaciones || (carrito[i] ? carrito[i].observaciones : '')
            }))
          : carrito.map(item => ({
              cantidad: item.cantidad,
              nombreProducto: item.producto.nombre,
              precioUnitario: item.producto.precio,
              precioTotal: item.producto.precio * item.cantidad,
              observaciones: item.observaciones || ''
            }))
      };
      setPedidoReciente(pedidoParaImprimir);

      // Si no tenían insumos en inventario, notificar claramente
      if (productosSinInventario.length > 0) {
        setAlertaInventario(
          `Aviso de Inventario: Los siguientes productos no tienen ingredientes/receta afiliados en el inventario: "${productosSinInventario.join(', ')}". El pedido y ticket se generaron con éxito, pero no se descontó stock.`
        );
      }

      setMensajeExito(`¡Comanda creada con éxito para ${direccionFinal}!`);
      setCarrito([]);
      setCodigoCupon('');
      setDescuentoMonto(0);
      setNombreCliente('');
      setTelefonoCliente('');
      setDireccionCliente('');
      setCostoDomicilio('');
      setVistaMovil('catalogo');
      loadData();
    } catch (err) {
      console.error('Error al registrar pedido:', err);
      setError(err.response?.data?.message || 'Error al registrar el pedido en el servidor.');
    } finally {
      setEnviandoComanda(false);
    }
  };



  // Filtrado robusto de productos por Categoría y Buscador
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const prodCatId = p.categoria?.id != null ? p.categoria.id : p.categoriaId;
      const coincideCategoria = categoriaSel === null || Number(prodCatId) === Number(categoriaSel);
      
      const terminoBusqueda = busqueda.trim().toLowerCase();
      const coincideBusqueda = !terminoBusqueda || 
        (p.nombre && p.nombre.toLowerCase().includes(terminoBusqueda)) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(terminoBusqueda));

      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, categoriaSel, busqueda]);

  // Conteo de productos por categoría para feedback visual
  const conteoPorCategoria = useMemo(() => {
    const mapa = {};
    productos.forEach(p => {
      const catId = p.categoria?.id != null ? p.categoria.id : p.categoriaId;
      if (catId != null) {
        mapa[catId] = (mapa[catId] || 0) + 1;
      }
    });
    return mapa;
  }, [productos]);

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  };

  const obtenerEstadoMesa = (mesaNombre) => {
    const pedidoMesa = pedidosActivos.find(p => p.direccionEntrega && p.direccionEntrega.toLowerCase().includes(mesaNombre.toLowerCase()));
    if (pedidoMesa) {
      return { ocupada: true, pedidoId: pedidoMesa.id, total: pedidoMesa.total };
    }
    return { ocupada: false };
  };

  return (
    <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: 'clamp(8px, 2.5vw, 24px)', width: '100%', overflowX: 'hidden' }}>
      
      {/* PESTAÑAS MÓVILES PARA CAMBIAR ENTRE CATÁLOGO Y COMANDA (< 1024px) */}
      <div className="pos-mobile-tabs" style={{ display: 'none', marginBottom: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--blanco-arena-card)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--trigo)', boxShadow: 'var(--shadow-sm)' }}>
          <button 
            onClick={() => setVistaMovil('catalogo')}
            className="btn"
            style={{
              backgroundColor: vistaMovil === 'catalogo' ? 'var(--verde-piedra)' : 'transparent',
              color: vistaMovil === 'catalogo' ? '#FFF' : 'var(--texto-principal)',
              padding: '10px 12px',
              fontSize: '0.88rem',
              fontWeight: '700',
              borderRadius: 'var(--radius-sm)',
              minHeight: '40px'
            }}
          >
            <UtensilsCrossed size={16} /> Carta ({productos.length})
          </button>
          <button 
            onClick={() => setVistaMovil('comanda')}
            className="btn"
            style={{
              backgroundColor: vistaMovil === 'comanda' ? 'var(--trigo)' : 'transparent',
              color: vistaMovil === 'comanda' ? 'var(--verde-piedra-dark)' : 'var(--texto-principal)',
              padding: '10px 12px',
              fontSize: '0.88rem',
              fontWeight: '800',
              borderRadius: 'var(--radius-sm)',
              position: 'relative',
              minHeight: '40px'
            }}
          >
            <ShoppingCart size={16} /> Comanda {totalCantidadItems > 0 && `(${totalCantidadItems})`}
          </button>
        </div>
      </div>

      <div className="pos-container">
        
        {/* COLUMNA IZQUIERDA: CATÁLOGO DE PLATOS */}
        <div className={`pos-catalog-panel ${vistaMovil === 'comanda' ? 'pos-hide-on-mobile' : ''}`}>
          
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.8rem)', color: 'var(--verde-piedra-dark)' }}>Punto de Venta & Caja (POS)</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.84rem' }}>Selecciona platos y especifica mesa o domicilio.</p>
          </div>

          {mensajeExito && (
            <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} /> 
                <div>
                  <strong>{mensajeExito}</strong>
                  {pedidoReciente && (
                    <div style={{ fontSize: '0.78rem', marginTop: '2px', color: '#047857' }}>
                      Mesa / Entrega: {pedidoReciente.direccionEntrega} | Total: {formatCOP(pedidoReciente.total)}
                    </div>
                  )}
                </div>
              </div>
              {pedidoReciente && (
                <button 
                  onClick={() => setPedidoReciente({ ...pedidoReciente })}
                  className="btn btn-trigo"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', minHeight: 'auto' }}
                >
                  <Printer size={14} /> Reabrir Ticket
                </button>
              )}
            </div>
          )}

          {alertaInventario && (
            <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1.5px solid #FDE68A', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{alertaInventario}</strong>
              </div>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}


          {/* BARRA DE BÚSQUEDA RÁPIDA DE PLATOS */}
          <div style={{ position: 'relative', marginBottom: '12px', width: '100%' }}>
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-secundario)' }} />
            <input 
              type="text"
              placeholder="Buscar plato, bebida o combo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 36px 9px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--trigo)',
                backgroundColor: 'var(--blanco-arena-card)',
                fontSize: '0.88rem',
                outline: 'none',
                color: 'var(--texto-principal)',
                boxShadow: 'var(--shadow-sm)'
              }}
            />
            {busqueda && (
              <button 
                onClick={() => setBusqueda('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--texto-secundario)', padding: '4px' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* FILTROS POR CATEGORÍA CON NAVEGACIÓN Y SCROLL SUAVE */}
          <div style={{ 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '16px', 
            gap: '8px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <button
              onClick={() => scrollCategorias('left')}
              className="btn btn-outline"
              style={{
                padding: '0',
                width: '36px',
                minWidth: '36px',
                height: '36px',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                flexShrink: 0,
                color: 'var(--verde-piedra)',
                backgroundColor: 'var(--blanco-arena-card)',
                border: '1.5px solid var(--trigo)',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Ver categorías anteriores"
            >
              <ChevronLeft size={20} />
            </button>

            <div 
              ref={categoriesContainerRef}
              className="pos-categories-scroll"
              style={{ 
                display: 'flex', 
                gap: '8px', 
                overflowX: 'auto', 
                paddingBottom: '4px', 
                paddingTop: '2px',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                scrollBehavior: 'smooth',
                flex: 1,
                minWidth: 0,
                width: 0
              }}
            >
              <button 
                className={`btn ${categoriaSel === null ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setCategoriaSel(null)}
                style={{ 
                  fontSize: '0.82rem', 
                  padding: '7px 14px', 
                  whiteSpace: 'nowrap', 
                  minHeight: '36px',
                  flexShrink: 0,
                  fontWeight: '700',
                  borderRadius: '999px'
                }}
              >
                Todos ({productos.length})
              </button>
              {categorias.map((c) => {
                const count = conteoPorCategoria[c.id] || 0;
                const isSelected = categoriaSel === c.id;

                return (
                  <button 
                    key={c.id}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setCategoriaSel(c.id)}
                    style={{ 
                      fontSize: '0.82rem', 
                      padding: '7px 14px', 
                      whiteSpace: 'nowrap', 
                      minHeight: '36px',
                      flexShrink: 0,
                      fontWeight: isSelected ? '800' : '600',
                      borderRadius: '999px'
                    }}
                  >
                    {c.nombre} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollCategorias('right')}
              className="btn btn-outline"
              style={{
                padding: '0',
                width: '36px',
                minWidth: '36px',
                height: '36px',
                minHeight: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                flexShrink: 0,
                color: 'var(--verde-piedra)',
                backgroundColor: 'var(--blanco-arena-card)',
                border: '1.5px solid var(--trigo)',
                boxShadow: 'var(--shadow-sm)'
              }}
              title="Ver más categorías"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* GRILLA DE PRODUCTOS POS OPTIMIZADA PARA MÓVIL Y DESKTOP */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--texto-secundario)' }}>
              Cargando catálogo de productos...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', backgroundColor: 'var(--blanco-arena-card)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(20,56,44,0.08)' }}>
              <UtensilsCrossed size={36} color="var(--trigo-dark)" style={{ marginBottom: '10px' }} />
              <h4 style={{ color: 'var(--verde-piedra-dark)' }}>No se encontraron platos</h4>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.82rem', marginTop: '4px' }}>
                {busqueda ? 'Intenta con otro término de búsqueda.' : 'No hay platos activos en esta categoría.'}
              </p>
              {categoriaSel !== null && (
                <button 
                  onClick={() => setCategoriaSel(null)}
                  className="btn btn-outline" 
                  style={{ marginTop: '12px', fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  Ver Todas las Categorías
                </button>
              )}
            </div>
          ) : (
            <div className="pos-products-grid">
              {productosFiltrados.map((p) => {
                const catNombre = p.categoria?.nombre || 'Carta';
                return (
                  <div key={p.id} className="pos-product-card">
                    {/* FOTO DEL PRODUCTO A SANGRE CON CLIC PARA AMPLIAR */}
                    <div 
                      className="pos-product-img-box"
                      onClick={() => setProductoZoomModal(p)}
                      style={{ cursor: 'pointer', position: 'relative' }}
                      title="Haz clic para ver la foto ampliada y detalles"
                    >
                      {p.imagen ? (
                        <img 
                          src={p.imagen} 
                          alt={p.nombre} 
                          className="pos-product-img"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--trigo)', opacity: 0.9 }}>
                          <UtensilsCrossed size={32} />
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', marginTop: '4px', letterSpacing: '0.05em' }}>SAMAES FOOD</span>
                        </div>
                      )}

                      {p.imagen && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.65)',
                          color: '#FFF',
                          borderRadius: '999px',
                          padding: '3px 7px',
                          fontSize: '0.68rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backdropFilter: 'blur(4px)',
                          fontWeight: '700'
                        }}>
                          <ZoomIn size={11} /> Ampliar
                        </div>
                      )}
                    </div>

                    <div className="pos-product-card-content">
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--trigo-dark)', textTransform: 'uppercase', display: 'block', marginBottom: '2px', letterSpacing: '0.04em' }}>
                        {catNombre}
                      </span>
                      <h4 style={{ color: 'var(--verde-piedra-dark)', fontSize: 'clamp(0.98rem, 2.2vw, 1.1rem)', fontWeight: '800', marginBottom: '4px', lineHeight: 1.25 }}>
                        {p.nombre}
                      </h4>
                      {p.descripcion && (
                        <p style={{ fontSize: 'clamp(0.78rem, 1.8vw, 0.85rem)', color: 'var(--texto-secundario)', marginBottom: '4px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                          {p.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="pos-product-card-footer">
                      <span style={{ fontSize: 'clamp(1rem, 2.2vw, 1.2rem)', fontWeight: '800', color: 'var(--verde-piedra)' }}>
                        {formatCOP(p.precio)}
                      </span>
                      <button 
                        onClick={() => agregarAlCarrito(p)}
                        className="btn btn-trigo" 
                        style={{ padding: '7px 16px', fontSize: '0.84rem', minHeight: '34px', fontWeight: '800', borderRadius: 'var(--radius-sm)' }}
                        title="Agregar a la comanda"
                      >
                        <Plus size={15} /> Pedir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODAL ZOOM DE FOTO Y DETALLE EN POS */}
          {productoZoomModal && (
            <div 
              className="modal-overlay"
              onClick={() => setProductoZoomModal(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(10, 25, 20, 0.88)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}
            >
              <div 
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: 'var(--blanco-arena-card)',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '560px',
                  width: '100%',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  padding: 0,
                  border: '2px solid var(--trigo)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                  position: 'relative'
                }}
              >
                <button 
                  onClick={() => setProductoZoomModal(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 10,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>

                {productoZoomModal.imagen ? (
                  <div style={{ width: '100%', height: '320px', backgroundColor: '#0E281F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                    <img 
                      src={productoZoomModal.imagen} 
                      alt={productoZoomModal.nombre}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '160px', background: 'linear-gradient(135deg, var(--verde-piedra-dark) 0%, var(--verde-piedra) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--trigo)' }}>
                    <UtensilsCrossed size={44} />
                    <span style={{ fontWeight: '800', marginTop: '6px' }}>SAMAES FOOD</span>
                  </div>
                )}

                <div style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--trigo-dark)', textTransform: 'uppercase' }}>
                    {productoZoomModal.categoria?.nombre || 'Carta'}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--verde-piedra-dark)', margin: '4px 0 8px 0' }}>
                    {productoZoomModal.nombre}
                  </h3>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--verde-piedra)', marginBottom: '12px' }}>
                    {formatCOP(productoZoomModal.precio)}
                  </div>
                  {productoZoomModal.descripcion && (
                    <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem', lineHeight: 1.45, marginBottom: '20px' }}>
                      {productoZoomModal.descripcion}
                    </p>
                  )}
                  <button 
                    onClick={() => {
                      agregarAlCarrito(productoZoomModal);
                      setProductoZoomModal(null);
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: '800' }}
                  >
                    <Plus size={18} /> Agregar a la Comanda ({formatCOP(productoZoomModal.precio)})
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* COLUMNA DERECHA: COMANDA, MESAS & DOMICILIOS */}
        <div className={`pos-cart-panel ${vistaMovil === 'catalogo' ? 'pos-hide-on-mobile' : ''}`} style={{
          backgroundColor: 'var(--blanco-arena-card)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(14px, 2.5vw, 20px)',
          boxShadow: 'var(--shadow-md)',
          border: '2px solid var(--trigo)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: '80px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto'
        }}>
          
          <div style={{ flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <ShoppingCart size={18} color="var(--trigo-dark)" /> Comanda Actual
              </h3>
              {vistaMovil === 'comanda' && (
                <button 
                  onClick={() => setVistaMovil('catalogo')}
                  className="btn btn-outline"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: 'auto' }}
                >
                  <ArrowLeft size={13} /> Volver a Carta
                </button>
              )}
            </div>

            {/* SELECCIÓN DE TIPO DE PEDIDO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              <button 
                type="button"
                className={`btn ${tipoPedidoId === 1 ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '7px 4px', fontSize: '0.75rem', minHeight: '34px', fontWeight: '700' }}
                onClick={() => setTipoPedidoId(1)}
              >
                <Table size={13} /> Mesa
              </button>
              <button 
                type="button"
                className={`btn ${tipoPedidoId === 2 ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '7px 4px', fontSize: '0.75rem', minHeight: '34px', fontWeight: '700' }}
                onClick={() => setTipoPedidoId(2)}
              >
                <PackageCheck size={13} /> Llevar
              </button>
              <button 
                type="button"
                className={`btn ${tipoPedidoId === 3 ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '7px 4px', fontSize: '0.75rem', minHeight: '34px', fontWeight: '700' }}
                onClick={() => setTipoPedidoId(3)}
              >
                <Truck size={13} /> Domicilio
              </button>
            </div>

            {/* SELECTOR VISUAL DE MESAS DINÁMICO */}
            {tipoPedidoId === 1 && (
              <div style={{ marginBottom: '10px', backgroundColor: 'var(--blanco-arena-subtle)', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--trigo)' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--verde-piedra-dark)', display: 'block', marginBottom: '4px' }}>
                  Selecciona la Mesa:
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                  {listaMesasDisponibles.map((m) => {
                    const status = obtenerEstadoMesa(m);
                    const esSeleccionada = numeroMesa === m;

                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setNumeroMesa(m)}
                        style={{
                          padding: '5px 2px',
                          borderRadius: '5px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          textAlign: 'center',
                          border: esSeleccionada ? '2px solid var(--verde-piedra-dark)' : status.ocupada ? '1px solid #EF4444' : '1px solid var(--trigo)',
                          backgroundColor: esSeleccionada ? 'var(--trigo)' : status.ocupada ? '#FEE2E2' : '#FFF',
                          color: status.ocupada ? '#991B1B' : 'var(--verde-piedra-dark)',
                          boxShadow: esSeleccionada ? 'var(--shadow-sm)' : 'none'
                        }}
                      >
                        <div>{m}</div>
                        <div style={{ fontSize: '0.55rem', marginTop: '1px', fontWeight: '600' }}>
                          {status.ocupada ? 'Ocupada' : 'Libre'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DOMICILIO DATOS CLIENTE */}
            {tipoPedidoId === 3 && (
              <div style={{ backgroundColor: 'rgba(20,56,44,0.04)', border: '1px solid var(--trigo-dark)', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--verde-piedra-dark)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={13} /> Datos de Entrega
                </div>

                <div style={{ marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nombre del Cliente *</label>
                  <input 
                    type="text" 
                    value={nombreCliente} 
                    onChange={(e) => setNombreCliente(e.target.value)} 
                    placeholder="Ej. Juan Pérez"
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '2px', fontSize: '0.8rem' }} 
                  />
                </div>

                <div style={{ marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Teléfono *</label>
                  <input 
                    type="text" 
                    value={telefonoCliente} 
                    onChange={(e) => setTelefonoCliente(e.target.value)} 
                    placeholder="Ej. 3001234567"
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '2px', fontSize: '0.8rem' }} 
                  />
                </div>

                <div style={{ marginBottom: '5px' }}>
                  <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Dirección *</label>
                  <input 
                    type="text" 
                    value={direccionCliente} 
                    onChange={(e) => setDireccionCliente(e.target.value)} 
                    placeholder="Ej. Calle 10 # 24-50"
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '2px', fontSize: '0.8rem' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--verde-piedra)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={12} /> Costo Domicilio / Envío ($ COP)
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    step="500"
                    value={costoDomicilio} 
                    onChange={(e) => setCostoDomicilio(e.target.value)} 
                    placeholder="Ej. 3000 o 5000 (Opcional)"
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--trigo)', marginTop: '2px', fontSize: '0.82rem', fontWeight: 'bold' }} 
                  />
                </div>
              </div>
            )}

            {/* CARRITO Y PRODUCTOS */}
            <div style={{ marginBottom: '12px' }}>
              {carrito.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 10px', color: 'var(--texto-secundario)', border: '2px dashed var(--blanco-arena-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  No has agregado platos a la comanda
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                  {carrito.map((item) => (
                    <div key={item.producto.id} style={{ padding: '8px', backgroundColor: 'var(--blanco-arena-subtle)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ maxWidth: '65%' }}>
                          <div style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--verde-piedra-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.producto.nombre}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--texto-secundario)' }}>
                            {formatCOP(item.producto.precio)} c/u
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <button onClick={() => modificarCantidad(item.producto.id, -1)} style={{ border: 'none', background: '#E5E7EB', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                            <Minus size={11} />
                          </button>
                          <span style={{ fontWeight: '800', fontSize: '0.82rem' }}>{item.cantidad}</span>
                          <button onClick={() => modificarCantidad(item.producto.id, 1)} style={{ border: 'none', background: '#E5E7EB', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer' }}>
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>

                      {/* NOTA / ESPECIFICACIÓN */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <FileText size={11} color="var(--trigo-dark)" />
                        <input 
                          type="text" 
                          value={item.observaciones || ''}
                          onChange={(e) => modificarObservaciones(item.producto.id, e.target.value)}
                          placeholder="Nota: Ej. Sin cebolla..."
                          style={{
                            width: '100%',
                            fontSize: '0.7rem',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            border: '1px solid rgba(20,56,44,0.15)',
                            backgroundColor: '#FFF'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CÓDIGO DE CUPÓN */}
            <div style={{ marginBottom: '10px', borderTop: '1px solid var(--blanco-arena-subtle)', paddingTop: '8px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--verde-piedra)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={11} /> Cupón de Descuento
              </label>
              <div style={{ display: 'flex', gap: '5px', marginTop: '3px' }}>
                <input 
                  type="text" 
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                  placeholder="Ej. PROMO10"
                  style={{ flex: 1, padding: '4px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--trigo)', fontFamily: 'monospace', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.78rem' }}
                />
                <button onClick={aplicarCuponDescuento} type="button" className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '0.7rem', minHeight: 'auto' }}>
                  Aplicar
                </button>
              </div>
              {mensajeCupon && (
                <div style={{ fontSize: '0.7rem', marginTop: '3px', color: descuentoMonto > 0 ? 'var(--exito)' : 'var(--peligro)', fontWeight: '700' }}>
                  {mensajeCupon}
                </div>
              )}
            </div>

            {/* TOTALES */}
            <div style={{ backgroundColor: 'var(--blanco-arena-subtle)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--texto-secundario)', marginBottom: '2px' }}>
                <span>Subtotal platos:</span>
                <span>{formatCOP(calcularSubtotal())}</span>
              </div>
              {tipoPedidoId === 3 && (Number(costoDomicilio) || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--verde-piedra-dark)', fontWeight: '700', marginBottom: '2px' }}>
                  <span>Costo Domicilio:</span>
                  <span>+{formatCOP(Number(costoDomicilio) || 0)}</span>
                </div>
              )}
              {descuentoMonto > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--exito)', fontWeight: '700', marginBottom: '2px' }}>
                  <span>Descuento Cupón:</span>
                  <span>-{formatCOP(descuentoMonto)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '800', color: 'var(--verde-piedra-dark)', borderTop: '1px dashed var(--trigo-dark)', paddingTop: '3px' }}>
                <span>Total:</span>
                <span>{formatCOP(calcularTotalFinal())}</span>
              </div>
            </div>

          </div>

          <div style={{ paddingTop: '6px', borderTop: '1px solid var(--blanco-arena-subtle)' }}>
            <button 
              onClick={handleCrearPedido}
              disabled={carrito.length === 0 || enviandoComanda}
              className="btn btn-trigo" 
              style={{ width: '100%', padding: '11px', fontSize: '0.92rem', fontWeight: '800', opacity: (carrito.length === 0 || enviandoComanda) ? 0.5 : 1 }}
            >
              {enviandoComanda ? 'Enviando comanda a cocina...' : <><Send size={15} /> Enviar Comanda a Cocina</>}
            </button>
          </div>


        </div>

      </div>


      {/* FLOATING ACTION BUTTON MÓVIL PARA VER CARRITO (< 1024px) */}
      {totalCantidadItems > 0 && vistaMovil === 'catalogo' && (
        <div className="pos-floating-cart-bar" style={{
          position: 'fixed',
          bottom: '16px',
          left: '12px',
          right: '12px',
          zIndex: 900,
          display: 'none'
        }}>
          <button
            onClick={() => setVistaMovil('comanda')}
            className="btn btn-trigo"
            style={{
              width: '100%',
              padding: '12px 18px',
              fontSize: '0.95rem',
              fontWeight: '800',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={18} />
              <span>Ver Comanda ({totalCantidadItems})</span>
            </div>
            <div style={{ fontSize: '1.05rem' }}>
              {formatCOP(calcularTotalFinal())}
            </div>
          </button>
        </div>
      )}

      {/* MODAL DE IMPRESIÓN TÉRMICA */}
      {pedidoReciente && (
        <ImpresionTicketModal 
          pedido={pedidoReciente} 
          onClose={() => setPedidoReciente(null)} 
        />
      )}

      {/* ESTILOS ESPECÍFICOS POS RESPONSIVE */}
      <style>{`
        .pos-products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
          gap: 12px;
        }

        .pos-categories-scroll::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 1024px) {
          .pos-mobile-tabs {
            display: block !important;
          }
          .pos-floating-cart-bar {
            display: block !important;
          }
          .pos-hide-on-mobile {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          .pos-products-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .pos-product-card {
            padding: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};
