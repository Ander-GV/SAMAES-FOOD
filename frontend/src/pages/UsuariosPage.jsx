import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Plus, KeyRound, Copy, CheckCircle, ShieldAlert, AlertCircle, 
  Trash2, Edit2, ShieldCheck, UserCheck, RefreshCw, Eye, Bike, Utensils, 
  ChefHat, CreditCard, Search, UserX, ToggleLeft, ToggleRight, Lock, 
  Unlock, Phone, Mail, FileText, Check, Shield, Tag, Layers, Info, X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const UsuariosPage = () => {
  const { isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pestañaActiva, setPestañaActiva] = useState('PERSONAL'); // 'PERSONAL' | 'ROLES'

  // Modales de Empleados
  const [modalEmpleadoAbierto, setModalEmpleadoAbierto] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [restablecerItem, setRestablecerItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);

  // Modales de Roles
  const [modalRolAbierto, setModalRolAbierto] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [deletingRol, setDeletingRol] = useState(null);

  // Form State Empleado
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documento, setDocumento] = useState('');
  const [roleId, setRoleId] = useState('');
  const [tieneAccesoLogin, setTieneAccesoLogin] = useState(false);
  const [codigoEmpleadoInput, setCodigoEmpleadoInput] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  // Form State Rol
  const [rolNombre, setRolNombre] = useState('');
  const [rolDescripcion, setRolDescripcion] = useState('');

  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');

  // Modal de credenciales generadas
  const [credencialesGeneradas, setCredencialesGeneradas] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [resUsers, resEmp, resRoles] = await Promise.all([
        api.get('/usuarios'),
        api.get('/empleados'),
        api.get('/roles')
      ]);
      setUsuarios(resUsers.data || []);
      setEmpleados(resEmp.data || []);
      setRoles(resRoles.data || []);

      if (resRoles.data && resRoles.data.length > 0 && !roleId) {
        const defaultRole = resRoles.data.find(r => r.nombre === 'CAJERO') || resRoles.data[0];
        setRoleId(defaultRole.id.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar la lista de empleados, usuarios y roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin()) {
      loadData();
    }
  }, [isAdmin]);

  // Obtener prefijo de código según el nombre del rol
  const getRolePrefix = (nombreDelRol = '') => {
    const nombreUpper = nombreDelRol.toUpperCase();
    if (nombreUpper.includes('ADMIN')) return 'ADM';
    if (nombreUpper.includes('CAJ')) return 'CAJ';
    if (nombreUpper.includes('DOMICILIARIO') || nombreUpper.includes('DOMICILIO')) return 'DOM';
    if (nombreUpper.includes('MESER')) return 'MES';
    if (nombreUpper.includes('COCIN')) return 'COC';
    if (nombreUpper.includes('BAR')) return 'BAR';
    if (nombreUpper.includes('SUPERVISOR')) return 'SUP';
    return nombreUpper.replace(/[^A-Z]/g, '').substring(0, 3) || 'EMP';
  };

  // Consolidar lista de empleados con sus cuentas de usuario (100% libre de duplicados)
  const listaConsolidada = useMemo(() => {
    const mapUsuariosPorEmpId = new Map();
    const mapUsuariosPorDoc = new Map();
    const mapUsuariosPorEmail = new Map();
    const mapUsuariosPorCodigo = new Map();

    usuarios.forEach(u => {
      if (u.empleados && u.empleados.id != null) {
        mapUsuariosPorEmpId.set(String(u.empleados.id), u);
      }
      if (u.empleados?.documento) {
        mapUsuariosPorDoc.set(String(u.empleados.documento).trim().toLowerCase(), u);
      }
      if (u.empleados?.email) {
        mapUsuariosPorEmail.set(String(u.empleados.email).trim().toLowerCase(), u);
      }
      if (u.codigoEmpleado) {
        mapUsuariosPorCodigo.set(String(u.codigoEmpleado).trim().toLowerCase(), u);
      }
    });

    const resultado = [];
    const usuariosAsignadosIds = new Set();
    const empleadosProcesadosIds = new Set();

    // 1. Procesar todos los empleados de la tabla empleados
    empleados.forEach(emp => {
      const empIdStr = String(emp.id);
      empleadosProcesadosIds.add(empIdStr);

      let usuarioAsociado = mapUsuariosPorEmpId.get(empIdStr);
      
      if (!usuarioAsociado && emp.documento) {
        usuarioAsociado = mapUsuariosPorDoc.get(String(emp.documento).trim().toLowerCase());
      }
      if (!usuarioAsociado && emp.email) {
        usuarioAsociado = mapUsuariosPorEmail.get(String(emp.email).trim().toLowerCase());
      }
      if (!usuarioAsociado) {
        usuarioAsociado = usuarios.find(u => 
          (u.empleados && String(u.empleados.id) === empIdStr) ||
          (u.empleados && u.empleados.nombre?.toLowerCase() === emp.nombre?.toLowerCase() && u.empleados.apellido?.toLowerCase() === emp.apellido?.toLowerCase())
        );
      }

      if (usuarioAsociado) {
        usuariosAsignadosIds.add(String(usuarioAsociado.id));
      }

      const rolNombre = usuarioAsociado?.roles?.nombre || usuarioAsociado?.role || emp.cargo || 'DOMICILIARIO';
      
      resultado.push({
        empleadoId: emp.id,
        usuarioId: usuarioAsociado?.id || null,
        nombre: emp.nombre || '',
        apellido: emp.apellido || '',
        email: emp.email || (usuarioAsociado?.empleados?.email || ''),
        telefono: emp.telefono || (usuarioAsociado?.empleados?.telefono || ''),
        documento: emp.documento || (usuarioAsociado?.empleados?.documento || ''),
        activo: emp.activo !== false,
        tieneLogin: !!usuarioAsociado,
        codigoEmpleado: usuarioAsociado?.codigoEmpleado || null,
        rolId: usuarioAsociado?.roles?.id || null,
        rolNombre: rolNombre,
        rawEmpleado: emp,
        rawUsuario: usuarioAsociado || null
      });
    });

    // 2. Añadir únicamente usuarios que no correspondan a ningún empleado ya registrado
    usuarios.forEach(u => {
      const uIdStr = String(u.id);
      const empIdStr = u.empleados?.id != null ? String(u.empleados.id) : null;

      // Si este usuario ya se asoció a un empleado en el paso 1, no lo duplicamos
      if (usuariosAsignadosIds.has(uIdStr)) {
        return;
      }
      if (empIdStr && (empleadosProcesadosIds.has(empIdStr) || mapUsuariosPorEmpId.has(empIdStr))) {
        return;
      }
      if (u.empleados?.documento && empleados.some(e => String(e.documento).trim().toLowerCase() === String(u.empleados.documento).trim().toLowerCase())) {
        return;
      }
      if (u.empleados?.email && empleados.some(e => String(e.email).trim().toLowerCase() === String(u.empleados.email).trim().toLowerCase())) {
        return;
      }

      usuariosAsignadosIds.add(uIdStr);

      resultado.push({
        empleadoId: u.empleados?.id || null,
        usuarioId: u.id,
        nombre: u.nombreEmpleado || u.empleados?.nombre || 'Usuario SAMAES',
        apellido: u.empleados?.apellido || '',
        email: u.empleados?.email || '',
        telefono: u.empleados?.telefono || '',
        documento: u.empleados?.documento || '',
        activo: true,
        tieneLogin: true,
        codigoEmpleado: u.codigoEmpleado,
        rolId: u.roles?.id || null,
        rolNombre: u.roles?.nombre || u.role || 'CAJERO',
        rawEmpleado: u.empleados || null,
        rawUsuario: u
      });
    });

    return resultado;
  }, [empleados, usuarios]);


  // Conteo de empleados por rol
  const conteoPorRol = useMemo(() => {
    const mapa = {};
    listaConsolidada.forEach(item => {
      const rol = (item.rolNombre || 'OTRO').toUpperCase();
      mapa[rol] = (mapa[rol] || 0) + 1;
    });
    return mapa;
  }, [listaConsolidada]);

  // Filtrado de la lista de personal
  const listaFiltrada = useMemo(() => {
    return listaConsolidada.filter(item => {
      const texto = busqueda.toLowerCase().trim();
      const matchTexto = !texto || 
        item.nombre.toLowerCase().includes(texto) ||
        item.apellido.toLowerCase().includes(texto) ||
        (item.telefono && item.telefono.includes(texto)) ||
        (item.documento && item.documento.includes(texto)) ||
        (item.codigoEmpleado && item.codigoEmpleado.toLowerCase().includes(texto)) ||
        (item.rolNombre && item.rolNombre.toLowerCase().includes(texto));

      if (!matchTexto) return false;

      // Filtro de inactivos
      if (filtroRol === 'INACTIVOS') return item.activo === false;
      if (item.activo === false) return false; // Ocultar inactivos en listas regulares

      if (filtroRol === 'TODOS') return true;
      if (filtroRol === 'CON_LOGIN') return item.tieneLogin;
      if (filtroRol === 'SIN_LOGIN') return !item.tieneLogin;
      return item.rolNombre.toUpperCase() === filtroRol.toUpperCase();
    });
  }, [listaConsolidada, busqueda, filtroRol]);

  // ================= ACCIONES EMPLEADOS =================
  const abrirModalCrearEmpleado = () => {
    setEditingItem(null);
    setNombre('');
    setApellido('');
    setEmail('');
    setTelefono('');
    setDocumento('');
    
    const rolDefecto = roles.find(r => r.nombre === 'DOMICILIARIO') || roles[0] || { id: 2, nombre: 'CAJERO' };
    const rId = rolDefecto.id?.toString() || '2';
    setRoleId(rId);

    const necesitaLogin = rolDefecto.nombre === 'ADMINISTRADOR' || rolDefecto.nombre === 'CAJERO';
    setTieneAccesoLogin(necesitaLogin);

    const prefijo = getRolePrefix(rolDefecto.nombre);
    setCodigoEmpleadoInput(`${prefijo}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustomPassword('');
    setMensaje('');
    setError('');
    setModalEmpleadoAbierto(true);
  };

  const abrirModalEditarEmpleado = (item) => {
    setEditingItem(item);
    setNombre(item.nombre || '');
    setApellido(item.apellido || '');
    setEmail(item.email || '');
    setTelefono(item.telefono || '');
    setDocumento(item.documento || '');

    const rolMatch = roles.find(r => 
      (item.rolId && r.id === item.rolId) || 
      (item.rolNombre && r.nombre.toUpperCase() === item.rolNombre.toUpperCase())
    ) || roles[0];

    const rId = rolMatch?.id?.toString() || '2';
    setRoleId(rId);
    setTieneAccesoLogin(item.tieneLogin);
    setCodigoEmpleadoInput(item.codigoEmpleado || `${getRolePrefix(rolMatch?.nombre)}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustomPassword('');
    setMensaje('');
    setError('');
    setModalEmpleadoAbierto(true);
  };

  const abrirModalRestablecer = (item) => {
    setRestablecerItem(item);
    const prefijo = getRolePrefix(item.rolNombre);
    setCodigoEmpleadoInput(item.codigoEmpleado || `${prefijo}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustomPassword('');
    setError('');
  };

  const handleRoleSelectChange = (newRoleId) => {
    setRoleId(newRoleId);
    const rolObj = roles.find(r => r.id.toString() === newRoleId.toString());
    const rolNombreVal = rolObj ? rolObj.nombre : '';
    
    if (!editingItem) {
      const esAdminOCajero = rolNombreVal === 'ADMINISTRADOR' || rolNombreVal === 'CAJERO';
      setTieneAccesoLogin(esAdminOCajero);
      const prefijo = getRolePrefix(rolNombreVal);
      setCodigoEmpleadoInput(`${prefijo}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleCrearOActualizarEmpleado = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del empleado es obligatorio.');
      return;
    }

    if (!telefono.trim()) {
      setError('El teléfono del empleado es obligatorio.');
      return;
    }

    if (tieneAccesoLogin && !codigoEmpleadoInput.trim()) {
      setError('El código de empleado (login) es obligatorio para usuarios con acceso al sistema.');
      return;
    }

    const rolObj = roles.find(r => r.id.toString() === roleId.toString()) || { id: 2, nombre: 'CAJERO' };
    const apellidoFinal = apellido.trim() || 'SAMAES';
    const emailFinal = email.trim() || (tieneAccesoLogin ? `${codigoEmpleadoInput.trim().toLowerCase()}@samaesfood.com` : '');
    const passwordFinal = customPassword.trim() || (editingItem ? '' : `Samaes${Math.floor(1000 + Math.random() * 9000)}!`);

    try {
      if (editingItem) {
        const empId = editingItem.empleadoId || editingItem.usuarioId;
        
        let resEmpData = editingItem.rawEmpleado;
        if (empId) {
          const payloadEmp = {
            id: empId,
            nombre: nombre.trim(),
            apellido: apellidoFinal,
            email: emailFinal,
            telefono: telefono.trim(),
            documento: documento.trim() || '',
            cargo: rolObj.nombre,
            activo: true
          };
          const resEmp = await api.put(`/empleados/${empId}`, payloadEmp);
          resEmpData = resEmp.data;
        }

        if (tieneAccesoLogin) {
          if (editingItem.usuarioId) {
            const payloadUser = {
              id: editingItem.usuarioId,
              codigoEmpleado: codigoEmpleadoInput.trim(),
              password: passwordFinal || null,
              roles: { id: parseInt(roleId) },
              empleados: resEmpData
            };
            await api.put(`/usuarios/${editingItem.usuarioId}`, payloadUser);
          } else {
            const payloadUser = {
              codigoEmpleado: codigoEmpleadoInput.trim(),
              password: passwordFinal || `Samaes${Math.floor(1000 + Math.random() * 9000)}!`,
              roles: { id: parseInt(roleId) },
              empleados: resEmpData
            };
            await api.post('/usuarios', payloadUser);

            setCredencialesGeneradas({
              nombre: `${nombre.trim()} ${apellidoFinal}`,
              codigoEmpleado: codigoEmpleadoInput.trim(),
              password: payloadUser.password,
              rol: rolObj.nombre,
              esRestablecimiento: false
            });
          }
        }

        setMensaje(`¡Datos del empleado "${nombre.trim()}" actualizados con éxito!`);
        setModalEmpleadoAbierto(false);
      } else {
        const payloadEmpleado = {
          nombre: nombre.trim(),
          apellido: apellidoFinal,
          email: emailFinal,
          telefono: telefono.trim(),
          documento: documento.trim() || '',
          cargo: rolObj.nombre,
          activo: true
        };

        const resEmp = await api.post('/empleados', payloadEmpleado);
        const empCreado = resEmp.data;

        if (tieneAccesoLogin) {
          const payloadUsuario = {
            codigoEmpleado: codigoEmpleadoInput.trim(),
            password: passwordFinal,
            roles: { id: parseInt(roleId) },
            empleados: empCreado
          };

          await api.post('/usuarios', payloadUsuario);

          setCredencialesGeneradas({
            nombre: `${nombre.trim()} ${apellidoFinal}`,
            codigoEmpleado: codigoEmpleadoInput.trim(),
            password: passwordFinal,
            rol: rolObj.nombre,
            esRestablecimiento: false
          });
        } else {
          setMensaje(`¡Empleado "${nombre.trim()}" registrado exitosamente como ${rolObj.nombre}!`);
        }

        setModalEmpleadoAbierto(false);
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      loadData();
    } catch (err) {
      console.error('Error guardando empleado/usuario:', err);
      setError(err.response?.data?.message || 'Error al guardar los datos.');
    }
  };

  const handleRestablecerOCrearClave = async (e) => {
    e.preventDefault();
    if (!restablecerItem) return;
    setError('');

    const passwordFinal = customPassword.trim() || `Samaes${Math.floor(1000 + Math.random() * 9000)}!`;
    const rolObj = roles.find(r => r.nombre.toUpperCase() === restablecerItem.rolNombre.toUpperCase()) || roles[0] || { id: 2, nombre: 'CAJERO' };

    try {
      if (restablecerItem.usuarioId) {
        const payloadUpdate = {
          id: restablecerItem.usuarioId,
          codigoEmpleado: codigoEmpleadoInput.trim(),
          password: passwordFinal,
          roles: { id: restablecerItem.rolId || rolObj.id || 2 },
          empleados: restablecerItem.rawEmpleado || { id: restablecerItem.empleadoId }
        };

        await api.put(`/usuarios/${restablecerItem.usuarioId}`, payloadUpdate);
      } else {
        const payloadNuevo = {
          codigoEmpleado: codigoEmpleadoInput.trim(),
          password: passwordFinal,
          roles: { id: rolObj.id || 2 },
          empleados: restablecerItem.rawEmpleado || { id: restablecerItem.empleadoId }
        };

        await api.post('/usuarios', payloadNuevo);
      }

      setCredencialesGeneradas({
        nombre: `${restablecerItem.nombre} ${restablecerItem.apellido || ''}`.trim(),
        codigoEmpleado: codigoEmpleadoInput.trim(),
        password: passwordFinal,
        rol: restablecerItem.rolNombre,
        esRestablecimiento: !!restablecerItem.usuarioId
      });

      setRestablecerItem(null);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      loadData();
    } catch (err) {
      console.error(err);
      setError('Error al procesar las credenciales de acceso.');
    }
  };

  const copiarCredenciales = () => {
    if (!credencialesGeneradas) return;
    const text = `SAMAES FOOD Credenciales de Acceso:\nEmpleado: ${credencialesGeneradas.nombre}\nRol: ${credencialesGeneradas.rol}\nCódigo de Empleado (Login): ${credencialesGeneradas.codigoEmpleado}\nContraseña: ${credencialesGeneradas.password}`;
    navigator.clipboard.writeText(text);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const confirmarEliminarEmpleado = async () => {
    if (!deletingItem) return;
    setError('');
    try {
      if (deletingItem.empleadoId) {
        await api.delete(`/empleados/${deletingItem.empleadoId}`);
      } else if (deletingItem.usuarioId) {
        await api.delete(`/usuarios/${deletingItem.usuarioId}`);
      }
      setMensaje(`¡Registro "${deletingItem.nombre}" inactivado correctamente!`);
      setDeletingItem(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'No se pudo inhabilitar este registro.');
      setDeletingItem(null);
    }
  };

  // ================= ACCIONES ROLES =================
  const abrirModalCrearRol = () => {
    setEditingRol(null);
    setRolNombre('');
    setRolDescripcion('');
    setMensaje('');
    setError('');
    setModalRolAbierto(true);
  };

  const abrirModalEditarRol = (r) => {
    setEditingRol(r);
    setRolNombre(r.nombre);
    setRolDescripcion(r.descripcionRol || r.descripcion || '');
    setMensaje('');
    setError('');
    setModalRolAbierto(true);
  };

  const handleCrearOActualizarRol = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    const nombreLimpio = rolNombre.trim().toUpperCase();
    const descLimpia = rolDescripcion.trim();

    if (!nombreLimpio) {
      setError('El nombre del rol es obligatorio.');
      return;
    }

    if (!descLimpia) {
      setError('La descripción de las funciones del rol es obligatoria.');
      return;
    }

    try {
      if (editingRol) {
        const payload = {
          id: editingRol.id,
          nombre: nombreLimpio,
          descripcionRol: descLimpia
        };
        await api.put(`/roles/${editingRol.id}`, payload);
        setMensaje(`¡Rol "${nombreLimpio}" actualizado exitosamente!`);
      } else {
        const payload = {
          nombre: nombreLimpio,
          descripcionRol: descLimpia
        };
        const res = await api.post('/roles', payload);
        setMensaje(`¡Nuevo rol "${nombreLimpio}" registrado con éxito!`);
        if (res.data?.id) {
          setRoleId(res.data.id.toString());
        }
      }

      setModalRolAbierto(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      loadData();
    } catch (err) {
      console.error('Error guardando rol:', err);
      setError(err.response?.data?.message || 'Error al guardar el rol. Verifica que no exista un rol con ese nombre.');
    }
  };

  const confirmarEliminarRol = async () => {
    if (!deletingRol) return;
    try {
      await api.delete(`/roles/${deletingRol.id}`);
      setMensaje(`¡Rol "${deletingRol.nombre}" eliminado correctamente!`);
      setDeletingRol(null);
      loadData();
    } catch (err) {
      console.error('Error eliminando rol:', err);
      setError('No se puede eliminar este rol porque está actualmente asignado a empleados o usuarios.');
      setDeletingRol(null);
    }
  };

  // Renderizar icono según rol
  const renderRolIcon = (nombreDelRol = '', size = 15) => {
    const upper = (nombreDelRol || '').toUpperCase();
    if (upper.includes('ADMIN')) return <ShieldCheck size={size} color="#92400E" />;
    if (upper.includes('CAJ')) return <CreditCard size={size} color="#065F46" />;
    if (upper.includes('DOMICILIARIO') || upper.includes('DOMICILIO')) return <Bike size={size} color="#1E40AF" />;
    if (upper.includes('MESER')) return <Utensils size={size} color="#B45309" />;
    if (upper.includes('COCIN')) return <ChefHat size={size} color="#991B1B" />;
    return <Tag size={size} color="var(--verde-piedra)" />;
  };

  // Renderizar badge según rol
  const renderRolBadge = (nombreDelRol = '') => {
    const upper = (nombreDelRol || '').toUpperCase();
    let bg = '#E0E7FF';
    let color = '#3730A3';
    let border = '#C7D2FE';

    if (upper.includes('ADMIN')) {
      bg = 'var(--trigo-light)';
      color = 'var(--trigo-dark)';
      border = 'var(--trigo)';
    } else if (upper.includes('CAJ')) {
      bg = '#D1FAE5';
      color = '#065F46';
      border = '#A7F3D0';
    } else if (upper.includes('DOMICILIARIO') || upper.includes('DOMICILIO')) {
      bg = '#DBEAFE';
      color = '#1E40AF';
      border = '#BFDBFE';
    } else if (upper.includes('MESER')) {
      bg = '#FEF3C7';
      color = '#92400E';
      border = '#FDE68A';
    } else if (upper.includes('COCIN')) {
      bg = '#FEE2E2';
      color = '#991B1B';
      border = '#FECACA';
    }

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: '800',
        letterSpacing: '0.02em'
      }}>
        {renderRolIcon(nombreDelRol, 13)}
        {nombreDelRol}
      </span>
    );
  };

  if (!isAdmin()) {
    return (
      <div style={{ backgroundColor: 'var(--blanco-arena)', minHeight: 'calc(100vh - 70px)', padding: '60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#FEE2E2', padding: '32px', borderRadius: 'var(--radius-lg)', color: '#991B1B' }}>
          <ShieldAlert size={48} style={{ marginBottom: '16px' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ marginTop: '8px' }}>La gestión de personal y roles está restringida al perfil ADMINISTRADOR.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: 'calc(100vh - 70px)', width: '100%', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* ENCABEZADO */}
        <div className="page-header">
          <div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={28} color="var(--verde-piedra)" /> Personal & Roles
            </h2>
            <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem', marginTop: '2px' }}>
              Administra nómina, define cargos a tu medida y asigna accesos al sistema POS.
            </p>
          </div>

          <div className="page-header-actions">
            <button 
              onClick={abrirModalCrearRol} 
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <Tag size={15} /> + Nuevo Cargo
            </button>
            <button 
              onClick={abrirModalCrearEmpleado} 
              className="btn btn-trigo" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Nuevo Empleado
            </button>
          </div>
        </div>

        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid var(--blanco-arena-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
          <button
            onClick={() => setPestañaActiva('PERSONAL')}
            className={`btn ${pestañaActiva === 'PERSONAL' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              fontWeight: '700',
              fontSize: '0.85rem',
              padding: '8px 14px',
              whiteSpace: 'nowrap',
              minHeight: '36px'
            }}
          >
            <Users size={16} /> Empleados & Usuarios ({listaConsolidada.length})
          </button>
          <button
            onClick={() => setPestañaActiva('ROLES')}
            className={`btn ${pestañaActiva === 'ROLES' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              fontWeight: '700',
              fontSize: '0.85rem',
              padding: '8px 14px',
              whiteSpace: 'nowrap',
              minHeight: '36px'
            }}
          >
            <Shield size={16} /> Roles & Cargos ({roles.length})
          </button>
        </div>

        {mensaje && (
          <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '14px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
            <CheckCircle size={20} /> {mensaje}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '14px 18px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* ================= PESTAÑA 1: EMPLEADOS & USUARIOS ================= */}
        {pestañaActiva === 'PERSONAL' && (
          <>
            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div style={{
              backgroundColor: 'var(--blanco-arena-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 24px',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid rgba(20,56,44,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              {/* Input de Búsqueda */}
              <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--texto-secundario)' }} />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, teléfono, rol o código..."
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--blanco-arena-subtle)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#FFF'
                  }}
                />
              </div>

              {/* Botones de Filtro Rápido */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'TODOS', label: 'Todos' },
                  { id: 'CON_LOGIN', label: '🔑 Con Login' },
                  { id: 'SIN_LOGIN', label: '📋 Solo Personal' },
                  ...roles.map(r => ({ id: r.nombre, label: `${r.nombre} (${conteoPorRol[r.nombre.toUpperCase()] || 0})` })),
                  { id: 'INACTIVOS', label: '🛑 Inactivos' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFiltroRol(f.id)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '999px',
                      border: filtroRol === f.id ? '2px solid var(--verde-piedra)' : '1px solid rgba(20,56,44,0.15)',
                      backgroundColor: filtroRol === f.id ? 'var(--verde-piedra)' : '#FFF',
                      color: filtroRol === f.id ? '#FFF' : 'var(--verde-piedra-dark)',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TABLA CONSOLIDADA DE EMPLEADOS Y USUARIOS */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--texto-secundario)' }}>
                <RefreshCw size={32} className="spin" style={{ marginBottom: '12px', opacity: 0.7 }} />
                <div>Cargando nómina y usuarios...</div>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--verde-piedra-dark)', color: 'var(--blanco-arena)' }}>
                      <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)' }}>Empleado</th>
                      <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)' }}>Rol / Cargo</th>
                      <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)' }}>Contacto</th>
                      <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)' }}>Acceso al Sistema (POS / Login)</th>
                      <th style={{ padding: '16px 20px', fontFamily: 'var(--font-heading)', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaFiltrada.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--texto-secundario)' }}>
                          No se encontraron empleados con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      listaFiltrada.map((item, idx) => (
                        <tr 
                          key={item.empleadoId ? `emp-${item.empleadoId}` : `usr-${item.usuarioId}`} 
                          style={{ 
                            borderBottom: '1px solid var(--blanco-arena-subtle)',
                            backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(20,56,44,0.015)'
                          }}
                        >
                          {/* Nombre del Empleado */}
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: '700', fontSize: '1.02rem', color: 'var(--verde-piedra-dark)' }}>
                              {item.nombre} {item.apellido}
                            </div>
                            {item.documento && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FileText size={12} /> Doc: {item.documento}
                              </div>
                            )}
                          </td>

                          {/* Cargo / Rol */}
                          <td style={{ padding: '16px 20px' }}>
                            {renderRolBadge(item.rolNombre)}
                          </td>

                          {/* Contacto */}
                          <td style={{ padding: '16px 20px' }}>
                            {item.telefono ? (
                              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--verde-piedra)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Phone size={13} /> {item.telefono}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--texto-secundario)', fontSize: '0.8rem' }}>Sin teléfono</span>
                            )}
                            {item.email && (
                              <div style={{ fontSize: '0.78rem', color: 'var(--texto-secundario)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Mail size={12} /> {item.email}
                              </div>
                            )}
                          </td>

                          {/* Acceso al Sistema */}
                          <td style={{ padding: '16px 20px' }}>
                            {item.tieneLogin ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  backgroundColor: '#ECFDF5',
                                  color: '#065F46',
                                  border: '1px solid #A7F3D0',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.78rem',
                                  fontWeight: '700',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <Lock size={12} /> Código:
                                </span>
                                <code style={{
                                  backgroundColor: 'var(--blanco-arena-subtle)',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: '1.5px solid var(--trigo)',
                                  fontWeight: '800',
                                  fontSize: '0.95rem',
                                  color: 'var(--verde-piedra-dark)'
                                }}>
                                  {item.codigoEmpleado}
                                </code>
                              </div>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                backgroundColor: '#F3F4F6',
                                color: '#6B7280',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '0.78rem',
                                fontWeight: '600'
                              }}>
                                <Unlock size={13} /> Solo Personal (Sin Login)
                              </span>
                            )}
                          </td>

                          {/* Acciones */}
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button 
                                onClick={() => abrirModalEditarEmpleado(item)} 
                                className="btn btn-trigo" 
                                style={{ fontSize: '0.8rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Editar Datos del Empleado"
                              >
                                <Edit2 size={14} /> Editar
                              </button>

                              {item.tieneLogin ? (
                                <button 
                                  onClick={() => abrirModalRestablecer(item)} 
                                  className="btn btn-outline" 
                                  style={{ fontSize: '0.8rem', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  title="Restablecer contraseña"
                                >
                                  <KeyRound size={14} /> Clave
                                </button>
                              ) : (
                                <button 
                                  onClick={() => abrirModalRestablecer(item)} 
                                  style={{
                                    backgroundColor: '#EFF6FF',
                                    color: '#1D4ED8',
                                    border: '1px solid #BFDBFE',
                                    padding: '6px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Crear usuario para que este empleado pueda iniciar sesión"
                                >
                                  <Plus size={13} /> Asignar Login
                                </button>
                              )}

                              <button 
                                onClick={() => setDeletingItem(item)} 
                                style={{ border: 'none', background: '#FEE2E2', color: '#991B1B', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}
                                title="Inactivar registro"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ================= PESTAÑA 2: ROLES & CARGOS ================= */}
        {pestañaActiva === 'ROLES' && (
          <div>
            <div style={{
              backgroundColor: 'var(--blanco-arena-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid rgba(20,56,44,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={20} color="var(--trigo-dark)" /> Catálogo de Cargos & Funciones
                </h3>
                <p style={{ color: 'var(--texto-secundario)', fontSize: '0.88rem', marginTop: '4px' }}>
                  Crea todos los roles necesarios para tu restaurante (ej. Domiciliarios, Cocineros, Meseros, Barman, Cajeros, etc.).
                </p>
              </div>

              <button onClick={abrirModalCrearRol} className="btn btn-trigo" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                <Plus size={18} /> Crear Nuevo Rol / Cargo
              </button>
            </div>

            {/* GRILLA DE TARJETAS DE ROLES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {roles.map(r => {
                const totalAsignados = conteoPorRol[r.nombre.toUpperCase()] || 0;
                const esRolSistema = r.nombre === 'ADMINISTRADOR' || r.nombre === 'CAJERO';

                return (
                  <div 
                    key={r.id}
                    style={{
                      backgroundColor: 'var(--blanco-arena-card)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '24px',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1.5px solid rgba(20,56,44,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            backgroundColor: 'rgba(20,56,44,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {renderRolIcon(r.nombre, 20)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--verde-piedra-dark)' }}>
                              {r.nombre}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', fontWeight: '600' }}>
                              Prefijo: <code>{getRolePrefix(r.nombre)}-####</code>
                            </span>
                          </div>
                        </div>

                        <span style={{
                          backgroundColor: totalAsignados > 0 ? '#ECFDF5' : '#F3F4F6',
                          color: totalAsignados > 0 ? '#065F46' : '#6B7280',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '800'
                        }}>
                          {totalAsignados} {totalAsignados === 1 ? 'Empleado' : 'Empleados'}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--texto-secundario)', lineHeight: '1.45', marginBottom: '18px' }}>
                        {r.descripcionRol || r.descripcion || 'Sin descripción detallada de responsabilidades.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--blanco-arena-subtle)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--texto-secundario)' }}>
                        {esRolSistema ? '🔒 Rol del Sistema' : '✨ Rol Personalizado'}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => abrirModalEditarRol(r)}
                          className="btn btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Editar información del rol"
                        >
                          <Edit2 size={13} /> Editar
                        </button>
                        
                        {!esRolSistema && (
                          <button 
                            onClick={() => setDeletingRol(r)}
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '0.78rem'
                            }}
                            title="Eliminar cargo"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL CREAR / EDITAR EMPLEADO ================= */}
      {modalEmpleadoAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="var(--trigo-dark)" />
                {editingItem ? `Editar: ${editingItem.nombre}` : 'Registrar Nuevo Empleado'}
              </h3>
              <button onClick={() => setModalEmpleadoAbierto(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginBottom: '16px' }}>
              Completa los datos del trabajador y define si tendrá acceso al sistema con login.
            </p>

            <form onSubmit={handleCrearOActualizarEmpleado}>
              
              {/* Rol / Cargo */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--verde-piedra)' }}>
                    Rol / Cargo *
                  </label>
                  <button 
                    type="button"
                    onClick={() => { setModalEmpleadoAbierto(false); abrirModalCrearRol(); }}
                    style={{ background: 'none', border: 'none', color: 'var(--verde-piedra)', textDecoration: 'underline', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '700' }}
                  >
                    + Nuevo cargo
                  </button>
                </div>
                <select 
                  value={roleId} 
                  onChange={(e) => handleRoleSelectChange(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    padding: '9px 12px', 
                    borderRadius: 'var(--radius-sm)', 
                    border: '1.5px solid var(--verde-piedra)', 
                    marginTop: '4px', 
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFF'
                  }}
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nombre} {r.descripcionRol || r.descripcion ? `- ${r.descripcionRol || r.descripcion}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre y Teléfono */}
              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nombre *</label>
                  <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Carlos" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Teléfono / Celular *</label>
                  <input type="text" required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 3001234567" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
              </div>

              {/* Apellido y Documento */}
              <div className="form-grid-2col">
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Apellido <span style={{ fontWeight: '400', opacity: 0.7 }}>(Opcional)</span></label>
                  <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Ej. Gómez" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Documento / CC <span style={{ fontWeight: '400', opacity: 0.7 }}>(Opcional)</span></label>
                  <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Ej. 1043123456" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
                </div>
              </div>

              {/* Correo */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Correo Electrónico <span style={{ fontWeight: '400', opacity: 0.7 }}>(Opcional)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej. empleado@samaesfood.com" style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} />
              </div>

              {/* SWITCH / TOGGLE: ¿TENDRÁ ACCESO AL SISTEMA CON LOGIN? */}
              <div style={{
                backgroundColor: tieneAccesoLogin ? 'rgba(217, 169, 79, 0.12)' : 'var(--blanco-arena-subtle)',
                border: tieneAccesoLogin ? '1.5px solid var(--trigo-dark)' : '1px solid rgba(20,56,44,0.1)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                transition: 'all 0.2s ease'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0,
                      backgroundColor: tieneAccesoLogin ? 'var(--verde-piedra)' : '#FFF',
                      border: tieneAccesoLogin ? 'none' : '2px solid var(--texto-secundario)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFF'
                    }}>
                      {tieneAccesoLogin && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--verde-piedra-dark)', fontSize: '0.88rem' }}>
                        ¿Habilitar acceso al sistema (Login)?
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--texto-secundario)' }}>
                        {tieneAccesoLogin 
                          ? 'Generará credenciales para ingresar al POS o Administración.'
                          : 'Para Domiciliarios, Meseros y Cocineros sin login.'}
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={tieneAccesoLogin}
                    onChange={(e) => setTieneAccesoLogin(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                </label>

                {tieneAccesoLogin ? (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed var(--trigo-dark)' }}>
                    <div className="form-grid-2col">
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--verde-piedra-dark)' }}>
                          Código Empleado *
                        </label>
                        <input 
                          type="text" 
                          required 
                          value={codigoEmpleadoInput} 
                          onChange={(e) => setCodigoEmpleadoInput(e.target.value)} 
                          placeholder="Ej. DOM-1024" 
                          style={{ 
                            width: '100%', 
                            padding: '8px 10px', 
                            borderRadius: 'var(--radius-sm)', 
                            border: '1.5px solid var(--trigo-dark)', 
                            marginTop: '4px',
                            fontWeight: '800',
                            color: 'var(--verde-piedra-dark)',
                            backgroundColor: '#FFF',
                            fontSize: '0.88rem'
                          }} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--verde-piedra-dark)' }}>
                          {editingItem ? 'Nueva Contraseña' : 'Contraseña'}
                        </label>
                        <input 
                          type="text" 
                          value={customPassword} 
                          onChange={(e) => setCustomPassword(e.target.value)} 
                          placeholder={editingItem ? 'Conservar actual' : 'Auto-generada'} 
                          style={{ 
                            width: '100%', 
                            padding: '8px 10px', 
                            borderRadius: 'var(--radius-sm)', 
                            border: '1px solid var(--blanco-arena-subtle)', 
                            marginTop: '4px',
                            backgroundColor: '#FFF',
                            fontSize: '0.88rem'
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#065F46', backgroundColor: '#ECFDF5', padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={13} /> Personal operativo sin usuario de sistema.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalEmpleadoAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                  {editingItem ? 'Guardar Cambios' : (tieneAccesoLogin ? 'Guardar con Login' : 'Guardar Empleado')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CREAR / EDITAR ROL ================= */}
      {modalRolAbierto && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={20} color="var(--trigo-dark)" />
                {editingRol ? `Editar Rol: ${editingRol.nombre}` : 'Registrar Nuevo Rol'}
              </h3>
              <button onClick={() => setModalRolAbierto(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginBottom: '16px' }}>
              Define un nuevo cargo para tu restaurante.
            </p>

            <form onSubmit={handleCrearOActualizarRol}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--verde-piedra-dark)' }}>
                  Nombre del Cargo / Rol *
                </label>
                <input 
                  type="text"
                  required
                  value={rolNombre}
                  onChange={(e) => setRolNombre(e.target.value)}
                  placeholder="Ej. DOMICILIARIO, BARMAN"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--verde-piedra)',
                    marginTop: '4px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    backgroundColor: '#FFF',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--verde-piedra-dark)' }}>
                  Descripción de Funciones *
                </label>
                <textarea 
                  required
                  rows={3}
                  value={rolDescripcion}
                  onChange={(e) => setRolDescripcion(e.target.value)}
                  placeholder="Ej. Encargado de entregas y pedidos a domicilio."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--blanco-arena-subtle)',
                    marginTop: '4px',
                    fontSize: '0.85rem',
                    backgroundColor: '#FFF',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setModalRolAbierto(false)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                  {editingRol ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL RESTABLECER / ASIGNAR CREDENCIALES ================= */}
      {restablecerItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--verde-piedra-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="var(--trigo-dark)" /> 
                {restablecerItem.usuarioId ? 'Restablecer Clave' : 'Crear Acceso Login'}
              </h3>
              <button onClick={() => setRestablecerItem(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}>
                <X size={22} color="var(--texto-secundario)" />
              </button>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginBottom: '16px' }}>
              Empleado: <strong>{restablecerItem.nombre} {restablecerItem.apellido || ''}</strong> ({restablecerItem.rolNombre})
            </p>

            <form onSubmit={handleRestablecerOCrearClave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Código de Empleado (Login)</label>
                <input 
                  type="text" 
                  required 
                  value={codigoEmpleadoInput} 
                  onChange={(e) => setCodigoEmpleadoInput(e.target.value)} 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--trigo)', marginTop: '4px', fontWeight: '700', fontSize: '0.9rem' }} 
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--verde-piedra)' }}>Nueva Contraseña *</label>
                <input 
                  type="text" 
                  required
                  value={customPassword} 
                  onChange={(e) => setCustomPassword(e.target.value)} 
                  placeholder="Ej. Samaes2026!" 
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--blanco-arena-subtle)', marginTop: '4px', fontSize: '0.9rem' }} 
                />
                <button 
                  type="button" 
                  onClick={() => setCustomPassword(`Samaes${Math.floor(1000 + Math.random() * 9000)}!`)}
                  style={{ background: 'none', border: 'none', color: 'var(--verde-piedra)', textDecoration: 'underline', fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px' }}
                >
                  🎲 Generar contraseña aleatoria
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setRestablecerItem(null)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>Cancelar</button>
                <button type="submit" className="btn btn-trigo" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                  {restablecerItem.usuarioId ? 'Actualizar' : 'Crear Acceso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL MOSTRAR CREDENCIALES GENERADAS ================= */}
      {credencialesGeneradas && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <UserCheck size={42} color="var(--verde-piedra)" style={{ marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.3rem', color: 'var(--verde-piedra-dark)', marginBottom: '6px' }}>
              {credencialesGeneradas.esRestablecimiento ? '¡Contraseña Actualizada!' : '¡Credenciales Asignadas!'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--texto-secundario)', marginBottom: '16px' }}>
              Copia las credenciales para el empleado.
            </p>

            <div style={{ backgroundColor: 'var(--blanco-arena-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '18px', border: '1.5px dashed var(--trigo-dark)' }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', fontWeight: '700' }}>EMPLEADO:</span>
                <div style={{ fontWeight: '700', color: 'var(--verde-piedra-dark)', fontSize: '0.95rem' }}>{credencialesGeneradas.nombre} ({credencialesGeneradas.rol})</div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', fontWeight: '700' }}>CÓDIGO (LOGIN):</span>
                <div style={{ fontWeight: '800', color: 'var(--verde-piedra)', fontSize: '1.2rem', fontFamily: 'monospace' }}>{credencialesGeneradas.codigoEmpleado}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--texto-secundario)', fontWeight: '700' }}>CONTRASEÑA:</span>
                <div style={{ fontWeight: '800', color: '#991B1B', fontSize: '1.15rem', fontFamily: 'monospace' }}>{credencialesGeneradas.password}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={copiarCredenciales} className="btn btn-outline" style={{ padding: '8px 14px', fontWeight: '700', fontSize: '0.85rem' }}>
                <Copy size={14} /> {copiado ? '¡Copiado!' : 'Copiar'}
              </button>
              <button onClick={() => setCredencialesGeneradas(null)} className="btn btn-trigo" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CONFIRMACIÓN INACTIVAR EMPLEADO ================= */}
      {deletingItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', border: '3px solid #EF4444' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#991B1B', marginBottom: '8px' }}>
              ¿Inactivar a "{deletingItem.nombre}"?
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Se inactivará el registro preservando el historial de turnos, nómina y ventas pasadas.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDeletingItem(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Cancelar</button>
              <button type="button" onClick={confirmarEliminarEmpleado} className="btn btn-danger" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
                Sí, Inactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CONFIRMACIÓN ELIMINAR ROL ================= */}
      {deletingRol && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', border: '3px solid #EF4444' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#991B1B', marginBottom: '8px' }}>
              ¿Eliminar el Rol "{deletingRol.nombre}"?
            </h3>
            <p style={{ color: 'var(--texto-principal)', fontSize: '0.88rem', marginBottom: '20px' }}>
              Esta acción eliminará el cargo del catálogo del restaurante.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setDeletingRol(null)} className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>Cancelar</button>
              <button type="button" onClick={confirmarEliminarRol} className="btn btn-danger" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
