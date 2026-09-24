package com.restaurante.api.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.DetalleDelPedidoRequestDTO;
import com.restaurante.api.dto.PedidosRequestDTO;
import com.restaurante.api.dto.PedidosResponseDTO;
import com.restaurante.api.entity.DetalleDelPedido;
import com.restaurante.api.entity.EstadoDelPedido;
import com.restaurante.api.entity.Ingredientes;
import com.restaurante.api.entity.IngredientesAndProductos;
import com.restaurante.api.entity.MovimientosDelInventario;
import com.restaurante.api.entity.Pedidos;
import com.restaurante.api.entity.Productos;
import com.restaurante.api.entity.Promocion;
import com.restaurante.api.entity.TipoDeMovimiento;

import com.restaurante.api.enums.TipoDescuento;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
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
import com.restaurante.api.service.PedidosService;

@Service
@Transactional
public class PedidosServiceImpl implements PedidosService {

    private final PedidosRepository pedidosRepository;
    private final PedidosMapper pedidosMapper;
    private final PromocionRepository promocionRepository;
    private final DetalleDelPedidoRepository detalleDelPedidoRepository;
    private final DetalleDelPedidoMapper detalleDelPedidoMapper;
    private final ProductosRepository productosRepository;
    private final IngredientesAndProductosRepository ingredientesAndProductosRepository;
    private final IngredientesRepository ingredientesRepository;
    private final MovimientosDelInventarioRepository movimientosDelInventarioRepository;
    private final TipoDeMovimientoRepository tipoDeMovimientoRepository;
    private final EstadoDelPedidoRepository estadoDelPedidoRepository;
    private final UsuariosRepository usuariosRepository;

    public PedidosServiceImpl(
            PedidosRepository pedidosRepository,
            PedidosMapper pedidosMapper,
            PromocionRepository promocionRepository,
            DetalleDelPedidoRepository detalleDelPedidoRepository,
            DetalleDelPedidoMapper detalleDelPedidoMapper,
            ProductosRepository productosRepository,
            IngredientesAndProductosRepository ingredientesAndProductosRepository,
            IngredientesRepository ingredientesRepository,
            MovimientosDelInventarioRepository movimientosDelInventarioRepository,
            TipoDeMovimientoRepository tipoDeMovimientoRepository,
            EstadoDelPedidoRepository estadoDelPedidoRepository,
            UsuariosRepository usuariosRepository) {
        this.pedidosRepository = pedidosRepository;
        this.pedidosMapper = pedidosMapper;
        this.promocionRepository = promocionRepository;
        this.detalleDelPedidoRepository = detalleDelPedidoRepository;
        this.detalleDelPedidoMapper = detalleDelPedidoMapper;
        this.productosRepository = productosRepository;
        this.ingredientesAndProductosRepository = ingredientesAndProductosRepository;
        this.ingredientesRepository = ingredientesRepository;
        this.movimientosDelInventarioRepository = movimientosDelInventarioRepository;
        this.tipoDeMovimientoRepository = tipoDeMovimientoRepository;
        this.estadoDelPedidoRepository = estadoDelPedidoRepository;
        this.usuariosRepository = usuariosRepository;
    }

