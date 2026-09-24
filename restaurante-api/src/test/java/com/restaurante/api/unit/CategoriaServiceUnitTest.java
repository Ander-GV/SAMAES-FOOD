package com.restaurante.api.unit;

import com.restaurante.api.dto.CategoriaRequestDTO;
import com.restaurante.api.dto.CategoriaResponseDTO;
import com.restaurante.api.entity.Categoria;
import com.restaurante.api.exception.BusinessException;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.CategoriaMapper;
import com.restaurante.api.repository.CategoriaRepository;
import com.restaurante.api.repository.ProductosRepository;
import com.restaurante.api.service.impl.CategoriaServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoriaServiceUnitTest {

    @Mock
    private CategoriaRepository categoriaRepository;
    @Mock
    private CategoriaMapper categoriaMapper;
    @Mock
    private ProductosRepository productosRepository;

    @InjectMocks
    private CategoriaServiceImpl categoriaService;

    private Categoria categoria;
    private CategoriaRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        categoria = new Categoria(1L, "Bebidas", "Bebidas frías y calientes", true);
        requestDTO = new CategoriaRequestDTO();
        requestDTO.setNombre("Bebidas");
        requestDTO.setDescripcion("Bebidas frías y calientes");
        requestDTO.setEstado(true);
    }

    @Test
    @DisplayName("Debe lanzar BusinessException al eliminar si la categoría tiene productos asociados")
    void testDelete_WithAssociatedProducts_ThrowsException() {
        when(categoriaRepository.existsById(1L)).thenReturn(true);
        when(productosRepository.existsByCategoriaId(1L)).thenReturn(true);

        assertThrows(BusinessException.class, () -> categoriaService.delete(1L));
        verify(categoriaRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Debe eliminar la categoría si no tiene productos asociados")
    void testDelete_WithoutProducts_Success() {
        when(categoriaRepository.existsById(1L)).thenReturn(true);
        when(productosRepository.existsByCategoriaId(1L)).thenReturn(false);

        categoriaService.delete(1L);

        verify(categoriaRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Debe lanzar BusinessException al guardar si el nombre ya existe")
    void testSave_DuplicateName_ThrowsException() {
        when(categoriaRepository.existsByNombreIgnoreCase("Bebidas")).thenReturn(true);

        assertThrows(BusinessException.class, () -> categoriaService.save(requestDTO));
        verify(categoriaRepository, never()).save(any());
    }
}
