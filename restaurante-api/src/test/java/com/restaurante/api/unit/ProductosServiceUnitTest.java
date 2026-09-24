package com.restaurante.api.unit;

import com.restaurante.api.dto.EstadoDelProductoRequestDTO;
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
import com.restaurante.api.service.impl.ProductosServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class ProductosServiceUnitTest {

    @Mock
    private ProductosRepository productosRepository;
    @Mock
    private ProductosMapper productosMapper;
    @Mock
    private CategoriaRepository categoriaRepository;
    @Mock
    private DetalleDelPedidoRepository detalleDelPedidoRepository;
    @Mock
    private EstadoDelProductoRepository estadoDelProductoRepository;

    @InjectMocks
    private ProductosServiceImpl productosService;

    private Productos producto;
    private Categoria categoria;
    private EstadoDelProducto estadoDisponible;
    private EstadoDelProducto estadoInactivo;
    private ProductosRequestDTO requestDTO;
    private ProductosResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        categoria = new Categoria(1L, "Platos Fuertes", "Platos principales", true);
        estadoDisponible = new EstadoDelProducto(1L, "Disponible", "Disponible para venta");
        estadoInactivo = new EstadoDelProducto(3L, "Inactivo", "Producto deshabilitado del menú");

        producto = new Productos();
        producto.setId(10L);
        producto.setNombre("Hamburguesa Especial");
        producto.setPrecio(new BigDecimal("25000"));
        producto.setCategoria(categoria);
        producto.setEstadoDelProducto(estadoDisponible);

        requestDTO = new ProductosRequestDTO();
        requestDTO.setNombre("Hamburguesa Especial");
        requestDTO.setPrecio(new BigDecimal("25000"));
        requestDTO.setCategoriaId(1L);

        responseDTO = new ProductosResponseDTO();
        responseDTO.setId(10L);
        responseDTO.setNombre("Hamburguesa Especial");
        responseDTO.setPrecio(new BigDecimal("25000"));
    }

    @Test
    @DisplayName("Debe listar todos los productos correctamente")
    void testFindAll_Success() {
        when(productosRepository.findAll()).thenReturn(List.of(producto));
        when(productosMapper.toResponseDTO(producto)).thenReturn(responseDTO);

        List<ProductosResponseDTO> result = productosService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Hamburguesa Especial", result.get(0).getNombre());
        verify(productosRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe buscar producto por ID exitosamente")
    void testFindById_Success() {
        when(productosRepository.findById(10L)).thenReturn(Optional.of(producto));
        when(productosMapper.toResponseDTO(producto)).thenReturn(responseDTO);

        ProductosResponseDTO result = productosService.findById(10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(productosRepository, times(1)).findById(10L);
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el producto no existe al buscar por ID")
    void testFindById_NotFound_ThrowsException() {
        when(productosRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productosService.findById(99L));
        verify(productosRepository, times(1)).findById(99L);
    }

    @Test
    @DisplayName("Debe guardar un nuevo producto exitosamente")
    void testSave_Success() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productosRepository.existsByNombreIgnoreCaseAndCategoriaId("Hamburguesa Especial", 1L)).thenReturn(false);
        when(productosMapper.toEntity(requestDTO)).thenReturn(producto);
        when(productosRepository.save(producto)).thenReturn(producto);
        when(productosMapper.toResponseDTO(producto)).thenReturn(responseDTO);

        ProductosResponseDTO result = productosService.save(requestDTO);

        assertNotNull(result);
        assertEquals("Hamburguesa Especial", result.getNombre());
        verify(productosRepository, times(1)).save(producto);
    }

    @Test
    @DisplayName("Debe lanzar BusinessException al intentar crear un producto duplicado en la misma categoría")
    void testSave_DuplicateName_ThrowsBusinessException() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productosRepository.existsByNombreIgnoreCaseAndCategoriaId("Hamburguesa Especial", 1L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> productosService.save(requestDTO));
        verify(productosRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe realizar eliminación lógica (Soft Delete): cambia estado a Inactivo (ID 3) en vez de borrar de BD")
    void testDelete_SoftDelete_SetsStatusToInactivo() {
        when(productosRepository.findById(10L)).thenReturn(Optional.of(producto));
        when(estadoDelProductoRepository.findById(3L)).thenReturn(Optional.of(estadoInactivo));

        productosService.delete(10L);

        // Verificar que se guardó el producto con estado Inactivo (Soft Delete)
        ArgumentCaptor<Productos> captor = ArgumentCaptor.forClass(Productos.class);
        verify(productosRepository, times(1)).save(captor.capture());
        Productos savedProducto = captor.getValue();

        assertNotNull(savedProducto.getEstadoDelProducto());
        assertEquals(3L, savedProducto.getEstadoDelProducto().getId());
        assertEquals("Inactivo", savedProducto.getEstadoDelProducto().getNombre());

        // Asegurarse de que NUNCA se invoca deleteById
        verify(productosRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si se intenta inactivar un producto inexistente")
    void testDelete_NotFound_ThrowsException() {
        when(productosRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productosService.delete(99L));
        verify(productosRepository, never()).save(any());
    }
}
