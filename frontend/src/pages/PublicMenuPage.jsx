import React, { useState, useEffect } from 'react';
import { Search, Utensils, CheckCircle2, XCircle, Phone, MapPin, ZoomIn, X, Maximize2 } from 'lucide-react';
import api from '../services/api';

const InstagramIcon = ({ size = 18, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const PublicMenuPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [productoAmpliado, setProductoAmpliado] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          api.get('/productos'),
          api.get('/categorias')
        ]);
        // Solo categorías activas en el menú
        const categoriasActivas = (resCat.data || []).filter(c => c.estado !== false);
        // Mostrar únicamente productos activos y pertenecientes a categorías activas
        const productosActivos = (resProd.data || []).filter(p => {
          const prodActivo = p.estadoDelProducto?.id !== 3 && !p.estadoDelProducto?.nombre?.toLowerCase().includes('inactivo');
          const catActiva = !p.categoria || p.categoria.estado !== false;
          return prodActivo && catActiva;
        });
        setProductos(productosActivos);
        setCategorias(categoriasActivas);
      } catch (err) {
        console.error('Error cargando menú:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = !categoriaSeleccionada || (p.categoriaId === categoriaSeleccionada || (p.categoria && p.categoria.id === categoriaSeleccionada));
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideCategoria && coincideBusqueda;
  });

  const formatCOP = (val) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: '100vh', paddingBottom: '60px', width: '100%', overflowX: 'hidden' }}>
      
      {/* HEADER HERO DEL MENÚ DIGITAL */}
      <div style={{
        backgroundColor: 'var(--verde-piedra)',
        color: 'var(--blanco-arena)',
        padding: 'clamp(32px, 6vw, 48px) clamp(16px, 4vw, 24px)',
        textAlign: 'center',
        borderBottom: '3px solid var(--trigo)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-trigo" style={{ marginBottom: '12px' }}>
            <Utensils size={14} /> Carta Digital SAMAES FOOD
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--blanco-arena)', marginBottom: '10px' }}>
            Nuestro Menú Gastronómico
          </h1>
          <p style={{ color: 'var(--blanco-arena-subtle)', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', maxWidth: '600px', margin: '0 auto' }}>
            Explora nuestra carta digital de platos de autor preparadas al instante con los insumos más frescos.
          </p>

          {/* BARRA DE BÚSQUEDA */}
          <div style={{ marginTop: '20px', position: 'relative', maxWidth: '500px', margin: '20px auto 0 auto' }}>
            <Search size={18} color="var(--texto-secundario)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Buscar plato, bebida o ingrediente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--trigo)',
                backgroundColor: 'var(--blanco-arena-card)',
                fontSize: '0.95rem',
                color: 'var(--texto-principal)',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      <div className="public-menu-content-container">
        
        {/* PESTAÑAS DE CATEGORÍAS CON TOUCH SCROLLING */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            paddingBottom: '12px', 
            marginBottom: '24px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}
        >
          <button 
            className={`btn ${categoriaSeleccionada === null ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setCategoriaSeleccionada(null)}
            style={{ fontSize: '0.85rem', padding: '8px 16px', whiteSpace: 'nowrap', minHeight: '38px', flexShrink: 0, fontWeight: '700' }}
          >
            Todas las Categorías ({productos.length})
          </button>
          {categorias.map((cat) => (
            <button 
              key={cat.id}
              className={`btn ${categoriaSeleccionada === cat.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setCategoriaSeleccionada(cat.id)}
              style={{ fontSize: '0.85rem', padding: '8px 16px', whiteSpace: 'nowrap', minHeight: '38px', flexShrink: 0, fontWeight: categoriaSeleccionada === cat.id ? '800' : '600' }}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* GRILLA DE PRODUCTOS INFORMATIVA */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--texto-secundario)' }}>
            Cargando el menú de SAMAES FOOD...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--blanco-arena-card)', borderRadius: 'var(--radius-md)' }}>
            <Utensils size={44} color="var(--trigo-dark)" style={{ marginBottom: '14px' }} />
            <h3>No se encontraron platos</h3>
            <p style={{ color: 'var(--texto-secundario)', marginTop: '4px' }}>Intenta ajustar la búsqueda o seleccionar otra categoría.</p>
          </div>
        ) : (
          <div className="public-menu-grid">
            {productosFiltrados.map((prod) => (
              <div 
                key={prod.id} 
                className="public-menu-card"
                onClick={() => setProductoAmpliado(prod)}
                style={{ cursor: 'pointer' }}
                title="Toca para ver la foto ampliada y detalles completos"
              >
                <div>
                  {/* IMAGEN DE PRODUCTO */}
                  <div className="public-menu-card-img-container" style={{ position: 'relative' }}>
                    {prod.imagen ? (
                      <img 
                        src={prod.imagen} 
                        alt={prod.nombre}
                        className="public-menu-card-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--trigo)', opacity: 0.9 }}>
                        <Utensils size={36} />
                        <span style={{ fontSize: '0.75rem', marginTop: '6px', fontWeight: '800', letterSpacing: '0.06em' }}>SAMAES FOOD</span>
                      </div>
                    )}

                    {/* INSIGNIA DISPONIBLE */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 2
                    }}>
                      {prod.estadoDelProducto && prod.estadoDelProducto.nombre === 'Disponible' ? (
                        <span className="badge badge-ok" style={{ fontSize: '0.7rem', padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
                          <CheckCircle2 size={11} /> Disponible
                        </span>
                      ) : (
                        <span className="badge badge-critico" style={{ fontSize: '0.7rem', padding: '3px 8px', backdropFilter: 'blur(4px)' }}>
                          <XCircle size={11} /> Agotado
                        </span>
                      )}
                    </div>

                    {/* BOTÓN / PISTA PARA AMPLIAR */}
                    {prod.imagen && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        color: '#FFF',
                        borderRadius: '999px',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(4px)',
                        fontWeight: '700',
                        zIndex: 2
                      }}>
                        <ZoomIn size={12} /> Ver foto
                      </div>
                    )}
                  </div>

                  <div className="public-menu-card-body">
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--trigo-dark)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                      {prod.categoria ? prod.categoria.nombre : 'Menú Gastronómico'}
                    </span>
                    <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: 'var(--verde-piedra-dark)', margin: '2px 0 6px 0', lineHeight: 1.25, fontWeight: '800' }}>
                      {prod.nombre}
                    </h3>
                    <p style={{ fontSize: 'clamp(0.78rem, 2vw, 0.84rem)', color: 'var(--texto-secundario)', minHeight: '32px', lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {prod.descripcion || 'Especialidad de la casa preparada con los mejores ingredientes frescos de SAMAES FOOD.'}
                    </p>
                  </div>
                </div>

                <div className="public-menu-card-footer">
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--texto-secundario)', letterSpacing: '0.04em' }}>PRECIO</span>
                  <div style={{ fontSize: 'clamp(1.05rem, 3vw, 1.25rem)', fontWeight: '800', color: 'var(--verde-piedra)' }}>
                    {formatCOP(prod.precio)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL LIGHTBOX PARA AMPLIAR FOTO Y VER DETALLE COMPLETO */}
        {productoAmpliado && (
          <div 
            className="modal-overlay" 
            onClick={() => setProductoAmpliado(null)}
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
                maxWidth: '600px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                padding: 0,
                border: '2px solid var(--trigo)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                animation: 'modalScale 0.25s ease-out'
              }}
            >
              {/* BOTÓN CERRAR */}
              <button 
                onClick={() => setProductoAmpliado(null)}
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
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <X size={20} />
              </button>

              {/* IMAGEN AMPLIADA AL 100% */}
              {productoAmpliado.imagen ? (
                <div style={{
                  width: '100%',
                  height: 'clamp(260px, 45vh, 420px)',
                  backgroundColor: '#0E281F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderTopLeftRadius: 'inherit',
                  borderTopRightRadius: 'inherit',
                  padding: '6px'
                }}>
                  <img 
                    src={productoAmpliado.imagen} 
                    alt={productoAmpliado.nombre}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '180px',
                  background: 'linear-gradient(135deg, var(--verde-piedra-dark) 0%, var(--verde-piedra) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--trigo)'
                }}>
                  <Utensils size={48} />
                  <span style={{ fontWeight: '800', marginTop: '8px', letterSpacing: '0.05em' }}>SAMAES FOOD</span>
                </div>
              )}

              {/* DETALLES DEL PLATO EN EL MODAL */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--trigo-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {productoAmpliado.categoria?.nombre || 'Menú Gastronómico'}
                  </span>
                  {productoAmpliado.estadoDelProducto?.nombre === 'Disponible' ? (
                    <span className="badge badge-ok">
                      <CheckCircle2 size={12} /> Disponible
                    </span>
                  ) : (
                    <span className="badge badge-critico">
                      <XCircle size={12} /> Agotado
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)', color: 'var(--verde-piedra-dark)', margin: '0 0 10px 0', lineHeight: 1.25 }}>
                  {productoAmpliado.nombre}
                </h2>

                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--verde-piedra)', marginBottom: '16px' }}>
                  {formatCOP(productoAmpliado.precio)}
                </div>

                <div style={{ backgroundColor: 'var(--blanco-arena-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--texto-secundario)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Descripción e Ingredientes:
                  </span>
                  <p style={{ color: 'var(--texto-principal)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                    {productoAmpliado.descripcion || 'Especialidad gourmet preparada con los insumos más frescos al momento.'}
                  </p>
                </div>

                {/* BOTÓN PEDIR DIRECTO POR WHATSAPP */}
                <a
                  href={`https://wa.me/573165530486?text=${encodeURIComponent(`¡Hola SAMAES FOOD! 👋 Me gustaría pedir: ${productoAmpliado.nombre} (${formatCOP(productoAmpliado.precio)})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#25D366',
                    color: '#FFFFFF',
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Phone size={18} /> Pedir {productoAmpliado.nombre} por WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}

        {/* BANNER CONTACTO Y REDES AL FINAL DEL MENÚ */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          backgroundColor: 'var(--verde-piedra-dark)',
          color: 'var(--blanco-arena)',
          padding: 'clamp(24px, 5vw, 36px) clamp(16px, 4vw, 24px)',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid var(--trigo)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--trigo)', fontSize: 'clamp(1.3rem, 3.5vw, 1.6rem)', marginBottom: '8px' }}>
            ¡Pide a Domicilio o Visítanos!
          </h3>
          <p style={{ color: 'var(--blanco-arena-subtle)', fontSize: '0.92rem', marginBottom: '22px', maxWidth: '600px', margin: '0 auto 22px auto' }}>
            Atención rápida para llevar y domicilios en toda la zona.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <a
              href="https://wa.me/573165530486"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                padding: '12px 22px',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '0.92rem',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Phone size={17} /> Pedir por WhatsApp (316 553 0486)
            </a>

            <a
              href="https://maps.app.goo.gl/Bmq9W5NzwRpekB7n7?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--trigo)',
                color: 'var(--verde-piedra-dark)',
                padding: '12px 22px',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '0.92rem',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <MapPin size={17} /> Al lado de Vacilao (Ver Mapa)
            </a>

            <a
              href="https://www.instagram.com/samaes25?igsi=ZHFlMmtycmdsMzN2"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(223, 183, 108, 0.15)',
                color: 'var(--trigo)',
                padding: '12px 22px',
                borderRadius: '999px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.92rem',
                border: '1.5px solid var(--trigo)',
                transition: 'all 0.2s ease'
              }}
            >
              <InstagramIcon size={17} /> @samaes25 en Instagram
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

