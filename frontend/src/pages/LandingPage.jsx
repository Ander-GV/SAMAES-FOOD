import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Star, ShieldCheck, Clock, Award, ArrowRight, Sparkles, Phone, MapPin, Heart, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

export const LandingPage = () => {
  const { user } = useAuth();
  const [productosDestacados, setProductosDestacados] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.get('/productos');
        const prodsActivos = (response.data || []).filter(p => {
          const prodActivo = p.estadoDelProducto?.id !== 3 && !p.estadoDelProducto?.nombre?.toLowerCase().includes('inactivo');
          const catActiva = !p.categoria || p.categoria.estado !== false;
          return prodActivo && catActiva;
        });
        setProductosDestacados(prodsActivos.slice(0, 4));
      } catch (err) {
        console.log('Cargando menú...');
      }
    };
    fetchProductos();
  }, []);

  return (
    <div className="landing-samaes" style={{ backgroundColor: 'var(--blanco-arena)', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      
      {/* HERO BANNER SECTION */}
      <section style={{
        backgroundColor: 'var(--verde-piedra-dark)',
        color: 'var(--blanco-arena)',
        padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '4px solid var(--trigo)'
      }}>
        {/* Glow de Acento Trigo */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: 'clamp(260px, 40vw, 450px)',
          height: 'clamp(260px, 40vw, 450px)',
          background: 'radial-gradient(circle, rgba(223,183,108,0.18) 0%, rgba(20,56,44,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="landing-hero-grid">
            
            <div>
              <span className="badge badge-trigo" style={{ marginBottom: '16px' }}>
                <Sparkles size={14} color="var(--trigo)" /> Buen Sabor, Buen Ambiente
              </span>
              <h1 style={{ 
                fontSize: 'clamp(2.3rem, 6vw, 3.6rem)', 
                color: 'var(--blanco-arena)', 
                lineHeight: 1.15,
                marginBottom: '18px',
                fontFamily: 'var(--font-heading)'
              }}>
                Bienvenidos a <br />
                <span style={{ color: 'var(--trigo)' }}>SAMAES FOOD</span>
              </h1>
              <p style={{ 
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', 
                color: 'var(--blanco-arena-subtle)', 
                marginBottom: '28px',
                lineHeight: 1.6,
                maxWidth: '520px',
                margin: '0 auto 28px auto'
              }}>
                Pasión por los sabores auténticos, ingredientes frescos seleccionados y una atención excepcional diseñada para crear momentos inolvidables.
              </p>

              <div className="landing-hero-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/menu" className="btn btn-trigo" style={{ padding: '12px 24px', fontSize: '1rem', textDecoration: 'none', flex: '1 1 auto', minWidth: '200px' }}>
                  <Utensils size={18} /> Explorar Menú Digital
                </Link>
                
                {user ? (
                  <Link to="/pos" className="btn btn-primary" style={{ 
                    padding: '12px 24px', 
                    fontSize: '1rem', 
                    backgroundColor: 'var(--trigo-dark)',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    flex: '1 1 auto',
                    minWidth: '200px'
                  }}>
                    <ShoppingCart size={18} /> Punto de Venta (POS)
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-outline" style={{ 
                    padding: '12px 24px', 
                    fontSize: '1rem', 
                    color: 'var(--trigo)', 
                    borderColor: 'var(--trigo)',
                    textDecoration: 'none',
                    flex: '1 1 auto',
                    minWidth: '200px'
                  }}>
                    Acceso Empleados <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>

            {/* HERO CONTAINER CON MAQUETACIÓN LIMPIA */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '3px solid var(--trigo)',
                backgroundColor: 'var(--verde-piedra)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                
                {/* FRIP DE CABECERA CON LOGO Y MARCA */}
                <div style={{
                  backgroundColor: 'rgba(14, 40, 31, 0.95)',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--trigo-dark)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/images/logo.jpg" alt="Logo SAMAES" style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1.5px solid var(--trigo)' }} />
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ color: 'var(--blanco-arena)', fontWeight: '700', fontSize: '0.9rem', fontFamily: 'var(--font-heading)', display: 'block', lineHeight: 1.1 }}>
                        SAMAES FOOD
                      </span>
                      <span style={{ color: 'var(--trigo)', fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                        EST. 2026
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-trigo" style={{ fontSize: '0.7rem' }}>Gourmet & POS</span>
                </div>

                {/* FOTO PRINCIPAL DEL HERO */}
                <div style={{ position: 'relative', minHeight: '220px', maxHeight: '340px', backgroundColor: 'var(--verde-piedra-dark)' }}>
                  <img 
                    src="/images/hero/hero_samaes.jpg" 
                    alt="SAMAES FOOD Gastronomía" 
                    style={{ width: '100%', height: '100%', minHeight: '220px', maxHeight: '340px', objectFit: 'cover', display: 'block' }}
                  />
                </div>

                {/* PIE DE TARJETA */}
                <div style={{ padding: '14px 18px', backgroundColor: 'var(--verde-piedra-dark)', borderTop: '1px solid rgba(223,183,108,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--trigo)', fontWeight: '700', fontSize: '0.88rem' }}>
                    <Star size={16} fill="var(--trigo)" /> Sabor Artesanal & Calidad Premium
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN DE FRASES GASTRONÓMICAS */}
      <section style={{
        padding: 'clamp(40px, 6vw, 60px) clamp(16px, 4vw, 24px)',
        backgroundColor: 'var(--blanco-arena-subtle)',
        borderBottom: '1px solid rgba(20,56,44,0.08)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: 'var(--verde-piedra)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.82rem' }}>
              Nuestra Filosofía
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--verde-piedra-dark)', marginTop: '6px' }}>
              El Arte de Comer Bien en <span style={{ color: 'var(--trigo-dark)' }}>SAMAES FOOD</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            
            <div style={{
              backgroundColor: 'var(--blanco-arena-card)',
              padding: 'clamp(20px, 4vw, 28px)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--verde-piedra)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Heart size={28} color="var(--trigo-dark)" style={{ marginBottom: '12px' }} />
              <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--texto-principal)', marginBottom: '10px' }}>
                "Donde cada receta cuenta una historia y cada plato se sirve con el corazón."
              </p>
              <span style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', fontWeight: '600' }}>— Cocina SAMAES</span>
            </div>

            <div style={{
              backgroundColor: 'var(--blanco-arena-card)',
              padding: 'clamp(20px, 4vw, 28px)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--trigo-dark)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Sparkles size={28} color="var(--verde-piedra)" style={{ marginBottom: '12px' }} />
              <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--texto-principal)', marginBottom: '10px' }}>
                "Calidad en cada insumo, magia en cada preparación."
              </p>
              <span style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', fontWeight: '600' }}>— Compromiso de Frescura</span>
            </div>

            <div style={{
              backgroundColor: 'var(--blanco-arena-card)',
              padding: 'clamp(20px, 4vw, 28px)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--verde-piedra)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Award size={28} color="var(--trigo-dark)" style={{ marginBottom: '12px' }} />
              <p style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--texto-principal)', marginBottom: '10px' }}>
                "La excelencia no es un acto, es nuestro compromiso diario con tu paladar."
              </p>
              <span style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', fontWeight: '600' }}>— Estándar SAMAES FOOD</span>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN CARACTERÍSTICAS (POR QUÉ ELEGIRNOS) */}
      <section style={{ padding: 'clamp(40px, 7vw, 80px) clamp(16px, 4vw, 24px)', backgroundColor: 'var(--blanco-arena)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--verde-piedra-dark)' }}>
              ¿Por qué elegir <span style={{ color: 'var(--trigo-dark)' }}>SAMAES FOOD</span>?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '24px' }}>
            
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(20,56,44,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <ShieldCheck size={28} color="var(--verde-piedra)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Ingredientes 100% Frescos</h3>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>
                Seleccionamos cuidadosamente insumos locales e ingredientes de primera calidad para asegurar un sabor auténtico.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(223,183,108,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Utensils size={28} color="var(--trigo-dark)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Maestría Culinaria</h3>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>
                Nuestras recetas combinan técnicas artesanales y sazón de autor en cada presentación.
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(20,56,44,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Clock size={28} color="var(--verde-piedra)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Servicio Ágil & Cálido</h3>
              <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem' }}>
                Tu tiempo importa. Servimos tus platos favoritos con la mayor velocidad en mesa y domicilios.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: 'var(--verde-piedra-dark)',
        color: 'var(--blanco-arena)',
        padding: '36px 20px',
        borderTop: '3px solid var(--trigo)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <img src="/images/logo.jpg" alt="Logo SAMAES" style={{ width: '54px', height: '54px', borderRadius: '50%', marginBottom: '10px', border: '2px solid var(--trigo)' }} />
          <h3 style={{ color: 'var(--trigo)', fontFamily: 'var(--font-heading)', fontSize: '1.4rem', marginBottom: '6px' }}>
            SAMAES FOOD
          </h3>
          <p style={{ color: 'var(--blanco-arena-subtle)', marginBottom: '18px', fontSize: '0.88rem' }}>
            Buen Sabor, Buen Ambiente — Sistema POS & Plataforma Gastronómica Integral
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.88rem', color: 'var(--trigo-light)', flexWrap: 'wrap', marginBottom: '18px' }}>
            <a 
              href="https://maps.app.goo.gl/Bmq9W5NzwRpekB7n7?g_st=ic" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blanco-arena)', textDecoration: 'none', transition: 'color 0.2s' }}
            >
              <MapPin size={16} color="var(--trigo)" /> Al lado de Vacilao (Ver Mapa)
            </a>
            <a 
              href="https://wa.me/573165530486" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--blanco-arena)', textDecoration: 'none', transition: 'color 0.2s' }}
            >
              <Phone size={16} color="var(--trigo)" /> Domicilios: 316 553 0486
            </a>
          </div>

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
              padding: '8px 18px',
              borderRadius: '999px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: '1px solid var(--trigo)',
              transition: 'all 0.2s ease'
            }}
          >
            <InstagramIcon size={16} /> Síguenos en Instagram @samaes25
          </a>
        </div>
      </footer>

    </div>
  );
};
