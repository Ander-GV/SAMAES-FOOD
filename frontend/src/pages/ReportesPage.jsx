import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  DollarSign, 
  Calendar, 
  RefreshCw, 
  ShieldAlert, 
  ArrowUpRight, 
  ArrowDownRight, 
  ReceiptText, 
  Plus, 
  Trash2, 
  Wallet, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  ChefHat, 
  Coins, 
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const DENOMINACIONES_COP = [
  { label: '$100.000', valor: 100000, tipo: 'BILLETE' },
  { label: '$50.000', valor: 50000, tipo: 'BILLETE' },
  { label: '$20.000', valor: 20000, tipo: 'BILLETE' },
  { label: '$10.000', valor: 10000, tipo: 'BILLETE' },
  { label: '$5.000', valor: 5000, tipo: 'BILLETE' },
  { label: '$2.000', valor: 2000, tipo: 'BILLETE' },
  { label: '$1.000', valor: 1000, tipo: 'MONEDA' },
  { label: '$500', valor: 500, tipo: 'MONEDA' },
  { label: '$200', valor: 200, tipo: 'MONEDA' },
  { label: '$100', valor: 100, tipo: 'MONEDA' },
  { label: '$50', valor: 50, tipo: 'MONEDA' }
];

export const ReportesPage = () => {
  const { isAdmin } = useAuth();
  const [cierreCaja, setCierreCaja] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [cajeroSeleccionado, setCajeroSeleccionado] = useState('');
  const [pestañaActiva, setPestañaActiva] = useState('CIERRE'); // 'CIERRE' | 'GASTOS' | 'PRODUCTOS'

  // Arqueo y Desglose de Billetes
  const [conteoBilletes, setConteoBilletes] = useState({});
  const [efectivoContadoManual, setEfectivoContadoManual] = useState('');
  const [modoConteo, setModoConteo] = useState('DESGLOSE'); // 'DESGLOSE' | 'MANUAL'

  // Modales
  const [modalGastoAbierto, setModalGastoAbierto] = useState(false);
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);

  // Formulario de Gasto / Pago a Empleado
  const [tipoGasto, setTipoGasto] = useState('PAGO_EMPLEADO'); // 'PAGO_EMPLEADO' | 'GASTO_OPERATIVO'
  const [empleadoSeleccionadoId, setEmpleadoSeleccionadoId] = useState('');
  const [categoriaGasto, setCategoriaGasto] = useState('COMPRA_INSUMOS');
  const [montoGasto, setMontoGasto] = useState('');
  const [descripcionGasto, setDescripcionGasto] = useState('');
  const [guardandoGasto, setGuardandoGasto] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [errorGasto, setErrorGasto] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [resCierre, resGastos, resTop, resUsers, resEmp] = await Promise.all([
        api.get(`/reportes/cierre-caja?fecha=${fechaFiltro}${cajeroSeleccionado ? `&usuarioId=${cajeroSeleccionado}` : ''}`).catch(() => ({ data: null })),
        api.get(`/gastos/fecha?fecha=${fechaFiltro}`).catch(() => ({ data: [] })),
        api.get('/reportes/productos-mas-vendidos').catch(() => ({ data: [] })),
        api.get('/usuarios').catch(() => ({ data: [] })),
        api.get('/empleados').catch(() => ({ data: [] }))
      ]);

      if (resCierre.data) setCierreCaja(resCierre.data);
      setGastos(Array.isArray(resGastos.data) ? resGastos.data : []);
      setTopProductos(Array.isArray(resTop.data) ? resTop.data : []);
      setUsuarios(Array.isArray(resUsers.data) ? resUsers.data : []);
      const emps = Array.isArray(resEmp.data) ? resEmp.data : [];
      setEmpleados(emps);

      if (emps.length > 0 && !empleadoSeleccionadoId) {
        setEmpleadoSeleccionadoId(emps[0].id.toString());
      }
    } catch (err) {
      console.error('Error al cargar reportes financieros:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin, fechaFiltro, cajeroSeleccionado]);

  const handleCajeroChange = (e) => {
    setCajeroSeleccionado(e.target.value);
  };

  const handleConteoChange = (valor, cantidad) => {
    const cantNum = parseInt(cantidad) || 0;
    setConteoBilletes(prev => ({
      ...prev,
      [valor]: Math.max(0, cantNum)
    }));
  };

  const calcularTotalBilletes = () => {
    return DENOMINACIONES_COP.reduce((total, den) => {
      const cant = conteoBilletes[den.valor] || 0;
      return total + (den.valor * cant);
    }, 0);
  };

  const valorContado = modoConteo === 'DESGLOSE' 
    ? calcularTotalBilletes() 
    : (parseFloat(efectivoContadoManual) || 0);

  const efectivoEsperado = (cierreCaja?.totalEfectivo || 0) - (cierreCaja?.totalEgresos || 0);
  const diferenciaCuadre = valorContado - efectivoEsperado;

  const handleGuardarGasto = async (e) => {
    e.preventDefault();
    if (!montoGasto || parseFloat(montoGasto) <= 0) {
      setErrorGasto('Ingresa un monto válido.');
      return;
    }

    setGuardandoGasto(true);
    setErrorGasto('');

    try {
      const empSel = empleados.find(emp => emp.id.toString() === empleadoSeleccionadoId);
      const payload = {
        monto: parseFloat(montoGasto),
        categoria: tipoGasto === 'PAGO_EMPLEADO' ? 'PAGO_EMPLEADO' : categoriaGasto,
        descripcion: descripcionGasto,
        nombreEmpleado: tipoGasto === 'PAGO_EMPLEADO' && empSel ? `${empSel.nombre} ${empSel.apellido || ''}` : null,
        empleadoId: tipoGasto === 'PAGO_EMPLEADO' && empSel ? empSel.id : null
      };

      await api.post('/gastos', payload);
      setMensajeAlerta('¡Egreso/Pago registrado y descontado del efectivo de caja!');
      setModalGastoAbierto(false);
      setMontoGasto('');
      setDescripcionGasto('');
      loadData();
    } catch (err) {
      setErrorGasto(err.response?.data?.message || 'Error al registrar el egreso.');
    } finally {
      setGuardandoGasto(false);
    }
  };

  const handleEliminarGasto = async (id) => {
    if (!window.confirm('¿Seguro que deseas anular este registro de salida? El monto volverá a sumarse a la caja.')) return;
    try {
      await api.delete(`/gastos/${id}`);
      setMensajeAlerta('Registro de salida anulado exitosamente.');
      loadData();
    } catch (err) {
      alert('Error al anular el registro.');
    }
  };

  const handleConfirmarCierreTurno = async () => {
    try {
      await api.post('/reportes/cierre-turno', {
        fecha: fechaFiltro,
        efectivoEsperado,
        efectivoContado: valorContado,
        diferencia: diferenciaCuadre
      });
      setModalCierreAbierto(false);
      setMensajeAlerta('¡Turno de caja cerrado exitosamente!');
      loadData();
    } catch (e) {
      setModalCierreAbierto(false);
      setMensajeAlerta('Turno consolidado.');
      loadData();
    }
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
          <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>El módulo de Cierre de Caja y Finanzas está restringido al perfil ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)' }}>Cierre de Caja & Finanzas Diarias</h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem' }}>Arqueo de billetes, control de efectivo real, egresos y pagos de jornales.</p>
          </div>

          <div className="page-header-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--blanco-arena-card)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--trigo)' }}>
              <Calendar size={15} color="var(--verde-piedra)" />
              <input 
                type="date" 
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontWeight: '700', fontSize: '0.85rem', color: 'var(--verde-piedra-dark)', outline: 'none' }}
              />
            </div>

            <button onClick={loadData} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 12px' }}>
              <RefreshCw size={15} /> Actualizar
            </button>
          </div>
        </div>

        {mensajeAlerta && (
          <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} /> {mensajeAlerta}
          </div>
        )}

        {/* PESTAÑAS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid var(--blanco-arena-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
          <button 
            className={`btn ${pestañaActiva === 'CIERRE' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setPestañaActiva('CIERRE')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            <Wallet size={15} /> Arqueo & Cierre de Caja
          </button>
          <button 
            className={`btn ${pestañaActiva === 'GASTOS' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setPestañaActiva('GASTOS')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            <ReceiptText size={15} /> Salidas & Pagos ({gastos.length})
          </button>
          <button 
            className={`btn ${pestañaActiva === 'PRODUCTOS' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setPestañaActiva('PRODUCTOS')}
            style={{ fontWeight: '700', fontSize: '0.82rem', padding: '8px 14px', whiteSpace: 'nowrap', minHeight: '36px' }}
          >
            <Award size={15} /> Ranking de Platos
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>Cargando información contable...</div>
        ) : (
          <>
            {/* PESTAÑA 1: ARQUEO Y CIERRE DE CAJA */}
            {pestañaActiva === 'CIERRE' && (
              <div>
                {/* TARJETAS DE RESUMEN FINANCIERO */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', marginBottom: '24px' }}>
                  
                  {/* 1. VENTAS TOTALES */}
                  <div style={{ backgroundColor: 'var(--blanco-arena-card)', padding: '18px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(20,56,44,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', fontWeight: '700', textTransform: 'uppercase' }}>Ingresos Brutos</span>
                      <ArrowUpRight size={16} color="var(--exito)" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--verde-piedra)' }}>
                      {formatCOP(cierreCaja?.totalRecaudado)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--texto-secundario)', marginTop: '2px' }}>
                      {cierreCaja?.cantidadTransacciones || 0} transacciones
                    </div>
                  </div>

                  {/* 2. VENTAS EN EFECTIVO */}
                  <div style={{ backgroundColor: 'var(--blanco-arena-card)', padding: '18px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(20,56,44,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', fontWeight: '700', textTransform: 'uppercase' }}>Ventas Efectivo</span>
                      <DollarSign size={16} color="var(--verde-piedra)" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--verde-piedra-dark)' }}>
                      {formatCOP(cierreCaja?.totalEfectivo)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--texto-secundario)', marginTop: '2px' }}>
                      Dinero físico que ingresó
                    </div>
                  </div>

                  {/* 3. EGRESOS / PAGOS DE JORNAL */}
                  <div style={{ backgroundColor: 'var(--blanco-arena-card)', padding: '18px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: '700', textTransform: 'uppercase' }}>Total Salidas</span>
                      <ArrowDownRight size={16} color="#EF4444" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#991B1B' }}>
                      -{formatCOP(cierreCaja?.totalEgresos)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '2px' }}>
                      {gastos.length} egresos pagados hoy
                    </div>
                  </div>

                  {/* 4. BALANCE NETO EN EFECTIVO */}
                  <div style={{ backgroundColor: 'var(--verde-piedra)', color: 'var(--blanco-arena)', padding: '18px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--trigo-light)', fontWeight: '800', textTransform: 'uppercase' }}>Efectivo Físico Esperado</span>
                      <Wallet size={16} color="var(--trigo)" />
                    </div>
                    <div style={{ fontSize: '1.65rem', fontWeight: '900', color: 'var(--trigo)' }}>
                      {formatCOP(efectivoEsperado)}
                    </div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '2px' }}>
                      (Ventas Efectivo - Pagos)
                    </div>
                  </div>

                </div>

                {/* DETALLE DE ARQUEO Y CUADRE DE CAJA (GRID RESPONSIVA) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '20px', marginBottom: '28px' }}>
                  
                  {/* CUADRO DE ARQUEO CON FILTRO POR CAJERO */}
                  <div style={{ backgroundColor: 'var(--blanco-arena-card)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '2px solid var(--trigo)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck size={18} color="var(--trigo-dark)" /> Arqueo de Caja del Día
                      </h3>

                      <select 
                        value={cajeroSeleccionado}
                        onChange={handleCajeroChange}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--trigo)',
                          fontSize: '0.8rem',
                          backgroundColor: 'var(--blanco-arena-subtle)',
                          fontWeight: '700',
                          color: 'var(--verde-piedra-dark)'
                        }}
                      >
                        <option value="">Todos los Cajeros</option>
                        {usuarios.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.codigoEmpleado} ({u.role || 'Cajero'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--blanco-arena-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <span>💵 Ventas Efectivo (+):</span>
                        <strong style={{ color: 'var(--verde-piedra)' }}>{formatCOP(cierreCaja?.totalEfectivo)}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <span style={{ color: '#991B1B' }}>👨‍🍳 Jornales Pagados (-):</span>
                        <strong style={{ color: '#991B1B' }}>-{formatCOP(cierreCaja?.totalPagosEmpleados)}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <span style={{ color: '#991B1B' }}>🛒 Gastos Operativos (-):</span>
                        <strong style={{ color: '#991B1B' }}>-{formatCOP(cierreCaja?.totalGastosOperativos)}</strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(20,56,44,0.08)', borderRadius: 'var(--radius-sm)', borderTop: '2px dashed var(--verde-piedra)', marginTop: '4px', fontSize: '0.9rem' }}>
                        <strong style={{ color: 'var(--verde-piedra-dark)' }}>Efectivo Físico que DEBE haber:</strong>
                        <strong style={{ color: 'var(--verde-piedra)', fontSize: '1.15rem' }}>{formatCOP(efectivoEsperado)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* CUADRO DE CONTEO FÍSICO / DESGLOSE DE BILLETES */}
                  <div style={{ backgroundColor: 'var(--blanco-arena-card)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '2px solid var(--trigo)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calculator size={18} color="var(--trigo-dark)" /> Conteo Físico Real
                      </h3>

                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => setModoConteo('DESGLOSE')}
                          className={`btn ${modoConteo === 'DESGLOSE' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '4px 8px', fontSize: '0.72rem', minHeight: 'auto' }}
                        >
                          <Coins size={12} /> Billetes
                        </button>
                        <button 
                          onClick={() => setModoConteo('MANUAL')}
                          className={`btn ${modoConteo === 'MANUAL' ? 'btn-primary' : 'btn-outline'}`}
                          style={{ padding: '4px 8px', fontSize: '0.72rem', minHeight: 'auto' }}
                        >
                          Total Directo
                        </button>
                      </div>
                    </div>

                    {modoConteo === 'DESGLOSE' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 130px), 1fr))', gap: '8px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px', marginBottom: '14px' }}>
                        {DENOMINACIONES_COP.map((den) => (
                          <div key={den.valor} style={{ backgroundColor: 'var(--blanco-arena-subtle)', padding: '6px 8px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--verde-piedra-dark)' }}>{den.label}</span>
                            <input 
                              type="number"
                              min="0"
                              placeholder="0"
                              value={conteoBilletes[den.valor] || ''}
                              onChange={(e) => handleConteoChange(den.valor, e.target.value)}
                              style={{ width: '48px', padding: '3px 4px', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--trigo)', fontWeight: '800', fontSize: '0.82rem' }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Ingresa el Total en Efectivo Contado ($):</label>
                        <input 
                          type="number"
                          value={efectivoContadoManual}
                          onChange={(e) => setEfectivoContadoManual(e.target.value)}
                          placeholder="Ej. 340000"
                          style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--trigo)', fontSize: '1.1rem', fontWeight: '800', marginTop: '4px' }}
                        />
                      </div>
                    )}

                    {/* RESULTADO DEL CUADRE */}
                    <div style={{ backgroundColor: Math.abs(diferenciaCuadre) < 1 ? '#D1FAE5' : diferenciaCuadre < 0 ? '#FEE2E2' : '#FEF3C7', padding: '12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${Math.abs(diferenciaCuadre) < 1 ? '#10B981' : diferenciaCuadre < 0 ? '#EF4444' : '#F59E0B'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: Math.abs(diferenciaCuadre) < 1 ? '#065F46' : diferenciaCuadre < 0 ? '#991B1B' : '#92400E' }}>
                          {Math.abs(diferenciaCuadre) < 1 ? '✅ CUADRE PERFECTO' : diferenciaCuadre < 0 ? '⚠️ FALTANTE EN CAJA' : 'ℹ️ SOBRANTE EN CAJA'}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '900', color: Math.abs(diferenciaCuadre) < 1 ? '#065F46' : diferenciaCuadre < 0 ? '#991B1B' : '#92400E' }}>
                          {formatCOP(diferenciaCuadre)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '2px', color: 'var(--texto-secundario)' }}>
                        Esperado: {formatCOP(efectivoEsperado)} | Contado: {formatCOP(valorContado)}
                      </div>
                    </div>

                    <button onClick={() => setModalCierreAbierto(true)} className="btn btn-trigo" style={{ width: '100%', padding: '10px', fontWeight: '700', marginTop: '14px', fontSize: '0.88rem' }}>
                      <RefreshCw size={15} /> Consolidar Cierre de Turno
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* PESTAÑA 2: GASTOS Y PAGOS A EMPLEADOS */}
            {pestañaActiva === 'GASTOS' && (
              <div style={{ backgroundColor: 'var(--blanco-arena-card)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(20,56,44,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--verde-piedra-dark)' }}>Historial de Salidas & Pagos de Jornal</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)' }}>Se descuentan automáticamente del efectivo en caja.</p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button onClick={() => { setTipoGasto('PAGO_EMPLEADO'); setModalGastoAbierto(true); }} className="btn btn-trigo" style={{ fontSize: '0.8rem', padding: '6px 12px', minHeight: '34px' }}>
                      <ChefHat size={14} /> + Pagar Jornal
                    </button>
                    <button onClick={() => { setTipoGasto('GASTO_OPERATIVO'); setModalGastoAbierto(true); }} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '6px 12px', minHeight: '34px' }}>
                      <Plus size={14} /> + Gasto Menor
                    </button>
                  </div>
                </div>

                {gastos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--texto-secundario)', border: '2px dashed var(--blanco-arena-subtle)', borderRadius: 'var(--radius-md)' }}>
                    No hay registros de salidas ni pagos para la fecha seleccionada.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--blanco-arena-subtle)', textAlign: 'left', borderBottom: '2px solid rgba(20,56,44,0.1)' }}>
                          <th style={{ padding: '12px 16px' }}>Hora</th>
                          <th style={{ padding: '12px 16px' }}>Categoría</th>
                          <th style={{ padding: '12px 16px' }}>Beneficiario</th>
                          <th style={{ padding: '12px 16px' }}>Descripción</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>Monto</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gastos.map((g) => (
                          <tr key={g.id} style={{ borderBottom: '1px solid var(--blanco-arena-subtle)' }}>
                            <td style={{ padding: '12px 16px', color: 'var(--texto-secundario)', fontSize: '0.82rem' }}>
                              {g.fecha ? new Date(g.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className={`badge ${g.categoria === 'PAGO_EMPLEADO' ? 'badge-trigo' : 'badge-bajo'}`}>
                                {g.categoria === 'PAGO_EMPLEADO' ? 'Jornal' : g.categoria}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--verde-piedra-dark)' }}>
                              {g.nombreEmpleado || 'Gasto General'}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--texto-principal)', fontSize: '0.85rem' }}>
                              {g.descripcion || 'Sin descripción'}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '800', color: '#991B1B', fontSize: '0.95rem' }}>
                              -{formatCOP(g.monto)}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <button 
                                onClick={() => handleEliminarGasto(g.id)}
                                style={{ backgroundColor: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                title="Anular este registro"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 3: RANKING DE PLATOS */}
            {pestañaActiva === 'PRODUCTOS' && (
              <div style={{ backgroundColor: 'var(--blanco-arena-card)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(20,56,44,0.08)' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--verde-piedra-dark)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color="var(--trigo-dark)" /> Ranking de Platos Más Vendidos
                </h3>

                {topProductos.length === 0 ? (
                  <div style={{ color: 'var(--texto-secundario)', padding: '40px', textAlign: 'center' }}>No hay ventas registradas para el ranking.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: '14px' }}>
                    {topProductos.map((p, idx) => (
                      <div key={p.productoId} style={{ backgroundColor: 'var(--blanco-arena-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', border: idx === 0 ? '2px solid var(--trigo)' : '1px solid rgba(20,56,44,0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '800', color: idx === 0 ? 'var(--trigo-dark)' : 'var(--verde-piedra-dark)', fontSize: '1rem' }}>
                            #{idx + 1} {p.nombreProducto}
                          </span>
                          <span className="badge badge-ok">{p.cantidadVendida} vendidos</span>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--verde-piedra)' }}>
                          Total: {formatCOP(p.totalRecaudado)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </>
        )}

      </div>

      {/* MODAL REGISTRAR GASTO / PAGO JORNAL A EMPLEADO */}
      {modalGastoAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {tipoGasto === 'PAGO_EMPLEADO' ? <ChefHat size={20} color="var(--trigo-dark)" /> : <DollarSign size={20} color="var(--trigo-dark)" />}
                {tipoGasto === 'PAGO_EMPLEADO' ? 'Pagar Turno / Jornal' : 'Registrar Salida / Gasto'}
              </h3>
              <button onClick={() => setModalGastoAbierto(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>

            {errorGasto && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '0.82rem' }}>
                {errorGasto}
              </div>
            )}

            <form onSubmit={handleGuardarGasto}>
              {tipoGasto === 'PAGO_EMPLEADO' ? (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra-dark)', display: 'block', marginBottom: '4px' }}>
                    Seleccionar Empleado:
                  </label>
                  {empleados.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#991B1B' }}>No hay empleados registrados en el sistema.</div>
                  ) : (
                    <select
                      value={empleadoSeleccionadoId}
                      onChange={(e) => setEmpleadoSeleccionadoId(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--trigo)', fontWeight: '600', fontSize: '0.9rem' }}
                    >
                      {empleados.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombre} {emp.apellido || ''} ({emp.cargo || 'Personal'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra-dark)', display: 'block', marginBottom: '4px' }}>
                    Categoría del Gasto:
                  </label>
                  <select
                    value={categoriaGasto}
                    onChange={(e) => setCategoriaGasto(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--trigo)', fontWeight: '600', fontSize: '0.9rem' }}
                  >
                    <option value="COMPRA_INSUMOS">Compra de Insumos / Ingredientes</option>
                    <option value="SERVICIOS">Servicios / Domicilios / Envíos</option>
                    <option value="ASEO_MANTENIMIENTO">Aseo & Mantenimiento</option>
                    <option value="OTROS">Otros Gastos Varios</option>
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra-dark)', display: 'block', marginBottom: '4px' }}>
                  Monto a Pagar ($) *:
                </label>
                <input 
                  type="number"
                  required
                  value={montoGasto}
                  onChange={(e) => setMontoGasto(e.target.value)}
                  placeholder="Ej. 45000"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--trigo)', fontSize: '1rem', fontWeight: '700' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra-dark)', display: 'block', marginBottom: '4px' }}>
                  Nota o Concepto:
                </label>
                <input 
                  type="text"
                  value={descripcionGasto}
                  onChange={(e) => setDescripcionGasto(e.target.value)}
                  placeholder={tipoGasto === 'PAGO_EMPLEADO' ? 'Ej. Jornal turno tarde' : 'Ej. Compra de 2 bolsas de hielo'}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalGastoAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" disabled={guardandoGasto} className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                  {guardandoGasto ? 'Guardando...' : 'Registrar Salida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN CIERRE DE TURNO */}
      {modalCierreAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)', marginBottom: '10px' }}>
              ¿Cerrar Turno del Día?
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.88rem', marginBottom: '18px', lineHeight: 1.5 }}>
              Efectivo Esperado en Caja: <strong>{formatCOP(efectivoEsperado)}</strong><br />
              Total Ingresos: <strong>{formatCOP(cierreCaja?.totalRecaudado)}</strong><br />
              Total Egresos Pagados: <strong>{formatCOP(cierreCaja?.totalEgresos)}</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalCierreAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Cancelar</button>
              <button type="button" onClick={handleConfirmarCierreTurno} className="btn btn-trigo" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
