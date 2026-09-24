package com.restaurante.api.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.DetalleDelPedidoRequestDTO;
import com.restaurante.api.dto.DetalleDelPedidoResponseDTO;
import com.restaurante.api.entity.DetalleDelPedido;
import com.restaurante.api.entity.Ingredientes;
import com.restaurante.api.entity.IngredientesAndProductos;
import com.restaurante.api.entity.Pedidos;
import com.restaurante.api.entity.Productos;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.DetalleDelPedidoMapper;
import com.restaurante.api.repository.DetalleDelPedidoRepository;
import com.restaurante.api.repository.IngredientesAndProductosRepository;
import com.restaurante.api.repository.IngredientesRepository;
import com.restaurante.api.repository.PedidosRepository;
import com.restaurante.api.repository.ProductosRepository;
import com.restaurante.api.service.DetalleDelPedidoService;
import com.restaurante.api.service.PedidosService;

@Service
@Transactional
public class DetalleDelPedidoServiceImpl implements DetalleDelPedidoService {

    private final DetalleDelPedidoRepository detalleDelPedidoRepository;
    private final DetalleDelPedidoMapper detalleDelPedidoMapper;
    private final ProductosRepository productosRepository;
    private final PedidosRepository pedidosRepository;
    private final PedidosService pedidosService;
    private final IngredientesAndProductosRepository ingredientesAndProductosRepository;
    private final IngredientesRepository ingredientesRepository;

    public DetalleDelPedidoServiceImpl(
            DetalleDelPedidoRepository detalleDelPedidoRepository,
            DetalleDelPedidoMapper detalleDelPedidoMapper,
            ProductosRepository productosRepository,
            PedidosRepository pedidosRepository,
            @Lazy PedidosService pedidosService,
            IngredientesAndProductosRepository ingredientesAndProductosRepository,
            IngredientesRepository ingredientesRepository) {
        this.detalleDelPedidoRepository = detalleDelPedidoRepository;
        this.detalleDelPedidoMapper = detalleDelPedidoMapper;
        this.productosRepository = productosRepository;
        this.pedidosRepository = pedidosRepository;
        this.pedidosService = pedidosService;
        this.ingredientesAndProductosRepository = ingredientesAndProductosRepository;
        this.ingredientesRepository = ingredientesRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DetalleDelPedidoResponseDTO> findAll() {
        return detalleDelPedidoRepository.findAll().stream()
                .map(detalleDelPedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DetalleDelPedidoResponseDTO findById(Long id) {
        return detalleDelPedidoRepository.findById(id)
                .map(detalleDelPedidoMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El detalle del pedido solicitado no fue encontrado."));
    }

    @Override
    public DetalleDelPedidoResponseDTO save(DetalleDelPedidoRequestDTO requestDTO) {
        DetalleDelPedido entity = detalleDelPedidoMapper.toEntity(requestDTO);
        cargarEntidades(entity, requestDTO);
        DetalleDelPedido savedEntity = detalleDelPedidoRepository.save(entity);

        // Descontar automáticamente insumos del inventario según la receta técnica del producto
        if (savedEntity.getProducto() != null && savedEntity.getProducto().getId() != null) {
            descontarInsumosDeInventario(savedEntity.getProducto().getId(), savedEntity.getCantidad());
        }

        if (savedEntity.getPedido() != null && savedEntity.getPedido().getId() != null) {
            pedidosService.recalcularSubtotalYTotalDelPedido(savedEntity.getPedido().getId());
        }

        return detalleDelPedidoMapper.toResponseDTO(savedEntity);
    }

    @Override
    public DetalleDelPedidoResponseDTO update(Long id, DetalleDelPedidoRequestDTO requestDTO) {
        if (!detalleDelPedidoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El detalle del pedido que intenta actualizar no existe.");
        }
        DetalleDelPedido entity = detalleDelPedidoMapper.toEntity(requestDTO);
        entity.setId(id);
        cargarEntidades(entity, requestDTO);
        DetalleDelPedido updatedEntity = detalleDelPedidoRepository.save(entity);

        if (updatedEntity.getPedido() != null && updatedEntity.getPedido().getId() != null) {
            pedidosService.recalcularSubtotalYTotalDelPedido(updatedEntity.getPedido().getId());
        }

        return detalleDelPedidoMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        DetalleDelPedido entity = detalleDelPedidoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El detalle del pedido que intenta eliminar no existe."));

        Long pedidoId = (entity.getPedido() != null) ? entity.getPedido().getId() : null;
        detalleDelPedidoRepository.deleteById(id);

        if (pedidoId != null) {
            pedidosService.recalcularSubtotalYTotalDelPedido(pedidoId);
        }
    }

    private void descontarInsumosDeInventario(Long productoId, int cantidadPedida) {
        List<IngredientesAndProductos> receta = ingredientesAndProductosRepository.findByProductosId(productoId);
        for (IngredientesAndProductos item : receta) {
            if (item.getIngredientes() != null && item.getCantidad() != null) {
                Ingredientes ing = ingredientesRepository.findById(item.getIngredientes().getId()).orElse(null);
                if (ing != null) {
                    int descuentoTotal = item.getCantidad().multiply(BigDecimal.valueOf(cantidadPedida)).intValue();
                    int stockActual = ing.getStock() != null ? ing.getStock() : 0;
                    ing.setStock(Math.max(0, stockActual - descuentoTotal));
                    ingredientesRepository.save(ing);
                }
            }
        }
    }

    private void cargarEntidades(DetalleDelPedido entity, DetalleDelPedidoRequestDTO requestDTO) {
        Long pedidoId = requestDTO.getPedidoId();
        if (pedidoId == null && requestDTO.getPedido() != null) {
            pedidoId = requestDTO.getPedido().getId();
        }
        if (pedidoId != null) {
            Pedidos pedido = pedidosRepository.findById(pedidoId)
                    .orElseThrow(() -> new ResourceNotFoundException("El pedido asociado no existe."));
            entity.setPedido(pedido);
        }

        Long productoId = requestDTO.getProductoId();
        if (productoId == null && requestDTO.getProducto() != null) {
            productoId = requestDTO.getProducto().getId();
        }
        if (productoId != null) {
            Productos producto = productosRepository.findById(productoId)
                    .orElseThrow(() -> new ResourceNotFoundException("El producto asociado no existe."));
            entity.setProducto(producto);

            if (entity.getPrecioUnitario() == null || entity.getPrecioUnitario().compareTo(BigDecimal.ZERO) == 0) {
                entity.setPrecioUnitario(producto.getPrecio());
            }
        }

        if (entity.getPrecioUnitario() != null) {
            entity.setPrecioTotal(entity.getPrecioUnitario().multiply(BigDecimal.valueOf(entity.getCantidad())));
        } else {
            entity.setPrecioTotal(BigDecimal.ZERO);
        }
    }
}
