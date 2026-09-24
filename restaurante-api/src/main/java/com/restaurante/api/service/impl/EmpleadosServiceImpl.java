package com.restaurante.api.service.impl;

import com.restaurante.api.dto.EmpleadosRequestDTO;
import com.restaurante.api.dto.EmpleadosResponseDTO;
import com.restaurante.api.entity.Empleados;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.EmpleadosMapper;
import com.restaurante.api.repository.EmpleadosRepository;
import com.restaurante.api.service.EmpleadosService;
import com.restaurante.api.entity.Usuarios;
import com.restaurante.api.repository.UsuariosRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmpleadosServiceImpl implements EmpleadosService {

    private final EmpleadosRepository empleadosRepository;
    private final EmpleadosMapper empleadosMapper;
    private final UsuariosRepository usuariosRepository;

    public EmpleadosServiceImpl(EmpleadosRepository empleadosRepository, 
                                EmpleadosMapper empleadosMapper,
                                UsuariosRepository usuariosRepository) {
        this.empleadosRepository = empleadosRepository;
        this.empleadosMapper = empleadosMapper;
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadosResponseDTO> findAll() {
        return empleadosRepository.findAll().stream()
                .map(empleadosMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmpleadosResponseDTO findById(Long id) {
        return empleadosRepository.findById(id)
                .map(empleadosMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El empleado solicitado no fue encontrado."));
    }

    @Override
    public EmpleadosResponseDTO save(EmpleadosRequestDTO requestDTO) {
        Empleados entity = empleadosMapper.toEntity(requestDTO);
        Empleados savedEntity = empleadosRepository.save(entity);
        return empleadosMapper.toResponseDTO(savedEntity);
    }

    @Override
    public EmpleadosResponseDTO update(Long id, EmpleadosRequestDTO requestDTO) {
        if (!empleadosRepository.existsById(id)) {
            throw new ResourceNotFoundException("El empleado que intenta actualizar no existe.");
        }
        Empleados entity = empleadosMapper.toEntity(requestDTO);
        entity.setId(id);
        Empleados updatedEntity = empleadosRepository.save(entity);
        return empleadosMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        Empleados empleado = empleadosRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El empleado que intenta inactivar no existe."));

        // Inactivar lógicamente al empleado preservando su historial
        empleado.setActivo(false);
        empleadosRepository.save(empleado);

        // Desactivar o eliminar credenciales del usuario asociado
        Optional<Usuarios> usuarioOpt = usuariosRepository.findByEmpleadosId(id);
        if (usuarioOpt.isPresent()) {
            Usuarios usuario = usuarioOpt.get();
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
}
