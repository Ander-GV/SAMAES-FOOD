package com.restaurante.api.integration;

import com.restaurante.api.dto.*;
import com.restaurante.api.entity.*;
import com.restaurante.api.enums.TipoDescuento;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.UsuariosMapper;
import com.restaurante.api.repository.*;
import com.restaurante.api.service.PedidosService;
import com.restaurante.api.service.ProductosService;
import com.restaurante.api.service.PromocionService;
import com.restaurante.api.service.UsuariosService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class InactividadYEstadosIntegrationTest {

    @Autowired
    private ProductosService productosService;
    @Autowired
    private ProductosRepository productosRepository;
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private EstadoDelProductoRepository estadoDelProductoRepository;

    @Autowired
    private UsuariosService usuariosService;
    @Autowired
    private UsuariosRepository usuariosRepository;
    @Autowired
    private EmpleadosRepository empleadosRepository;
    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private PromocionService promocionService;
    @Autowired
    private PromocionRepository promocionRepository;

    @Autowired
    private PedidosService pedidosService;
    @Autowired
    private PedidosRepository pedidosRepository;
    @Autowired
    private EstadoDelPedidoRepository estadoDelPedidoRepository;
    @Autowired
    private IngredientesRepository ingredientesRepository;
    @Autowired
    private IngredientesAndProductosRepository ingredientesAndProductosRepository;
    @Autowired
    private MovimientosDelInventarioRepository movimientosDelInventarioRepository;
    @Autowired
    private UnidadDeMedidaRepository unidadDeMedidaRepository;
    @Autowired
    private TipoDePedidosRepository tipoDePedidosRepository;

    private Categoria testCategoria;
    private EstadoDelProducto estadoDisponible;
    private EstadoDelProducto estadoInactivo;
    private Usuarios testUsuario;

    @BeforeEach
    void setupBaseData() {
        testCategoria = categoriaRepository.findAll().stream().findFirst().orElseGet(() -> {
            Categoria cat = new Categoria(null, "Comidas Rápidas Test", "Categoría de prueba", true);
            return categoriaRepository.save(cat);
        });

        estadoDisponible = estadoDelProductoRepository.findAll().stream()
                .filter(e -> "Disponible".equalsIgnoreCase(e.getNombre()))
                .findFirst()
                .orElseGet(() -> estadoDelProductoRepository.save(new EstadoDelProducto(null, "Disponible", "Disponible")));
        
        estadoInactivo = estadoDelProductoRepository.findAll().stream()
                .filter(e -> "Inactivo".equalsIgnoreCase(e.getNombre()))
                .findFirst()
                .orElseGet(() -> estadoDelProductoRepository.save(new EstadoDelProducto(null, "Inactivo", "Inactivo")));

        testUsuario = usuariosRepository.findAll().stream().findFirst().orElseGet(() -> {
            Roles rol = rolesRepository.findAll().stream().findFirst().orElseGet(() ->
                    rolesRepository.save(new Roles(null, "ADMINISTRADOR", "Admin"))
            );
            Empleados emp = empleadosRepository.save(new Empleados(null, "Admin", "Test", "admin@test.com", "1234", "1234", "ADMIN", true));
            return usuariosRepository.save(new Usuarios(null, "pass123", "AdminTest", emp, rol));
        });
    }

    @Test
    @DisplayName("PRUEBA CONJUNTA 1: Soft Delete de Producto verifica que el producto queda realmente en estado 'Inactivo'")
    void testProductoInactivacion_RealmenteInactivo() {
        // 1. Crear producto con estado activo / disponible
        ProductosRequestDTO requestDTO = new ProductosRequestDTO();
        requestDTO.setNombre("Super Combo Parrillero");
        requestDTO.setDescripcion("Combo de prueba");
        requestDTO.setPrecio(new BigDecimal("35000"));
        requestDTO.setCategoriaId(testCategoria.getId());

        EstadoDelProductoRequestDTO estDTO = new EstadoDelProductoRequestDTO();
        estDTO.setId(estadoDisponible.getId());
        requestDTO.setEstadoDelProducto(estDTO);

        ProductosResponseDTO creado = productosService.save(requestDTO);
        assertNotNull(creado.getId());

        // Verificar que está disponible
        Productos prodEnBd = productosRepository.findById(creado.getId()).orElseThrow();
        assertEquals("Disponible", prodEnBd.getEstadoDelProducto().getNombre());

        // 2. Ejecutar eliminación lógica (delete)
        productosService.delete(creado.getId());

        // 3. Verificar que el producto NO fue borrado físicamente y su estado es efectivamente INACTIVO
        Productos prodInactivo = productosRepository.findById(creado.getId()).orElseThrow();
        assertNotNull(prodInactivo, "El producto debe persistir para preservar el historial");
        assertNotNull(prodInactivo.getEstadoDelProducto(), "Debe tener un estado asignado");
        assertEquals("Inactivo", prodInactivo.getEstadoDelProducto().getNombre(), "El estado debe ser 'Inactivo'");
    }

    @Test
    @DisplayName("PRUEBA CONJUNTA 2: Inactivación de Usuario desactiva realmente al Empleado (activo = false)")
    void testUsuarioInactivacion_DesactivaEmpleado() {
        // 1. Crear empleado activo
        Empleados empleado = new Empleados(null, "Juan", "InactivoTest", "juan@test.com", "3001234567", "1020304050", "MESERO", true);
        empleado = empleadosRepository.save(empleado);
        assertTrue(empleado.isActivo(), "El empleado debe crearse con activo = true");

        Roles rol = rolesRepository.findAll().stream().findFirst().orElseThrow();

        // 2. Crear usuario vinculado al empleado
        Usuarios usuario = new Usuarios(null, "Pass12345*", "juan.test", empleado, rol);
        usuario = usuariosRepository.save(usuario);

        // 3. Eliminar / Inactivar el usuario
        usuariosService.delete(usuario.getId());

        // 4. Verificar directamente en base de datos que el empleado quedó con activo = false
        Empleados empleadoActualizado = empleadosRepository.findById(empleado.getId()).orElseThrow();
        assertFalse(empleadoActualizado.isActivo(), "El empleado debe quedar efectivamente inactivo (activo = false)");
    }

    @Test
    @DisplayName("PRUEBA CONJUNTA 3: Cupón de Promoción Inactivo es rechazado tanto en consulta como en pedidos")
    void testPromocionInactiva_RechazoEstricto() {
        // 1. Crear una promoción con activa = false
        Promocion promoInactiva = new Promocion();
        promoInactiva.setNombre("Promo Navideña Pasada");
        promoInactiva.setTipoDescuento(TipoDescuento.PORCENTAJE);
        promoInactiva.setValor(new BigDecimal("20.00"));
        promoInactiva.setActiva(false); // INACTIVA
        promoInactiva.setCodigoCupon("NAVIDAD_OFF");
        promoInactiva.setMontoMinimoPedido(new BigDecimal("10000"));
        promoInactiva = promocionRepository.save(promoInactiva);

        // 2. Intentar buscar por código de cupón -> debe lanzar excepción porque activa = false
        assertThrows(ResourceNotFoundException.class, () -> {
            promocionService.findByCodigoCupon("NAVIDAD_OFF");
        }, "Un cupón inactivo no debe ser encontrado por findByCodigoCuponAndActivaTrue");

        // 3. Intentar crear un pedido utilizando el cupón inactivo -> debe fallar con BusinessException
        PedidosRequestDTO pedidoDTO = new PedidosRequestDTO();
        pedidoDTO.setSubtotal(new BigDecimal("50000"));
        pedidoDTO.setTotal(new BigDecimal("50000"));
        pedidoDTO.setFechaInicio(LocalDateTime.now());
        pedidoDTO.setCodigoCupon("NAVIDAD_OFF");
        UsuariosRequestDTO userDTO = new UsuariosRequestDTO();
        userDTO.setId(testUsuario.getId());
        userDTO.setCodigoEmpleado(testUsuario.getCodigoEmpleado());
        pedidoDTO.setUsuario(userDTO);

        assertThrows(BusinessException.class, () -> {
            pedidosService.save(pedidoDTO);
        }, "Un pedido no debe permitir aplicar un cupón con activa = false");
    }

    @Test
    @DisplayName("PRUEBA CONJUNTA 4: Cupón con límite de usos máximos agotado no permite reutilización")
    void testPromocionLimiteUsos_BloqueaReutilizacion() {
        // 1. Crear promoción activa pero con límite de 1 solo uso
        Promocion promoUnica = new Promocion();
        promoUnica.setNombre("Cupón Flash Único");
        promoUnica.setTipoDescuento(TipoDescuento.MONTO_FIJO);
        promoUnica.setValor(new BigDecimal("5000.00"));
        promoUnica.setActiva(true);
        promoUnica.setCodigoCupon("FLASH1");
        promoUnica.setUsosMaximos(1);
        promoUnica.setUsosActuales(0);
        promoUnica = promocionRepository.save(promoUnica);

        // 2. Primer uso: debe funcionar y subir usosActuales a 1
        PromocionResponseDTO primerUso = promocionService.findByCodigoCupon("FLASH1");
        assertNotNull(primerUso);

        Promocion promoActualizada = promocionRepository.findById(promoUnica.getId()).orElseThrow();
        assertEquals(1, promoActualizada.getUsosActuales());

        // 3. Segundo uso: debe lanzar BusinessException por haber alcanzado los usos máximos
        assertThrows(BusinessException.class, () -> {
            promocionService.findByCodigoCupon("FLASH1");
        }, "Debe bloquear el uso cuando usosActuales >= usosMaximos");
    }

    @Test
    @DisplayName("PRUEBA CONJUNTA 5: Flujo Pedido -> Estado Pendiente no descuenta, Estado Completado descuenta inventario")
    void testFlujoPedidoInventario_Estados() {
        // 1. Crear Unidad de Medida e Ingrediente con 100 de stock
        UnidadDeMedida unidad = unidadDeMedidaRepository.findAll().stream().findFirst().orElseGet(() ->
                unidadDeMedidaRepository.save(new UnidadDeMedida(null, "Gramos", "g", BigDecimal.ONE, "PESO"))
        );

        Ingredientes ingrediente = new Ingredientes(null, "Carne Angus Test", 100, unidad);
        ingrediente = ingredientesRepository.save(ingrediente);

        // 2. Crear Producto
        Productos producto = new Productos();
        producto.setNombre("Hamburguesa Doble Test");
        producto.setDescripcion("Deliciosa hamburguesa");
        producto.setPrecio(new BigDecimal("30000"));
        producto.setCategoria(testCategoria);
        producto.setEstadoDelProducto(estadoDisponible);
        producto = productosRepository.save(producto);

        // 3. Crear Receta (requiere 20 unidades de carne por cada hamburguesa)
        IngredientesAndProductos receta = new IngredientesAndProductos(null, new BigDecimal("20"), ingrediente, producto);
        ingredientesAndProductosRepository.save(receta);

        EstadoDelPedido estadoPendiente = estadoDelPedidoRepository.findAll().stream()
                .filter(e -> "Pendiente".equalsIgnoreCase(e.getNombre()))
                .findFirst().orElseThrow();
        EstadoDelPedido estadoCompletado = estadoDelPedidoRepository.findAll().stream()
                .filter(e -> "Completado".equalsIgnoreCase(e.getNombre()))
                .findFirst().orElseThrow();
        TipoDePedidos tipoMesa = tipoDePedidosRepository.findAll().stream().findFirst().orElseThrow();

        // 4. Crear Pedido en estado 'Pendiente' con 2 hamburguesas (requerirá 40 unidades de carne)
        PedidosRequestDTO pedidoDTO = new PedidosRequestDTO();
        pedidoDTO.setFechaInicio(LocalDateTime.now());
        pedidoDTO.setSubtotal(new BigDecimal("60000"));
        pedidoDTO.setTotal(new BigDecimal("60000"));
        UsuariosRequestDTO userDTO = new UsuariosRequestDTO();
        userDTO.setId(testUsuario.getId());
        userDTO.setCodigoEmpleado(testUsuario.getCodigoEmpleado());
        pedidoDTO.setUsuario(userDTO);
        
        EstadoDelPedidoRequestDTO estPedDTO = new EstadoDelPedidoRequestDTO();
        estPedDTO.setId(estadoPendiente.getId());
        pedidoDTO.setEstadoPedido(estPedDTO);

        TipoDePedidosRequestDTO tipoPedDTO = new TipoDePedidosRequestDTO();
        tipoPedDTO.setId(tipoMesa.getId());
        pedidoDTO.setTipoPedido(tipoPedDTO);

        DetalleDelPedidoRequestDTO detDTO = new DetalleDelPedidoRequestDTO();
        detDTO.setProductoId(producto.getId());
        detDTO.setCantidad(2);
        detDTO.setPrecioUnitario(new BigDecimal("30000"));
        pedidoDTO.setDetalles(List.of(detDTO));

        PedidosResponseDTO pedidoCreado = pedidosService.save(pedidoDTO);
        assertNotNull(pedidoCreado.getId());

        // Verificar que en 'Pendiente' el stock SIGUE EN 100 (no se ha descontado prematuramente)
        Ingredientes ingPendiente = ingredientesRepository.findById(ingrediente.getId()).orElseThrow();
        assertEquals(100, ingPendiente.getStock(), "El stock no debe descontarse mientras el pedido esté pendiente");

        // 5. Actualizar el pedido a estado 'Completado'
        pedidoDTO.setEstadoPedido(new EstadoDelPedidoRequestDTO());
        pedidoDTO.getEstadoPedido().setId(estadoCompletado.getId());

        pedidosService.update(pedidoCreado.getId(), pedidoDTO);

        // 6. Verificar que en 'Completado' el stock bajó a 60 (100 - 2*20 = 60)
        Ingredientes ingCompletado = ingredientesRepository.findById(ingrediente.getId()).orElseThrow();
        assertEquals(60, ingCompletado.getStock(), "El stock debe haberse descontado exactamente 40 unidades (100 - 40 = 60)");

        // 7. Verificar que se registró el movimiento de salida
        boolean existeMovimiento = movimientosDelInventarioRepository.existsByPedidoId(pedidoCreado.getId());
        assertTrue(existeMovimiento, "Debe registrarse el movimiento de inventario para el pedido completado");
    }
}
