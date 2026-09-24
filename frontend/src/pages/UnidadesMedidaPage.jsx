import React, { useState, useEffect } from 'react';
import { Scale, Plus, Edit2, Trash2, RefreshCw, AlertCircle, CheckCircle, ShieldAlert, ArrowRightLeft, Filter, Tag, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const UnidadesMedidaPage = () => {
  const { isAdmin } = useAuth();
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [abreviatura, setAbreviatura] = useState('');
  const [factorDeConversion, setFactorDeConversion] = useState('1.0');
  const [categoriaMedicion, setCategoriaMedicion] = useState('PESO');
  
  // Tab/Filter State ('TODOS' | 'PESO' | 'LIQUIDO' | 'UNIDAD' | ...)
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const fetchUnidades = async () => {
    setLoading(true);
    try {
      const response = await api.get('/unidades-medida');
      setUnidades(response.data);
    } catch (err) {
      setError('Error al cargar la lista de unidades de medida.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchUnidades();
    }
  }, [isAdmin]);

  const abrirModalCrear = () => {
    setEditingUnidad(null);
    setNombre('');
    setAbreviatura('');
    setFactorDeConversion('1.0');
    setCategoriaMedicion('PESO');
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (u) => {
    setEditingUnidad(u);
    setNombre(u.nombre || '');
    setAbreviatura(u.abreviatura || '');
    setFactorDeConversion(u.factorDeConversion ? u.factorDeConversion.toString() : '1.0');
    setCategoriaMedicion(resolverTipo(u));
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const resolverTipo = (u) => {
    if (u.tipo) return u.tipo.toUpperCase();
    const ab = (u.abreviatura || '').toLowerCase();
    const nom = (u.nombre || '').toLowerCase();
    if (['g', 'kg', 'lb', 'oz', 'gramos', 'kilos'].includes(ab) || nom.includes('gram') || nom.includes('kilo') || nom.includes('libra') || nom.includes('onza')) {
      return 'PESO';
    }
    if (['ml', 'l', 'lt', 'litros', 'mililitros'].includes(ab) || nom.includes('litro') || nom.includes('mililitro')) {
      return 'LIQUIDO';
    }
    return 'UNIDAD';
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const catUpper = categoriaMedicion.trim().toUpperCase() || 'UNIDAD';

    const payload = {
      nombre,
      abreviatura,
      factorDeConversion: parseFloat(factorDeConversion) || 1.0,
      tipo: catUpper
    };

    try {
      if (editingUnidad) {
        await api.put(`/unidades-medida/${editingUnidad.id}`, payload);
        setMensaje(`¡Unidad "${nombre}" y categoría "${catUpper}" actualizadas correctamente!`);
      } else {
        await api.post('/unidades-medida', payload);
        setMensaje(`¡Unidad "${nombre}" registrada bajo la categoría "${catUpper}" con éxito!`);
      }
      setModalAbierto(false);
      fetchUnidades();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la unidad de medida.');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta unidad de medida?')) return;
    try {
      await api.delete(`/unidades-medida/${id}`);
      setMensaje('¡Unidad eliminada correctamente!');
      fetchUnidades();
    } catch (err) {
      setError('No se puede eliminar la unidad porque está asociada a insumos activos.');
    }
  };

  // Obtener todas las categorías únicas presentes
  const categoriasUnicas = Array.from(new Set(unidades.map(u => resolverTipo(u))));

  const unidadesFiltradas = unidades.filter(u => {
    if (filtroTipo === 'TODOS') return true;
    return resolverTipo(u) === filtroTipo;
  });

  const getBadgeTitle = (cat) => {
    if (cat === 'PESO') return '⚖️ Peso (Gramos)';
    if (cat === 'LIQUIDO') return '🧪 Líquidos (Mililitros)';
    if (cat === 'UNIDAD') return '📦 Unidades';
    return `🏷️ ${cat}`;
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '28px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={44} style={{ marginBottom: '14px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>La configuración de unidades de medida está restringida al ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Unidades de Medida</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Controla las equivalencias matemáticas para descuento de inventario.</p>
          </div>
          <div className="page-header-actions">
            <button onClick={fetchUnidades} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              <RefreshCw size={15} /> Actualizar
            </button>
            <button onClick={abrirModalCrear} className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <Plus size={16} /> Nueva Unidad
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

        {/* PESTAÑAS DE FILTRADO POR CATEGORÍA DE MEDICIÓN */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid var(--blanco-arena-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
          <button 
            className={`btn ${filtroTipo === 'TODOS' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltroTipo('TODOS')}
            style={{ fontWeight: '700', padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', minHeight: '34px' }}
          >
            <Filter size={13} /> Todas ({unidades.length})
          </button>

          {categoriasUnicas.map((cat) => {
            const count = unidades.filter(u => resolverTipo(u) === cat).length;
            return (
              <button 
                key={cat}
                className={`btn ${filtroTipo === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFiltroTipo(cat)}
                style={{ fontWeight: '700', padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap', minHeight: '34px' }}
              >
                {getBadgeTitle(cat)} ({count})
              </button>
            );
          })}
        </div>

        {/* TABLA DE UNIDADES DE MEDIDA */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando unidades de medida...</div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ backgroundColor: 'var(--verde-piedra-dark)', color: 'var(--blanco-arena)' }}>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>ID</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Nombre</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Abreviatura</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Categoría</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Factor Base</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {unidadesFiltradas.map((u) => {
                  const catUpper = resolverTipo(u);

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--blanco-arena-subtle)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--verde-piedra)' }}>#{u.id}</td>
                      <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--verde-piedra-dark)' }}>{u.nombre}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className="badge badge-trigo" style={{ fontWeight: '800' }}>{u.abreviatura}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span className={`badge ${catUpper === 'PESO' ? 'badge-ok' : catUpper === 'LIQUIDO' ? 'badge-trigo' : ''}`} style={{ fontWeight: '700' }}>
                          {getBadgeTitle(catUpper)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: '800', color: 'var(--verde-piedra-dark)' }}>
                        {u.factorDeConversion} {catUpper === 'PESO' ? '(g base)' : catUpper === 'LIQUIDO' ? '(ml base)' : '(und)'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button onClick={() => abrirModalEditar(u)} style={{ border: 'none', background: 'var(--trigo-light)', color: 'var(--verde-piedra-dark)', padding: '5px 9px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.78rem' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleEliminar(u.id)} style={{ border: 'none', background: '#FEE2E2', color: '#991B1B', padding: '5px 9px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem' }}>
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

      {/* MODAL CREAR / EDITAR UNIDAD */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)' }}>
                {editingUnidad ? 'Editar Unidad de Medida' : 'Crear Nueva Unidad'}
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

            <form onSubmit={handleGuardar}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Categoría de Medición *</label>
                <input 
                  type="text" 
                  required 
                  value={categoriaMedicion} 
                  onChange={(e) => setCategoriaMedicion(e.target.value.toUpperCase())} 
                  placeholder="Ej. PESO, LIQUIDO, PORCIONES" 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--trigo)', marginTop: '4px', textTransform: 'uppercase', fontWeight: '800', color: 'var(--verde-piedra-dark)', fontSize: '0.9rem' }} 
                />
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nombre *</label>
                  <input 
                    type="text" 
                    required 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                    placeholder="Ej. Gramo, Litro" 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} 
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Abreviatura *</label>
                  <input 
                    type="text" 
                    required 
                    value={abreviatura} 
                    onChange={(e) => setAbreviatura(e.target.value)} 
                    placeholder="Ej. g, ml, und" 
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Factor de Conversión Base *</label>
                <input 
                  type="number" 
                  step="any" 
                  required 
                  value={factorDeConversion} 
                  onChange={(e) => setFactorDeConversion(e.target.value)} 
                  placeholder="Ej. 1.0 para base, 1000 para kilos" 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
