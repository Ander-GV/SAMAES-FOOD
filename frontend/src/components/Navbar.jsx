import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Utensils, 
  ShoppingCart, 
  ClipboardList, 
  Package, 
  BarChart3, 
  LogOut, 
  LogIn, 
  BookOpen, 
  Building2, 
  Scale, 
  ArrowRightLeft, 
  Layers, 
  Users, 
  Tag, 
  Table, 
  ChevronDown,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de los dropdowns desktop
  const [dropdownAbierto, setDropdownAbierto] = useState(null); // 'menu' | 'inventario' | 'admin' | null
  
  // Estado del menú móvil (drawer)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null); // 'menu' | 'inventario' | 'admin' | null

  const navRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setDropdownAbierto(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setDropdownAbierto(null);
    setMobileMenuOpen(false);
    setMobileAccordion(null);
  }, [location.pathname]);

  const toggleDropdown = (menu) => {
    setDropdownAbierto(prev => prev === menu ? null : menu);
  };

  const toggleMobileAccordion = (section) => {
    setMobileAccordion(prev => prev === section ? null : section);
  };

  const isMenuSectionActive = ['/productos', '/categorias', '/promociones', '/mesas'].includes(location.pathname);
  const isInvSectionActive = ['/inventario', '/movimientos', '/unidades', '/proveedores'].includes(location.pathname);
  const isAdminSectionActive = ['/reportes', '/usuarios'].includes(location.pathname);

  return (
    <>
      <nav className="navbar-samaes" ref={navRef} style={{
        backgroundColor: 'var(--verde-piedra-dark)',
        borderBottom: '3px solid var(--trigo)',
        padding: '10px 16px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* LOGO OFICIAL SAMAES FOOD */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <img 
              src="/images/logo.jpg" 
              alt="SAMAES FOOD Logo Oficial" 
              style={{ 
                height: '38px', 
                width: '38px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '2px solid var(--trigo)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }} 
            />
            <div>
              <span style={{ 
                color: 'var(--blanco-arena)', 
                fontSize: '1.15rem', 
                fontWeight: '800', 
                fontFamily: 'var(--font-heading)',
                letterSpacing: '0.03em',
                display: 'block',
                lineHeight: 1
              }}>
                SAMAES <span style={{ color: 'var(--trigo)' }}>FOOD</span>
              </span>
              <span style={{ fontSize: '0.58rem', color: 'var(--trigo-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                POS & Restaurante
              </span>
            </div>
          </Link>

          {/* NAVEGACIÓN DESKTOP (VISIBLE EN PANTALLAS GRANDES > 960px) */}
          <div className="navbar-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {user && (
              <>
                <Link to="/pos" style={linkStyle(isActive('/pos'))}>
                  <ShoppingCart size={15} /> POS
                </Link>
                <Link to="/pedidos" style={linkStyle(isActive('/pedidos'))}>
                  <ClipboardList size={15} /> Comandas
                </Link>
              </>
            )}

            {isAdmin() && (
              <>
                {/* DROPDOWN 1: CARTA & MENÚ */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => toggleDropdown('menu')}
                    style={dropdownBtnStyle(isMenuSectionActive, dropdownAbierto === 'menu')}
                  >
                    <Utensils size={15} /> Carta & Menú <ChevronDown size={14} style={{ transform: dropdownAbierto === 'menu' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {dropdownAbierto === 'menu' && (
                    <div style={dropdownMenuStyle}>
                      <Link to="/productos" style={dropdownItemStyle(isActive('/productos'))}>
                        <Utensils size={16} color="var(--trigo-dark)" /> Productos & Recetas
                      </Link>
                      <Link to="/categorias" style={dropdownItemStyle(isActive('/categorias'))}>
                        <Layers size={16} color="var(--trigo-dark)" /> Categorías
                      </Link>
                      <Link to="/promociones" style={dropdownItemStyle(isActive('/promociones'))}>
                        <Tag size={16} color="var(--trigo-dark)" /> Promociones & Descuentos
                      </Link>
                      <Link to="/mesas" style={dropdownItemStyle(isActive('/mesas'))}>
                        <Table size={16} color="var(--trigo-dark)" /> Configurar Mesas
                      </Link>
                    </div>
                  )}
                </div>

                {/* DROPDOWN 2: INVENTARIO & STOCK */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => toggleDropdown('inventario')}
                    style={dropdownBtnStyle(isInvSectionActive, dropdownAbierto === 'inventario')}
                  >
                    <Package size={15} /> Inventario <ChevronDown size={14} style={{ transform: dropdownAbierto === 'inventario' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {dropdownAbierto === 'inventario' && (
                    <div style={dropdownMenuStyle}>
                      <Link to="/inventario" style={dropdownItemStyle(isActive('/inventario'))}>
                        <Package size={16} color="var(--trigo-dark)" /> Insumos & Stock
                      </Link>
                      <Link to="/movimientos" style={dropdownItemStyle(isActive('/movimientos'))}>
                        <ArrowRightLeft size={16} color="var(--trigo-dark)" /> Kárdex / Movimientos
                      </Link>
                      <Link to="/unidades" style={dropdownItemStyle(isActive('/unidades'))}>
                        <Scale size={16} color="var(--trigo-dark)" /> Unidades de Medida
                      </Link>
                      <Link to="/proveedores" style={dropdownItemStyle(isActive('/proveedores'))}>
                        <Building2 size={16} color="var(--trigo-dark)" /> Proveedores
                      </Link>
                    </div>
                  )}
                </div>

                {/* DROPDOWN 3: ADMINISTRACIÓN & CAJA */}
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => toggleDropdown('admin')}
                    style={dropdownBtnStyle(isAdminSectionActive, dropdownAbierto === 'admin')}
                  >
                    <BarChart3 size={15} /> Finanzas & Personal <ChevronDown size={14} style={{ transform: dropdownAbierto === 'admin' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {dropdownAbierto === 'admin' && (
                    <div style={dropdownMenuStyle}>
                      <Link to="/reportes" style={dropdownItemStyle(isActive('/reportes'))}>
                        <BarChart3 size={16} color="var(--trigo-dark)" /> Cierre de Caja & Egresos
                      </Link>
                      <Link to="/usuarios" style={dropdownItemStyle(isActive('/usuarios'))}>
                        <Users size={16} color="var(--trigo-dark)" /> Empleados & Usuarios
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}

            <Link to="/menu" style={linkStyle(isActive('/menu'))}>
              <BookOpen size={15} /> Menú Digital
            </Link>
          </div>

          {/* USUARIO DESKTOP */}
          <div className="navbar-desktop-user" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  textAlign: 'right',
                  color: 'var(--blanco-arena)',
                  fontSize: '0.8rem',
                  lineHeight: 1.2
                }}>
                  <div style={{ fontWeight: '700', color: 'var(--trigo)' }}>{user.nombreEmpleado || user.codigoEmpleado}</div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.85, textTransform: 'uppercase' }}>{user.role}</div>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="btn"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.18)',
                    color: '#FCA5A5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={14} /> Salir
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-trigo" style={{ padding: '7px 14px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '700' }}>
                <LogIn size={15} /> Iniciar Sesión
              </Link>
            )}
          </div>

          {/* BOTÓN HAMBURGUESA MÓVIL */}
          <div className="navbar-mobile-toggle" style={{ display: 'none' }}>
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Abrir menú"
              style={{
                background: 'rgba(223, 183, 108, 0.15)',
                border: '1.5px solid var(--trigo)',
                color: 'var(--trigo)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* OVERLAY Y DRAWER MÓVIL */}
      {mobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-nav-drawer" onClick={(e) => e.stopPropagation()}>
            
            {/* CABECERA DEL DRAWER */}
            <div style={{
              padding: '18px 20px',
              backgroundColor: 'rgba(14, 40, 31, 0.98)',
              borderBottom: '2px solid var(--trigo)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/images/logo.jpg" alt="SAMAES" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1.5px solid var(--trigo)' }} />
                <div>
                  <div style={{ color: 'var(--blanco-arena)', fontWeight: '800', fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
                    SAMAES <span style={{ color: 'var(--trigo)' }}>FOOD</span>
                  </div>
                  <div style={{ color: 'var(--trigo-light)', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                    Navegación Móvil
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--trigo)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* SECCIÓN USUARIO MÓVIL */}
            {user ? (
              <div style={{
                padding: '16px 20px',
                backgroundColor: 'rgba(20, 56, 44, 0.6)',
                borderBottom: '1px solid rgba(223, 183, 108, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserCheck size={20} color="var(--trigo)" />
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--trigo)', fontSize: '0.9rem' }}>
                      {user.nombreEmpleado || user.codigoEmpleado}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--blanco-arena-subtle)', textTransform: 'uppercase' }}>
                      {user.role}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/login'); setMobileMenuOpen(false); }}
                  className="btn"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#FCA5A5',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    padding: '5px 10px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)',
                    minHeight: 'auto'
                  }}
                >
                  <LogOut size={13} /> Salir
                </button>
              </div>
            ) : (
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(223, 183, 108, 0.2)' }}>
                <Link 
                  to="/login" 
                  className="btn btn-trigo"
                  style={{ width: '100%', textDecoration: 'none', fontSize: '0.9rem', padding: '10px' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={16} /> Iniciar Sesión Empleados
                </Link>
              </div>
            )}

            {/* LINKS MÓVILES */}
            <div style={{ padding: '16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              
              {/* OPERATIVOS DIRECTOS */}
              {user && (
                <>
                  <Link 
                    to="/pos" 
                    style={mobileLinkStyle(isActive('/pos'), true)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCart size={18} color="var(--trigo)" /> Punto de Venta (POS)
                  </Link>
                  <Link 
                    to="/pedidos" 
                    style={mobileLinkStyle(isActive('/pedidos'), true)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ClipboardList size={18} color="var(--trigo)" /> Comandas & Pedidos
                  </Link>
                </>
              )}

              {/* ACCORDIONS ADMINISTRATIVOS */}
              {isAdmin() && (
                <>
                  {/* SECCIÓN CARTA & MENÚ */}
                  <div>
                    <button 
                      onClick={() => toggleMobileAccordion('menu')}
                      style={mobileAccordionHeaderStyle(isMenuSectionActive, mobileAccordion === 'menu')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Utensils size={18} color="var(--trigo)" /> Carta & Menú
                      </span>
                      <ChevronDown size={16} style={{ transform: mobileAccordion === 'menu' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {mobileAccordion === 'menu' && (
                      <div style={mobileSubMenuContainerStyle}>
                        <Link to="/productos" style={mobileSubLinkStyle(isActive('/productos'))} onClick={() => setMobileMenuOpen(false)}>
                          • Productos & Recetas
                        </Link>
                        <Link to="/categorias" style={mobileSubLinkStyle(isActive('/categorias'))} onClick={() => setMobileMenuOpen(false)}>
                          • Categorías
                        </Link>
                        <Link to="/promociones" style={mobileSubLinkStyle(isActive('/promociones'))} onClick={() => setMobileMenuOpen(false)}>
                          • Promociones & Descuentos
                        </Link>
                        <Link to="/mesas" style={mobileSubLinkStyle(isActive('/mesas'))} onClick={() => setMobileMenuOpen(false)}>
                          • Configurar Mesas
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN INVENTARIO */}
                  <div>
                    <button 
                      onClick={() => toggleMobileAccordion('inventario')}
                      style={mobileAccordionHeaderStyle(isInvSectionActive, mobileAccordion === 'inventario')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={18} color="var(--trigo)" /> Inventario & Stock
                      </span>
                      <ChevronDown size={16} style={{ transform: mobileAccordion === 'inventario' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {mobileAccordion === 'inventario' && (
                      <div style={mobileSubMenuContainerStyle}>
                        <Link to="/inventario" style={mobileSubLinkStyle(isActive('/inventario'))} onClick={() => setMobileMenuOpen(false)}>
                          • Insumos & Stock
                        </Link>
                        <Link to="/movimientos" style={mobileSubLinkStyle(isActive('/movimientos'))} onClick={() => setMobileMenuOpen(false)}>
                          • Kárdex / Movimientos
                        </Link>
                        <Link to="/unidades" style={mobileSubLinkStyle(isActive('/unidades'))} onClick={() => setMobileMenuOpen(false)}>
                          • Unidades de Medida
                        </Link>
                        <Link to="/proveedores" style={mobileSubLinkStyle(isActive('/proveedores'))} onClick={() => setMobileMenuOpen(false)}>
                          • Proveedores
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN ADMINISTRACIÓN */}
                  <div>
                    <button 
                      onClick={() => toggleMobileAccordion('admin')}
                      style={mobileAccordionHeaderStyle(isAdminSectionActive, mobileAccordion === 'admin')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart3 size={18} color="var(--trigo)" /> Finanzas & Personal
                      </span>
                      <ChevronDown size={16} style={{ transform: mobileAccordion === 'admin' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {mobileAccordion === 'admin' && (
                      <div style={mobileSubMenuContainerStyle}>
                        <Link to="/reportes" style={mobileSubLinkStyle(isActive('/reportes'))} onClick={() => setMobileMenuOpen(false)}>
                          • Cierre de Caja & Egresos
                        </Link>
                        <Link to="/usuarios" style={mobileSubLinkStyle(isActive('/usuarios'))} onClick={() => setMobileMenuOpen(false)}>
                          • Empleados & Usuarios
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* MENÚ DIGITAL PÚBLICO */}
              <Link 
                to="/menu" 
                style={mobileLinkStyle(isActive('/menu'), false)}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen size={18} color="var(--trigo)" /> Menú Digital Público
              </Link>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(223, 183, 108, 0.2)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--trigo-light)' }}>
              SAMAES FOOD POS © 2026
            </div>

          </div>
        </div>
      )}

      {/* ESTILOS CSS INLINE PARA MEDIA QUERIES DEL NAVBAR */}
      <style>{`
        @media (max-width: 960px) {
          .navbar-desktop-links,
          .navbar-desktop-user {
            display: none !important;
          }
          .navbar-mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

// ESTILOS VISUALES DESKTOP
const linkStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: active ? 'var(--trigo)' : 'var(--blanco-arena)',
  backgroundColor: active ? 'rgba(223, 183, 108, 0.16)' : 'transparent',
  borderBottom: active ? '2px solid var(--trigo)' : '2px solid transparent',
  padding: '7px 12px',
  borderRadius: '6px 6px 0 0',
  fontSize: '0.85rem',
  fontWeight: active ? '700' : '600',
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap'
});

const dropdownBtnStyle = (isActiveSection, isOpen) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: isActiveSection ? 'var(--trigo)' : 'var(--blanco-arena)',
  backgroundColor: isOpen ? 'rgba(223, 183, 108, 0.22)' : isActiveSection ? 'rgba(223, 183, 108, 0.12)' : 'transparent',
  border: 'none',
  borderBottom: isActiveSection ? '2px solid var(--trigo)' : '2px solid transparent',
  padding: '7px 12px',
  borderRadius: '6px 6px 0 0',
  fontSize: '0.85rem',
  fontWeight: isActiveSection ? '700' : '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap'
});

const dropdownMenuStyle = {
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  minWidth: '220px',
  backgroundColor: 'var(--blanco-arena-card)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  border: '2px solid var(--trigo)',
  padding: '8px 0',
  zIndex: 1050,
  animation: 'fadeIn 0.15s ease-out'
};

const dropdownItemStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 18px',
  color: active ? 'var(--verde-piedra-dark)' : 'var(--texto-principal)',
  backgroundColor: active ? 'rgba(223, 183, 108, 0.2)' : 'transparent',
  fontWeight: active ? '800' : '600',
  fontSize: '0.85rem',
  textDecoration: 'none',
  transition: 'background 0.15s ease'
});

// ESTILOS VISUALES MÓVIL (DRAWER)
const mobileLinkStyle = (active, isHighlighted) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: 'var(--radius-sm)',
  color: active ? 'var(--trigo)' : 'var(--blanco-arena)',
  backgroundColor: active 
    ? 'rgba(223, 183, 108, 0.2)' 
    : isHighlighted 
      ? 'rgba(20, 56, 44, 0.8)' 
      : 'transparent',
  borderLeft: active ? '3px solid var(--trigo)' : '3px solid transparent',
  textDecoration: 'none',
  fontSize: '0.92rem',
  fontWeight: active ? '700' : '600',
  transition: 'all 0.2s ease'
});

const mobileAccordionHeaderStyle = (isActiveSection, isOpen) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '12px 14px',
  borderRadius: 'var(--radius-sm)',
  color: isActiveSection ? 'var(--trigo)' : 'var(--blanco-arena)',
  backgroundColor: isOpen ? 'rgba(223, 183, 108, 0.15)' : 'transparent',
  border: 'none',
  borderLeft: isActiveSection ? '3px solid var(--trigo)' : '3px solid transparent',
  fontSize: '0.92rem',
  fontWeight: isActiveSection ? '700' : '600',
  cursor: 'pointer',
  textAlign: 'left'
});

const mobileSubMenuContainerStyle = {
  backgroundColor: 'rgba(14, 40, 31, 0.7)',
  borderRadius: 'var(--radius-sm)',
  padding: '4px 8px',
  margin: '4px 0 8px 12px',
  borderLeft: '2px solid rgba(223, 183, 108, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px'
};

const mobileSubLinkStyle = (active) => ({
  padding: '8px 12px',
  color: active ? 'var(--trigo)' : 'var(--blanco-arena-subtle)',
  textDecoration: 'none',
  fontSize: '0.85rem',
  fontWeight: active ? '700' : '500',
  borderRadius: '4px',
  backgroundColor: active ? 'rgba(223, 183, 108, 0.15)' : 'transparent',
  transition: 'all 0.15s ease'
});
