package com.restaurante.api.unit;

import com.restaurante.api.dto.DetalleDelPedidoRequestDTO;
import com.restaurante.api.dto.DetalleDelPedidoResponseDTO;
import com.restaurante.api.dto.PedidosRequestDTO;
import com.restaurante.api.dto.PedidosResponseDTO;
import com.restaurante.api.entity.*;
import com.restaurante.api.enums.TipoDescuento;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.mapper.DetalleDelPedidoMapper;
import com.restaurante.api.mapper.PedidosMapper;
import com.restaurante.api.repository.DetalleDelPedidoRepository;
import com.restaurante.api.repository.EstadoDelPedidoRepository;
import com.restaurante.api.repository.IngredientesAndProductosRepository;
import com.restaurante.api.repository.IngredientesRepository;
import com.restaurante.api.repository.MovimientosDelInventarioRepository;
import com.restaurante.api.repository.PedidosRepository;
import com.restaurante.api.repository.ProductosRepository;
import com.restaurante.api.repository.PromocionRepository;
import com.restaurante.api.repository.TipoDeMovimientoRepository;
import com.restaurante.api.repository.UsuariosRepository;
import com.restaurante.api.service.impl.PedidosServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidosServiceUnitTest {

    @Mock
    private PedidosRepository pedidosRepository;
    @Mock
    private PedidosMapper pedidosMapper;
    @Mock
    private PromocionRepository promocionRepository;
    @Mock
    private DetalleDelPedidoRepository detalleDelPedidoRepository;
    @Mock
    private DetalleDelPedidoMapper detalleDelPedidoMapper;
    @Mock
    private ProductosRepository productosRepository;
    @Mock
    private IngredientesAndProductosRepository ingredientesAndProductosRepository;
    @Mock
    private IngredientesRepository ingredientesRepository;
    @Mock
    private MovimientosDelInventarioRepository movimientosDelInventarioRepository;
    @Mock
    private TipoDeMovimientoRepository tipoDeMovimientoRepository;
    @Mock
    private EstadoDelPedidoRepository estadoDelPedidoRepository;
    @Mock
    private UsuariosRepository usuariosRepository;

    @InjectMocks
    private PedidosServiceImpl pedidosService;


    private Pedidos pedido;
    private Promocion promoActiva;
    private EstadoDelPedido estadoPendiente;
    private EstadoDelPedido estadoCompletado;
    private Productos producto;
    private Ingredientes ingrediente;

    @BeforeEach
    void setUp() {
        estadoPendiente = new EstadoDelPedido(1L, "Pendiente", "Recibido");
        estadoCompletado = new EstadoDelPedido(4L, "Completado", "Entregado y pagado");

        promoActiva = new Promocion();
        promoActiva.setId(1L);
        promoActiva.setNombre("Promo 10%");
        promoActiva.setTipoDescuento(TipoDescuento.PORCENTAJE);
        promoActiva.setValor(new BigDecimal("10"));
        promoActiva.setActiva(true);
        promoActiva.setCodigoCupon("PROMO10");
        promoActiva.setMontoMinimoPedido(new BigDecimal("20000"));

        pedido = new Pedidos();
        pedido.setId(100L);
        pedido.setSubtotal(new BigDecimal("50000"));
        pedido.setTotal(new BigDecimal("50000"));
        pedido.setEstadoPedido(estadoPendiente);

        producto = new Productos();
        producto.setId(10L);
        producto.setNombre("Pizza");
        producto.setPrecio(new BigDecimal("25000"));

        ingrediente = new Ingredientes();
        ingrediente.setId(5L);
        ingrediente.setNombre("Queso Mozzarella");
        ingrediente.setStock(100);
    }

    @Test
    @DisplayName("Debe aplicar descuento correctamente cuando se usa un cupón activo válido")
    void testSavePedido_WithActivePromoCoupon_AppliesDiscount() {
        PedidosRequestDTO request = new PedidosRequestDTO();
        request.setSubtotal(new BigDecimal("50000"));
        request.setCodigoCupon("PROMO10");

        Pedidos entity = new Pedidos();
        entity.setSubtotal(new BigDecimal("50000"));

        when(pedidosMapper.toEntity(request)).thenReturn(entity);
        when(promocionRepository.findByCodigoCuponAndActivaTrue("PROMO10")).thenReturn(Optional.of(promoActiva));
        when(pedidosRepository.save(any(Pedidos.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(pedidosMapper.toResponseDTO(any())).thenReturn(new PedidosResponseDTO());

        PedidosResponseDTO response = pedidosService.save(request);

        assertNotNull(response);
        // Subtotal = 50000, 10% descuento = 5000, Total = 45000
        assertEquals(0, entity.getDescuento().compareTo(new BigDecimal("5000")));
        assertEquals(0, entity.getTotal().compareTo(new BigDecimal("45000")));
        assertEquals(promoActiva, entity.getPromocion());
    }

    @Test
    @DisplayName("Debe lanzar BusinessException si el cupón no está activo o no existe")
    void testSavePedido_WithInactiveOrInvalidCoupon_ThrowsException() {
        PedidosRequestDTO request = new PedidosRequestDTO();
        request.setSubtotal(new BigDecimal("50000"));
        request.setCodigoCupon("INACTIVO");

        Pedidos entity = new Pedidos();
        when(pedidosMapper.toEntity(request)).thenReturn(entity);
        when(promocionRepository.findByCodigoCuponAndActivaTrue("INACTIVO")).thenReturn(Optional.empty());

        assertThrows(BusinessException.class, () -> pedidosService.save(request));
        verify(pedidosRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe lanzar BusinessException si el subtotal no alcanza el monto mínimo del cupón")
    void testSavePedido_BelowMinimumAmount_ThrowsException() {
        PedidosRequestDTO request = new PedidosRequestDTO();
        request.setSubtotal(new BigDecimal("10000")); // Mínimo es 20000
        request.setCodigoCupon("PROMO10");

        Pedidos entity = new Pedidos();
        entity.setSubtotal(new BigDecimal("10000"));

        when(pedidosMapper.toEntity(request)).thenReturn(entity);
        when(promocionRepository.findByCodigoCuponAndActivaTrue("PROMO10")).thenReturn(Optional.of(promoActiva));

        assertThrows(BusinessException.class, () -> pedidosService.save(request));
        verify(pedidosRepository, never()).save(any());
    }

    @Test
    @DisplayName("No debe descontar inventario si el pedido está en estado 'Pendiente'")
    void testProcesarDescuentoInventario_Pendiente_DoesNotDeductStock() {
        PedidosRequestDTO request = new PedidosRequestDTO();
        request.setSubtotal(new BigDecimal("25000"));

        pedido.setEstadoPedido(estadoPendiente);
        when(pedidosMapper.toEntity(request)).thenReturn(pedido);
        when(pedidosRepository.save(any())).thenReturn(pedido);
        when(pedidosMapper.toResponseDTO(any())).thenReturn(new PedidosResponseDTO());

        pedidosService.save(request);

        // No debe buscar recetas ni registrar movimientos de salida
        verify(ingredientesAndProductosRepository, never()).findByProductosId(anyLong());
        verify(movimientosDelInventarioRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe descontar inventario cuando el estado del pedido es 'Completado'")
    void testProcesarDescuentoInventario_Completado_DeductsStock() {
        pedido.setEstadoPedido(estadoCompletado);

        DetalleDelPedido detalle = new DetalleDelPedido();
        detalle.setPedido(pedido);
        detalle.setProducto(producto);
        detalle.setCantidad(2);
        detalle.setPrecioUnitario(new BigDecimal("25000"));
        detalle.setPrecioTotal(new BigDecimal("50000"));

        IngredientesAndProductos receta = new IngredientesAndProductos();
        receta.setProductos(producto);
        receta.setIngredientes(ingrediente);
        receta.setCantidad(new BigDecimal("10")); // 10 gramos por pizza * 2 = 20 gramos

        TipoDeMovimiento salida = new TipoDeMovimiento(2L, "Salida", "Salida consumo");

        when(movimientosDelInventarioRepository.existsByPedidoId(100L)).thenReturn(false);
        when(detalleDelPedidoRepository.findByPedidoId(100L)).thenReturn(List.of(detalle));
        when(ingredientesAndProductosRepository.findByProductosId(10L)).thenReturn(List.of(receta));
        when(tipoDeMovimientoRepository.findByNombre("Salida")).thenReturn(Optional.of(salida));

        PedidosRequestDTO request = new PedidosRequestDTO();
        when(pedidosRepository.existsById(100L)).thenReturn(true);
        when(pedidosMapper.toEntity(request)).thenReturn(pedido);
        when(pedidosRepository.save(any())).thenReturn(pedido);
        when(pedidosMapper.toResponseDTO(any())).thenReturn(new PedidosResponseDTO());

        pedidosService.update(100L, request);

        // Stock inicial 100 - (10 * 2) = 80
        assertEquals(80, ingrediente.getStock());
        verify(ingredientesRepository, times(1)).save(ingrediente);
        verify(movimientosDelInventarioRepository, times(1)).save(any(MovimientosDelInventario.class));
    }
}
