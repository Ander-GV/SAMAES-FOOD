package com.restaurante.api.unit;

import com.restaurante.api.dto.EmpleadosRequestDTO;
import com.restaurante.api.dto.EmpleadosResponseDTO;
import com.restaurante.api.entity.Empleados;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.EmpleadosMapper;
import com.restaurante.api.repository.EmpleadosRepository;
import com.restaurante.api.service.impl.EmpleadosServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmpleadosServiceUnitTest {

    @Mock
    private EmpleadosRepository empleadosRepository;
    @Mock
    private EmpleadosMapper empleadosMapper;
    @Mock
    private com.restaurante.api.repository.UsuariosRepository usuariosRepository;

    @InjectMocks
    private EmpleadosServiceImpl empleadosService;

    private Empleados empleado;
    private EmpleadosRequestDTO requestDTO;
    private EmpleadosResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        empleado = new Empleados(1L, "Laura", "Gomez", "laura@mail.com", "3201234567", "987654321", "CAJERO", true);
        requestDTO = new EmpleadosRequestDTO();
        requestDTO.setNombre("Laura");
        requestDTO.setApellido("Gomez");
        requestDTO.setActivo(true);

        responseDTO = new EmpleadosResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setNombre("Laura");
        responseDTO.setActivo(true);
    }

    @Test
    @DisplayName("Debe listar empleados correctamente")
    void testFindAll_Success() {
        when(empleadosRepository.findAll()).thenReturn(List.of(empleado));
        when(empleadosMapper.toResponseDTO(empleado)).thenReturn(responseDTO);

        List<EmpleadosResponseDTO> result = empleadosService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).isActivo());
    }

    @Test
    @DisplayName("Debe guardar un empleado con estado activo por defecto")
    void testSave_Success() {
        when(empleadosMapper.toEntity(requestDTO)).thenReturn(empleado);
        when(empleadosRepository.save(empleado)).thenReturn(empleado);
        when(empleadosMapper.toResponseDTO(empleado)).thenReturn(responseDTO);

        EmpleadosResponseDTO result = empleadosService.save(requestDTO);

        assertNotNull(result);
        assertTrue(result.isActivo());
        verify(empleadosRepository, times(1)).save(empleado);
    }

    @Test
    @DisplayName("Debe actualizar un empleado existente")
    void testUpdate_Success() {
        when(empleadosRepository.existsById(1L)).thenReturn(true);
        when(empleadosMapper.toEntity(requestDTO)).thenReturn(empleado);
        when(empleadosRepository.save(empleado)).thenReturn(empleado);
        when(empleadosMapper.toResponseDTO(empleado)).thenReturn(responseDTO);

        EmpleadosResponseDTO result = empleadosService.update(1L, requestDTO);

        assertNotNull(result);
        verify(empleadosRepository, times(1)).save(empleado);
    }

    @Test
    @DisplayName("Debe inactivar lógicamente un empleado existente")
    void testDelete_Success() {
        when(empleadosRepository.findById(1L)).thenReturn(Optional.of(empleado));
        when(usuariosRepository.findByEmpleadosId(1L)).thenReturn(Optional.empty());

        empleadosService.delete(1L);

        assertFalse(empleado.isActivo());
        verify(empleadosRepository, times(1)).save(empleado);
    }

    @Test
    @DisplayName("Debe lanzar excepción si se intenta eliminar un empleado que no existe")
    void testDelete_NotFound_ThrowsException() {
        when(empleadosRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> empleadosService.delete(99L));
        verify(empleadosRepository, never()).save(any(Empleados.class));
    }
}