    private PedidosResponseDTO mapearPedidoConDetalles(Pedidos entity) {
        PedidosResponseDTO dto = pedidosMapper.toResponseDTO(entity);
        if (dto != null && entity.getId() != null) {
            List<DetalleDelPedido> detalles = detalleDelPedidoRepository.findByPedidoId(entity.getId());
            dto.setDetalles(detalles.stream().map(detalleDelPedidoMapper::toResponseDTO).collect(Collectors.toList()));
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidosResponseDTO> findAll() {
        return pedidosRepository.findAll().stream()
                .map(this::mapearPedidoConDetalles)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PedidosResponseDTO findById(Long id) {
        return pedidosRepository.findById(id)
                .map(this::mapearPedidoConDetalles)
                .orElseThrow(() -> new ResourceNotFoundException("El pedido solicitado no fue encontrado."));
    }

    @Override
    public PedidosResponseDTO save(PedidosRequestDTO requestDTO) {
        Pedidos entity = pedidosMapper.toEntity(requestDTO);
        
        if (entity.getFechaInicio() == null) {
            entity.setFechaInicio(LocalDateTime.now());
        }

        if (entity.getEstadoPedido() == null) {
            entity.setEstadoPedido(estadoDelPedidoRepository.findById(1L).orElse(null));
        }

        if (entity.getUsuario() == null) {
            usuariosRepository.findAll().stream().findFirst().ifPresent(entity::setUsuario);
        }

        procesarPromocionYTotales(entity, requestDTO, null);
        Pedidos savedEntity = pedidosRepository.save(entity);

        if (requestDTO.getDetalles() != null && !requestDTO.getDetalles().isEmpty()) {
            for (DetalleDelPedidoRequestDTO dDto : requestDTO.getDetalles()) {
                DetalleDelPedido detalle = new DetalleDelPedido();
                detalle.setPedido(savedEntity);
                detalle.setCantidad(dDto.getCantidad() > 0 ? dDto.getCantidad() : 1);
                
                Long prodId = dDto.getProductoId() != null ? dDto.getProductoId() : (dDto.getProducto() != null ? dDto.getProducto().getId() : null);
                if (prodId != null) {
                    Productos prod = productosRepository.findById(prodId).orElse(null);
                    detalle.setProducto(prod);
                    BigDecimal unitPrice = dDto.getPrecioUnitario() != null ? dDto.getPrecioUnitario() : (prod != null ? prod.getPrecio() : BigDecimal.ZERO);
                    detalle.setPrecioUnitario(unitPrice);
                    detalle.setPrecioTotal(unitPrice.multiply(BigDecimal.valueOf(detalle.getCantidad())));
                }
                detalle.setObservaciones(dDto.getObservaciones());
                detalleDelPedidoRepository.save(detalle);
            }
        }

        procesarDescuentoInventario(savedEntity);
        return mapearPedidoConDetalles(savedEntity);
    }


    @Override
    public PedidosResponseDTO update(Long id, PedidosRequestDTO requestDTO) {
        if (!pedidosRepository.existsById(id)) {
            throw new ResourceNotFoundException("El pedido que intenta actualizar no existe.");
        }
        Pedidos entity = pedidosMapper.toEntity(requestDTO);
        entity.setId(id);
        procesarPromocionYTotales(entity, requestDTO, id);
        Pedidos updatedEntity = pedidosRepository.save(entity);
        procesarDescuentoInventario(updatedEntity);
        return mapearPedidoConDetalles(updatedEntity);
    }

    @Override
    public PedidosResponseDTO cambiarEstado(Long id, Long nuevoEstadoId) {
        Pedidos pedido = pedidosRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El pedido con ID " + id + " no existe."));

        EstadoDelPedido estado = estadoDelPedidoRepository.findById(nuevoEstadoId)
                .orElseThrow(() -> new ResourceNotFoundException("El estado de pedido con ID " + nuevoEstadoId + " no existe."));

        pedido.setEstadoPedido(estado);
        Pedidos saved = pedidosRepository.save(pedido);

        if (nuevoEstadoId == 4L || (estado.getNombre() != null && estado.getNombre().toUpperCase().contains("COMPLETADO"))) {
            procesarDescuentoInventario(saved);
        }

        return mapearPedidoConDetalles(saved);
    }


    @Override
    public void recalcularSubtotalYTotalDelPedido(Long pedidoId) {
        Pedidos pedido = pedidosRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado para recalcular totales."));

        List<DetalleDelPedido> detalles = detalleDelPedidoRepository.findByPedidoId(pedidoId);
        BigDecimal subtotalCalculado = detalles.stream()
                .map(d -> d.getPrecioTotal() != null ? d.getPrecioTotal() : d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        pedido.setSubtotal(subtotalCalculado);

        // Recalcular descuento si hay promoción
        BigDecimal descuento = BigDecimal.ZERO;
        Promocion promocion = pedido.getPromocion();
        if (promocion != null && Boolean.TRUE.equals(promocion.getActiva())) {
            if (promocion.getTipoDescuento() == TipoDescuento.PORCENTAJE) {
                descuento = subtotalCalculado.multiply(promocion.getValor()).divide(BigDecimal.valueOf(100));
            } else if (promocion.getTipoDescuento() == TipoDescuento.MONTO_FIJO) {
                descuento = promocion.getValor();
            }
            if (descuento.compareTo(subtotalCalculado) > 0) {
                descuento = subtotalCalculado;
            }
        }

        pedido.setDescuento(descuento);
        pedido.setTotal(subtotalCalculado.subtract(descuento));

        pedidosRepository.save(pedido);
        procesarDescuentoInventario(pedido);
    }

    private void procesarPromocionYTotales(Pedidos entity, PedidosRequestDTO requestDTO, Long pedidoIdExistente) {
        BigDecimal subtotal;
        if (pedidoIdExistente != null) {
            List<DetalleDelPedido> detalles = detalleDelPedidoRepository.findByPedidoId(pedidoIdExistente);
            if (!detalles.isEmpty()) {
                subtotal = detalles.stream()
                        .map(d -> d.getPrecioTotal() != null ? d.getPrecioTotal() : d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            } else {
                subtotal = requestDTO.getSubtotal() != null ? requestDTO.getSubtotal() : (requestDTO.getTotal() != null ? requestDTO.getTotal() : BigDecimal.ZERO);
            }
        } else {
            subtotal = requestDTO.getSubtotal() != null ? requestDTO.getSubtotal() : (requestDTO.getTotal() != null ? requestDTO.getTotal() : BigDecimal.ZERO);
        }

        Promocion promocion = null;

        // 1. Verificar si envió código de cupón
        if (requestDTO.getCodigoCupon() != null && !requestDTO.getCodigoCupon().isBlank()) {
            String codigo = requestDTO.getCodigoCupon().trim().toUpperCase();
            promocion = promocionRepository.findByCodigoCuponAndActivaTrue(codigo)
                    .orElseThrow(() -> new BusinessException("El código de cupón '" + codigo + "' no es válido o ha expirado."));
        }
        // 2. O si envió el ID de la promoción directamente
        else if (requestDTO.getPromocionId() != null) {
            promocion = promocionRepository.findById(requestDTO.getPromocionId())
                    .orElseThrow(() -> new ResourceNotFoundException("La promoción solicitada no existe."));
        }
        // 3. De lo contrario, buscar automáticamente si califica por el monto total del pedido
        else {
            List<Promocion> elegibles = promocionRepository.findPromocionesElegiblesPorMonto(subtotal, LocalDateTime.now());
            if (!elegibles.isEmpty()) {
                promocion = elegibles.get(0);
            }
        }

        BigDecimal descuento = BigDecimal.ZERO;
        if (promocion != null && Boolean.TRUE.equals(promocion.getActiva())) {
            if (promocion.getMontoMinimoPedido() != null && subtotal.compareTo(promocion.getMontoMinimoPedido()) < 0) {
                throw new BusinessException("El subtotal del pedido ($" + subtotal + ") no alcanza el monto mínimo ($" + promocion.getMontoMinimoPedido() + ") requerido por la promoción '" + promocion.getNombre() + "'.");
            }

            if (promocion.getTipoDescuento() == TipoDescuento.PORCENTAJE) {
                descuento = subtotal.multiply(promocion.getValor()).divide(BigDecimal.valueOf(100));
            } else if (promocion.getTipoDescuento() == TipoDescuento.MONTO_FIJO) {
                descuento = promocion.getValor();
            }

            if (descuento.compareTo(subtotal) > 0) {
                descuento = subtotal;
            }

            entity.setPromocion(promocion);
        }

        entity.setSubtotal(subtotal);
        entity.setDescuento(descuento);
        entity.setTotal(subtotal.subtract(descuento));
    }

    private void procesarDescuentoInventario(Pedidos pedido) {
        if (pedido.getEstadoPedido() == null || pedido.getEstadoPedido().getNombre() == null) {
            return;
        }

        String estadoNombre = pedido.getEstadoPedido().getNombre();
        if (!"Completado".equalsIgnoreCase(estadoNombre)) {
            return;
        }

        // Si ya se descontó el inventario para este pedido, evitar duplicación
        if (movimientosDelInventarioRepository.existsByPedidoId(pedido.getId())) {
            return;
        }

        List<DetalleDelPedido> detalles = detalleDelPedidoRepository.findByPedidoId(pedido.getId());
        if (detalles.isEmpty()) {
            return;
        }

        // Paso 1: Verificar disponibilidad de stock para TODOS los ingredientes requeridos
        for (DetalleDelPedido detalle : detalles) {
            if (detalle.getProducto() == null) continue;
            List<IngredientesAndProductos> recetas = ingredientesAndProductosRepository.findByProductosId(detalle.getProducto().getId());
            for (IngredientesAndProductos receta : recetas) {
                BigDecimal cantidadRequerida = receta.getCantidad().multiply(BigDecimal.valueOf(detalle.getCantidad()));
                Ingredientes ingrediente = receta.getIngredientes();
                if (ingrediente.getStock() < cantidadRequerida.intValue()) {
                    throw new BusinessException("Stock insuficiente para el ingrediente '" + ingrediente.getNombre() +
                            "'. Disponible: " + ingrediente.getStock() + ", Requerido: " + cantidadRequerida);
                }
            }
        }

        // Paso 2: Descontar stock y registrar Movimiento de Inventario (Salida)
        TipoDeMovimiento tipoSalida = tipoDeMovimientoRepository.findByNombre("Salida")
                .orElseGet(() -> tipoDeMovimientoRepository.save(new TipoDeMovimiento(null, "Salida", "Salida por consumo de pedido")));

        for (DetalleDelPedido detalle : detalles) {
            if (detalle.getProducto() == null) continue;
            List<IngredientesAndProductos> recetas = ingredientesAndProductosRepository.findByProductosId(detalle.getProducto().getId());
            for (IngredientesAndProductos receta : recetas) {
                BigDecimal cantidadConsumida = receta.getCantidad().multiply(BigDecimal.valueOf(detalle.getCantidad()));
                Ingredientes ingrediente = receta.getIngredientes();

                // Descontar del stock
                ingrediente.setStock(ingrediente.getStock() - cantidadConsumida.intValue());
                ingredientesRepository.save(ingrediente);

                // Crear registro de movimiento
                MovimientosDelInventario movimiento = new MovimientosDelInventario();
                movimiento.setCantidad(cantidadConsumida);
                movimiento.setFecha(LocalDateTime.now());
                movimiento.setMotivo("Consumo automático por Pedido #" + pedido.getId());
                movimiento.setTipoDeMovimiento(tipoSalida);
                movimiento.setIngrediente(ingrediente);
                movimiento.setPedido(pedido);
                movimiento.setUsuario(pedido.getUsuario());
                movimiento.setUnidadDeMedida(ingrediente.getUnidadDeMedida());
                movimiento.setCantidadDeConversion(cantidadConsumida);

                movimientosDelInventarioRepository.save(movimiento);
            }
        }
    }

    @Override
    public void delete(Long id) {
        if (!pedidosRepository.existsById(id)) {
            throw new ResourceNotFoundException("El pedido que intenta eliminar no existe.");
        }
        pedidosRepository.deleteById(id);
    }
}
