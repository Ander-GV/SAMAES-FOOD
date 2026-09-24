package com.restaurante.api.service.impl;

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
import com.restaurante.api.service.UsuariosService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UsuariosServiceImpl implements UsuariosService {

    private final UsuariosRepository usuariosRepository;
    private final EmpleadosRepository empleadosRepository;
    private final RolesRepository rolesRepository;
    private final UsuariosMapper usuariosMapper;
    private final PasswordEncoder passwordEncoder;

    public UsuariosServiceImpl(UsuariosRepository usuariosRepository,
                               EmpleadosRepository empleadosRepository,
                               RolesRepository rolesRepository,
                               UsuariosMapper usuariosMapper,
                               PasswordEncoder passwordEncoder) {
        this.usuariosRepository = usuariosRepository;
        this.empleadosRepository = empleadosRepository;
        this.rolesRepository = rolesRepository;
        this.usuariosMapper = usuariosMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuariosResponseDTO> findAll() {
        return usuariosRepository.findAll().stream()
                .map(usuariosMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UsuariosResponseDTO findById(Long id) {
        return usuariosRepository.findById(id)
                .map(usuariosMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario solicitado no fue encontrado."));
    }

    @Override
    public UsuariosResponseDTO save(UsuariosRequestDTO requestDTO) {
        // Verificar si ya existe un usuario para este empleado o con el mismo código
        Usuarios entity = null;
        if (requestDTO.getEmpleados() != null && requestDTO.getEmpleados().getId() != null) {
            Optional<Usuarios> existingByEmp = usuariosRepository.findByEmpleadosId(requestDTO.getEmpleados().getId());
            if (existingByEmp.isPresent()) {
                entity = existingByEmp.get();
            }
        }
        if (entity == null && requestDTO.getCodigoEmpleado() != null) {
            Optional<Usuarios> existingByCode = usuariosRepository.findByCodigoEmpleado(requestDTO.getCodigoEmpleado());
            if (existingByCode.isPresent()) {
                entity = existingByCode.get();
            }
        }

        if (entity == null) {
            entity = new Usuarios();
        }

        entity.setCodigoEmpleado(requestDTO.getCodigoEmpleado());
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().isBlank()) {
            entity.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }

        if (requestDTO.getEmpleados() != null && requestDTO.getEmpleados().getId() != null) {
            Empleados emp = empleadosRepository.findById(requestDTO.getEmpleados().getId()).orElse(null);
            entity.setEmpleados(emp);
        }

        if (requestDTO.getRoles() != null && requestDTO.getRoles().getId() != null) {
            Roles rol = rolesRepository.findById(requestDTO.getRoles().getId()).orElse(null);
            entity.setRoles(rol);
        }

        Usuarios savedEntity = usuariosRepository.save(entity);
        return usuariosMapper.toResponseDTO(savedEntity);
    }

    @Override
    public UsuariosResponseDTO update(Long id, UsuariosRequestDTO requestDTO) {
        Usuarios existing = usuariosRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario que intenta actualizar no existe."));
        
        existing.setCodigoEmpleado(requestDTO.getCodigoEmpleado());
        
        // Conservar contraseña previa si no se envió una nueva
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }

        if (requestDTO.getEmpleados() != null && requestDTO.getEmpleados().getId() != null) {
            Empleados emp = empleadosRepository.findById(requestDTO.getEmpleados().getId()).orElse(null);
            existing.setEmpleados(emp);
        }

        if (requestDTO.getRoles() != null && requestDTO.getRoles().getId() != null) {
            Roles rol = rolesRepository.findById(requestDTO.getRoles().getId()).orElse(null);
            existing.setRoles(rol);
        }
        
        Usuarios updatedEntity = usuariosRepository.save(existing);
        return usuariosMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        Usuarios usuario = usuariosRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario que intenta inactivar no existe."));
        
        if (usuario.getEmpleados() != null) {
            usuario.getEmpleados().setActivo(false);
            empleadosRepository.save(usuario.getEmpleados());
        }

        try {
            usuariosRepository.delete(usuario);
        } catch (Exception e) {
            // Si el usuario tiene órdenes/pedidos asociados, inhabilitamos su acceso
            if (!usuario.getCodigoEmpleado().startsWith("INACTIVO-")) {
                usuario.setCodigoEmpleado("INACTIVO-" + usuario.getId() + "-" + usuario.getCodigoEmpleado());
                usuariosRepository.save(usuario);
            }
        }
    }
}

