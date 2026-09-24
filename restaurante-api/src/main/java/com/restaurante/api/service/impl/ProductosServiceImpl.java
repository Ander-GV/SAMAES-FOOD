package com.restaurante.api.service.impl;

import com.restaurante.api.dto.ProductosRequestDTO;
import com.restaurante.api.dto.ProductosResponseDTO;
import com.restaurante.api.entity.Categoria;
import com.restaurante.api.entity.EstadoDelProducto;
import com.restaurante.api.entity.Productos;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.ProductosMapper;
import com.restaurante.api.repository.CategoriaRepository;
import com.restaurante.api.repository.DetalleDelPedidoRepository;
import com.restaurante.api.repository.EstadoDelProductoRepository;
import com.restaurante.api.repository.ProductosRepository;
import com.restaurante.api.service.ProductosService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductosServiceImpl implements ProductosService {

    private final ProductosRepository productosRepository;
    private final ProductosMapper productosMapper;
    private final CategoriaRepository categoriaRepository;
    private final DetalleDelPedidoRepository detalleDelPedidoRepository;
    private final EstadoDelProductoRepository estadoDelProductoRepository;

    public ProductosServiceImpl(
            ProductosRepository productosRepository,
            ProductosMapper productosMapper,
            CategoriaRepository categoriaRepository,
            DetalleDelPedidoRepository detalleDelPedidoRepository,
            EstadoDelProductoRepository estadoDelProductoRepository) {
        this.productosRepository = productosRepository;
        this.productosMapper = productosMapper;
        this.categoriaRepository = categoriaRepository;
        this.detalleDelPedidoRepository = detalleDelPedidoRepository;
        this.estadoDelProductoRepository = estadoDelProductoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "productos")
    public List<ProductosResponseDTO> findAll() {
        return productosRepository.findAll().stream()
                .map(productosMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductosResponseDTO findById(Long id) {
        return productosRepository.findById(id)
                .map(productosMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El producto solicitado no fue encontrado."));
    }

    @Override
    @CacheEvict(value = "productos", allEntries = true)
    public ProductosResponseDTO save(ProductosRequestDTO requestDTO) {
        String productoNombre = requestDTO.getNombre().trim();

        Categoria categoria = categoriaRepository.findById(requestDTO.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("La categoría seleccionada para este producto no existe en el sistema."));

        if (productosRepository.existsByNombreIgnoreCaseAndCategoriaId(productoNombre, requestDTO.getCategoriaId())) {
            throw new BusinessException("Ya existe un producto registrado con el nombre '" + productoNombre + "' en la categoría seleccionada.");
        }

        Productos entity = productosMapper.toEntity(requestDTO);
        entity.setCategoria(categoria);

        if (requestDTO.getEstadoDelProducto() != null && requestDTO.getEstadoDelProducto().getId() != null) {
            EstadoDelProducto estado = estadoDelProductoRepository.findById(requestDTO.getEstadoDelProducto().getId()).orElse(null);
            entity.setEstadoDelProducto(estado);
        }

        Productos savedEntity = productosRepository.save(entity);
        return productosMapper.toResponseDTO(savedEntity);
    }

    @Override
    @CacheEvict(value = "productos", allEntries = true)
    public ProductosResponseDTO update(Long id, ProductosRequestDTO requestDTO) {
        String productoNombre = requestDTO.getNombre().trim();

        if (!productosRepository.existsById(id)) {
            throw new ResourceNotFoundException("El producto que intenta actualizar no existe.");
        }

        Categoria categoria = categoriaRepository.findById(requestDTO.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("La categoría seleccionada para este producto no existe en el sistema."));

        if (productosRepository.existsByNombreIgnoreCaseAndCategoriaIdAndIdNot(productoNombre, requestDTO.getCategoriaId(), id)) {
            throw new BusinessException("Ya existe otro producto registrado con el nombre '" + productoNombre + "' en la categoría seleccionada.");
        }

        Productos entity = productosMapper.toEntity(requestDTO);
        entity.setId(id);
        entity.setCategoria(categoria);
        if (requestDTO.getEstadoDelProducto() != null && requestDTO.getEstadoDelProducto().getId() != null) {
            EstadoDelProducto estado = estadoDelProductoRepository.findById(requestDTO.getEstadoDelProducto().getId()).orElse(null);
            entity.setEstadoDelProducto(estado);
        }

        Productos updatedEntity = productosRepository.save(entity);
        return productosMapper.toResponseDTO(updatedEntity);
    }

    @Override
    @CacheEvict(value = "productos", allEntries = true)
    public void delete(Long id) {
        Productos producto = productosRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El producto que intenta inactivar no existe."));

        // Eliminación Lógica (Soft Delete): Cambia estado a Inactivo (ID 3) para preservar historial de ventas y pedidos
        EstadoDelProducto estadoInactivo = estadoDelProductoRepository.findById(3L)
                .orElseGet(() -> estadoDelProductoRepository.save(new EstadoDelProducto(3L, "Inactivo", "Producto deshabilitado del menú")));
        
        producto.setEstadoDelProducto(estadoInactivo);
        productosRepository.save(producto);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existByNombreIgnoreCase(String nombre) {
        return productosRepository.existsByNombreIgnoreCase(nombre);
    }
}
