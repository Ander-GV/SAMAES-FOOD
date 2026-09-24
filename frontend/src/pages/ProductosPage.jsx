import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Edit2, Trash2, RefreshCw, AlertCircle, CheckCircle, ShieldAlert, Package, Layers, Image as ImageIcon, Power, Upload, ArrowRightLeft, Loader2, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { uploadImageToCloudinary } from '../services/cloudinary';

export const ProductosPage = () => {
  const { isAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorSubida, setErrorSubida] = useState('');
  
  // Tab state: 'activos' | 'inactivos'
  const [filtroEstado, setFiltroEstado] = useState('activos');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [togglingProd, setTogglingProd] = useState(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [imagen, setImagen] = useState('');
  const [estadoId, setEstadoId] = useState(1);
  
  // Receta Insumos State [{ ingredienteId, cantidad, unidadId }]
  const [insumosReceta, setInsumosReceta] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [resProd, resCat, resIng, resRec, resUni] = await Promise.all([
        api.get('/productos').catch(() => ({ data: [] })),
        api.get('/categorias').catch(() => ({ data: [] })),
        api.get('/ingredientes').catch(() => ({ data: [] })),
        api.get('/ingredientes-productos').catch(() => ({ data: [] })),
        api.get('/unidades-medida').catch(() => ({ data: [] }))
      ]);

      const prods = Array.isArray(resProd.data) ? resProd.data : [];
      const cats = Array.isArray(resCat.data) ? resCat.data : [];
      const ings = Array.isArray(resIng.data) ? resIng.data : [];
      const recs = Array.isArray(resRec.data) ? resRec.data : [];
      const unis = Array.isArray(resUni.data) ? resUni.data : [];

      setProductos(prods);
      setCategorias(cats);
      setIngredientes(ings);
      setRecetas(recs);
      setUnidades(unis);

      if (cats.length > 0 && !categoriaId) {
        setCategoriaId(cats[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar la información de productos.');
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
    setEditingProd(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setImagen('');
    setEstadoId(1);
    if (categorias.length > 0) setCategoriaId(categorias[0].id.toString());
    setInsumosReceta([]);
    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (p) => {
    setEditingProd(p);
    setNombre(p.nombre || '');
    setDescripcion(p.descripcion || '');
    setPrecio(p.precio ? p.precio.toString() : '');
    setImagen(p.imagen || '');
    setCategoriaId(p.categoria?.id ? p.categoria.id.toString() : (p.categoriaId ? p.categoriaId.toString() : (categorias[0]?.id?.toString() || '')));
    setEstadoId(p.estadoDelProducto?.id || 1);
    
    // Obtener insumos de la receta actual del producto
    const insumosExistentes = recetas
      .filter(r => r.productos?.id === p.id)
      .map(r => ({
        ingredienteId: r.ingredientes?.id?.toString() || '',
        cantidad: r.cantidad ? r.cantidad.toString() : '0',
        unidadId: r.ingredientes?.unidadDeMedida?.id?.toString() || (unidades[0]?.id?.toString() || '1')
      }));
    setInsumosReceta(insumosExistentes);

    setMensaje('');
    setError('');
    setModalAbierto(true);
  };

  // Carga y subida de archivo de imagen directamente a Cloudinary
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setErrorSubida('');
    setSubiendoImagen(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setImagen(url);
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      setErrorSubida(err.message || 'Error al subir la imagen a la nube.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const agregarFilaInsumo = () => {
    if (ingredientes.length === 0) return;
    const ingInicial = ingredientes[0];
    const uniInicialId = ingInicial.unidadDeMedida?.id?.toString() || (unidades[0]?.id?.toString() || '1');

    setInsumosReceta([
      ...insumosReceta,
      { ingredienteId: ingInicial.id.toString(), cantidad: '10', unidadId: uniInicialId }
    ]);
  };

  const removerFilaInsumo = (index) => {
    const copia = [...insumosReceta];
    copia.splice(index, 1);
    setInsumosReceta(copia);
  };

  const handleInsumoChange = (index, field, value) => {
    const copia = [...insumosReceta];
    copia[index][field] = value;

    // Si cambia de ingrediente, actualizar la unidad por defecto de ese ingrediente
    if (field === 'ingredienteId') {
      const ingSel = ingredientes.find(i => i.id.toString() === value);
      if (ingSel && ingSel.unidadDeMedida) {
        copia[index].unidadId = ingSel.unidadDeMedida.id.toString();
      }
    }

    setInsumosReceta(copia);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const payloadProducto = {
      nombre,
      descripcion,
      precio: parseFloat(precio) || 0,
      imagen: imagen || null,
      categoriaId: parseInt(categoriaId),
      estadoDelProducto: { id: estadoId, nombre: estadoId === 1 ? 'Disponible' : 'Inactivo' }
    };

    try {
      let prodSaved;
      if (editingProd) {
        const res = await api.put(`/productos/${editingProd.id}`, payloadProducto);
        prodSaved = res.data;
        setMensaje('¡Producto actualizado correctamente!');
      } else {
        const res = await api.post('/productos', payloadProducto);
        prodSaved = res.data;
        setMensaje('¡Producto creado exitosamente!');
      }

      // Guardar / Actualizar la receta (descuentos de inventario con conversión matemática)
      if (prodSaved && prodSaved.id) {
        // Eliminar enlaces previos de receta
        const viejasRecetas = recetas.filter(r => r.productos?.id === prodSaved.id);
        for (const vr of viejasRecetas) {
          try {
            await api.delete(`/ingredientes-productos/${vr.id}`);
          } catch (e) {
            console.log('Limpiando receta anterior...');
          }
        }

        // Crear nuevas líneas de receta calculando gramos exactos
        for (const item of insumosReceta) {
          const uni = unidades.find(u => u.id.toString() === item.unidadId);
          const factor = uni?.factorDeConversion || 1.0;
          const cantidadEnGramos = (parseFloat(item.cantidad) || 0) * factor;

          await api.post('/ingredientes-productos', {
            productos: { id: prodSaved.id },
            ingredientes: { id: parseInt(item.ingredienteId) },
            cantidad: cantidadEnGramos
          });
        }
      }

      setModalAbierto(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el producto y su receta.');
    }
  };

  const confirmarDesactivarReactivar = async () => {
    if (!togglingProd) return;
    setMensaje('');
    setError('');

    const estaActualmenteInactivo = togglingProd.estadoDelProducto?.id === 3 || togglingProd.estadoDelProducto?.nombre?.toLowerCase().includes('inactivo');
    const nuevoEstadoId = estaActualmenteInactivo ? 1 : 3;
    const nuevoNombreEstado = estaActualmenteInactivo ? 'Disponible' : 'Inactivo';

    const payload = {
      nombre: togglingProd.nombre,
      descripcion: togglingProd.descripcion,
      precio: togglingProd.precio,
      imagen: togglingProd.imagen,
      categoriaId: togglingProd.categoria?.id || togglingProd.categoriaId,
      estadoDelProducto: { id: nuevoEstadoId, nombre: nuevoNombreEstado }
    };

    try {
      await api.put(`/productos/${togglingProd.id}`, payload);
      setMensaje(estaActualmenteInactivo ? `¡Producto "${togglingProd.nombre}" reactivado en el menú!` : `¡Producto "${togglingProd.nombre}" desactivado del menú!`);
      setTogglingProd(null);
      loadData();
    } catch (err) {
      setError('Error al cambiar el estado del producto.');
      setTogglingProd(null);
    }
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '28px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={44} style={{ marginBottom: '14px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>La configuración de productos y fichas técnicas está restringida al ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  // Filtrado según pestaña
  const productosFiltrados = productos.filter((p) => {
    const esInactivo = p.estadoDelProducto?.id === 3 || p.estadoDelProducto?.nombre?.toLowerCase().includes('inactivo');
    if (filtroEstado === 'activos') {
      return !esInactivo;
    }
    return esInactivo;
  });

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Productos & Carta Gastronómica</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Configura platos, fotos, precios de venta y descuentos de stock.</p>
          </div>
          <div className="page-header-actions">
            <button onClick={loadData} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              <RefreshCw size={15} /> Actualizar
            </button>
            <button onClick={abrirModalCrear} className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              <Plus size={16} /> Nuevo Plato
            </button>
          </div>
        </div>

        {/* PESTAÑAS ACTIVOS / INACTIVOS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid var(--blanco-arena-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
          <button 
            className={`btn ${filtroEstado === 'activos' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltroEstado('activos')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            Platos Activos en Carta ({productos.filter(p => p.estadoDelProducto?.id !== 3 && !p.estadoDelProducto?.nombre?.toLowerCase().includes('inactivo')).length})
          </button>
          <button 
            className={`btn ${filtroEstado === 'inactivos' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFiltroEstado('inactivos')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            Platos Inactivos / Ocultos ({productos.filter(p => p.estadoDelProducto?.id === 3 || p.estadoDelProducto?.nombre?.toLowerCase().includes('inactivo')).length})
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

        {/* TABLA DE PRODUCTOS RESPONSIVA */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando catálogo...</div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--blanco-arena-card)', borderRadius: 'var(--radius-md)' }}>
            <Utensils size={44} color="var(--trigo-dark)" style={{ marginBottom: '14px' }} />
            <h3>No hay productos en la vista "{filtroEstado}"</h3>
            <p style={{ color: 'var(--texto-secundario)', marginTop: '4px', fontSize: '0.88rem' }}>Crea tu primer plato o reactiva alguno inhabilitado.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr style={{ backgroundColor: 'var(--verde-piedra-dark)', color: 'var(--blanco-arena)' }}>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Imagen</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Producto & Descripción</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Categoría</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Precio Venta</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)' }}>Insumos Descontados</th>
                  <th style={{ padding: '14px 18px', fontFamily: 'var(--font-heading)', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((p) => {
                  const insumosPlato = recetas.filter(r => r.productos?.id === p.id);
                  const catNombre = p.categoria?.nombre || categorias.find(c => c.id === p.categoriaId)?.nombre || 'General';
                  const esInactivo = p.estadoDelProducto?.id === 3 || p.estadoDelProducto?.nombre?.toLowerCase().includes('inactivo');

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--blanco-arena-subtle)', opacity: esInactivo ? 0.7 : 1 }}>
                      <td style={{ padding: '12px 16px' }}>
                        {p.imagen ? (
                          <img 
                            src={p.imagen} 
                            alt={p.nombre} 
                            style={{ 
                              width: '64px', 
                              height: '64px', 
                              borderRadius: 'var(--radius-sm)', 
                              objectFit: 'cover',
                              border: '2px solid var(--trigo)',
                              boxShadow: 'var(--shadow-sm)'
                            }} 
                          />
                        ) : (
                          <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--trigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--verde-piedra-dark)' }}>
                            <Utensils size={26} />
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', maxWidth: '280px', whiteSpace: 'normal' }}>
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--verde-piedra-dark)' }}>{p.nombre}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--texto-secundario)', marginTop: '2px', lineHeight: 1.3 }}>{p.descripcion}</div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-trigo" style={{ fontWeight: '700' }}>
                          <Layers size={12} /> {catNombre}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', fontWeight: '800', fontSize: '1.1rem', color: 'var(--verde-piedra-dark)' }}>
                        ${p.precio?.toLocaleString('es-CO')}
                      </td>

                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', maxWidth: '240px', whiteSpace: 'normal' }}>
                        {insumosPlato.length === 0 ? (
                          <span className="badge badge-bajo">Sin insumos</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {insumosPlato.map((ip) => (
                              <div key={ip.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--verde-piedra-dark)' }}>
                                <Package size={12} color="var(--trigo-dark)" />
                                <span>{ip.ingredientes?.nombre}: <strong>-{ip.cantidad}g</strong></span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => abrirModalEditar(p)} style={{ border: 'none', background: 'var(--trigo-light)', color: 'var(--verde-piedra-dark)', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontWeight: '600', fontSize: '0.78rem' }}>
                          <Edit2 size={13} /> Editar
                        </button>
                        
                        <button 
                          onClick={() => setTogglingProd(p)} 
                          style={{ 
                            border: 'none', 
                            background: esInactivo ? '#D1FAE5' : '#FEE2E2', 
                            color: esInactivo ? '#065F46' : '#991B1B', 
                            padding: '6px 10px', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.78rem'
                          }}
                        >
                          <Power size={13} /> {esInactivo ? 'Activar' : 'Desactivar'}
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

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)' }}>
                {editingProd ? 'Editar Producto & Ficha Técnica' : 'Crear Nuevo Producto del Menú'}
              </h3>
              <button 
                onClick={() => setModalAbierto(false)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>

            <form onSubmit={handleGuardar}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nombre del Producto / Plato *</label>
                <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Hamburguesa Artesanal SAMAES" style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Precio de Venta (COP) *</label>
                  <input type="number" required value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej. 24000" style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Categoría del Menú *</label>
                  <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }}>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.estado === false ? '(Inactiva)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Descripción del Plato</label>
                <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción gourmet para el menú digital" style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              {/* FOTOGRAFÍA DEL PLATO */}
              <div style={{ marginBottom: '16px', backgroundColor: 'var(--blanco-arena-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <ImageIcon size={15} /> Fotografía del Plato
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {imagen && (
                    <img src={imagen} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '2px solid var(--trigo)' }} />
                  )}
                  
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: 'auto' }}>
                      {subiendoImagen ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {subiendoImagen ? 'Subiendo...' : 'Seleccionar Foto'}
                      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={subiendoImagen} />
                    </label>
                    {errorSubida && <div style={{ color: '#991B1B', fontSize: '0.72rem', marginTop: '4px' }}>{errorSubida}</div>}
                  </div>
                </div>
              </div>

              {/* FICHA TÉCNICA / INSUMOS DESCONTADOS */}
              <div style={{ backgroundColor: 'rgba(20,56,44,0.04)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--trigo-dark)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--verde-piedra-dark)' }}>Ficha Técnica & Insumos</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', display: 'block' }}>Descuento automático de inventario al vender</span>
                  </div>
                  <button type="button" onClick={agregarFilaInsumo} className="btn btn-trigo" style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: 'auto' }}>
                    <Plus size={13} /> Agregar Insumo
                  </button>
                </div>

                {insumosReceta.length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: '#991B1B', backgroundColor: '#FEE2E2', padding: '8px', borderRadius: '4px', textAlign: 'center', margin: '8px 0' }}>
                    ⚠️ Agrega al menos 1 insumo para activar el descuento automático por venta.
                  </p>
                ) : (
                  insumosReceta.map((row, idx) => {
                    const uniSel = unidades.find(u => u.id.toString() === row.unidadId);
                    const factor = uniSel?.factorDeConversion || 1.0;
                    const valorEnGramosCalculado = (parseFloat(row.cantidad) || 0) * factor;

                    return (
                      <div key={idx} style={{ backgroundColor: '#FFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--blanco-arena-subtle)', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                          
                          {/* SELECCIONAR INSUMO */}
                          <select value={row.ingredienteId} onChange={(e) => handleInsumoChange(idx, 'ingredienteId', e.target.value)} style={{ flex: '2 1 140px', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--blanco-arena-subtle)', fontSize: '0.82rem' }}>
                            {ingredientes.map((ing) => (
                              <option key={ing.id} value={ing.id}>{ing.nombre}</option>
                            ))}
                          </select>

                          {/* INGRESO DE CANTIDAD */}
                          <input 
                            type="number" 
                            step="0.001" 
                            value={row.cantidad} 
                            onChange={(e) => handleInsumoChange(idx, 'cantidad', e.target.value)} 
                            placeholder="Cant." 
                            style={{ flex: '1 1 70px', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--blanco-arena-subtle)', fontSize: '0.82rem' }} 
                          />

                          {/* SELECCIÓN DE UNIDAD */}
                          <select value={row.unidadId} onChange={(e) => handleInsumoChange(idx, 'unidadId', e.target.value)} style={{ flex: '1 1 80px', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--blanco-arena-subtle)', fontSize: '0.82rem', fontWeight: '700' }}>
                            {unidades.map((u) => (
                              <option key={u.id} value={u.id}>{u.abreviatura || u.nombre}</option>
                            ))}
                          </select>

                          {/* BOTÓN ELIMINAR FILA */}
                          <button type="button" onClick={() => removerFilaInsumo(idx)} style={{ border: 'none', background: '#FEE2E2', color: '#991B1B', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>

                        </div>

                        {/* VISUALIZACIÓN DE CONVERSIÓN */}
                        <div style={{ marginTop: '4px', fontSize: '0.72rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <ArrowRightLeft size={11} color="var(--trigo-dark)" />
                          <span>Descuenta: <strong>{valorEnGramosCalculado}g</strong> ({row.cantidad} {uniSel?.abreviatura || 'und'} × factor {factor})</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Guardar Plato</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DESACTIVACIÓN LÓGICA / REACTIVACIÓN */}
      {togglingProd && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--verde-piedra-dark)', marginBottom: '8px' }}>
              {togglingProd.estadoDelProducto?.id === 3 ? `¿Reactivar "${togglingProd.nombre}"?` : `¿Desactivar "${togglingProd.nombre}"?`}
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.85rem', marginBottom: '20px' }}>
              {togglingProd.estadoDelProducto?.id === 3 
                ? 'El producto volverá a estar visible en el menú digital y POS.' 
                : 'El producto se ocultará del menú y POS pero se preservará su historial.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setTogglingProd(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Cancelar</button>
              <button type="button" onClick={confirmarDesactivarReactivar} className="btn btn-trigo" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
