package com.restaurante.api.unit;

import com.restaurante.api.dto.UsuariosRequestDTO;
import com.restaurante.api.dto.UsuariosResponseDTO;
import com.restaurante.api.entity.Empleados;
import com.restaurante.api.entity.Roles;
import com.restaurante.api.entity.Usuarios;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.UsuariosMapper;
import com.restaurante.api.repository.EmpleadosRepository;
import com.restaurante.api.repository.RolesRepository;
import com.restaurante.api.repository.UsuariosRepository;
import com.restaurante.api.service.impl.UsuariosServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuariosServiceUnitTest {

    @Mock
    private UsuariosRepository usuariosRepository;
    @Mock
    private EmpleadosRepository empleadosRepository;
    @Mock
    private RolesRepository rolesRepository;
    @Mock
    private UsuariosMapper usuariosMapper;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuariosServiceImpl usuariosService;

    private Usuarios usuario;
    private Empleados empleado;
    private Roles rol;

    @BeforeEach
    void setUp() {
        empleado = new Empleados(1L, "Carlos", "Perez", "carlos@mail.com", "3110000000", "123456", "MESERO", true);
        rol = new Roles(2L, "MESERO", "Rol de mesero");
        usuario = new Usuarios(1L, "$2a$10$encodedPassword", "CPerez", empleado, rol);
    }

    @Test
    @DisplayName("Debe guardar un usuario encriptando la contraseña")
    void testSave_EncodesPassword() {
        UsuariosRequestDTO request = new UsuariosRequestDTO();
        request.setCodigoEmpleado("CPerez");
        request.setPassword("plainPassword123");

        when(passwordEncoder.encode("plainPassword123")).thenReturn("encodedPasswordHashed");
        when(usuariosRepository.save(any(Usuarios.class))).thenReturn(usuario);
        when(usuariosMapper.toResponseDTO(usuario)).thenReturn(new UsuariosResponseDTO());

        usuariosService.save(request);

        verify(passwordEncoder, times(1)).encode("plainPassword123");
        verify(usuariosRepository, times(1)).save(any(Usuarios.class));
    }

    @Test
    @DisplayName("Debe realizar eliminación: marcar empleado como inactivo y eliminar usuario")
    void testDelete_SetsEmpleadoActivoToFalse() {
        assertTrue(empleado.isActivo(), "El empleado debe iniciar activo");

        when(usuariosRepository.findById(1L)).thenReturn(Optional.of(usuario));

        usuariosService.delete(1L);

        verify(empleadosRepository, times(1)).save(empleado);
        assertFalse(empleado.isActivo());
        verify(usuariosRepository, times(1)).delete(usuario);
    }


    @Test
    @DisplayName("Debe lanzar ResourceNotFoundException si el usuario a eliminar no existe")
    void testDelete_NotFound_ThrowsException() {
        when(usuariosRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> usuariosService.delete(99L));
        verify(usuariosRepository, never()).save(any());
    }
}
