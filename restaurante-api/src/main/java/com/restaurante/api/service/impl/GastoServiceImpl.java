package com.restaurante.api.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.restaurante.api.dto.GastoRequestDTO;
import com.restaurante.api.dto.GastoResponseDTO;
import com.restaurante.api.entity.Empleados;
import com.restaurante.api.entity.Gasto;
import com.restaurante.api.entity.Usuarios;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.GastoMapper;
import com.restaurante.api.repository.EmpleadosRepository;
import com.restaurante.api.repository.GastoRepository;
import com.restaurante.api.repository.UsuariosRepository;
import com.restaurante.api.service.GastoService;

@Service
@Transactional
public class GastoServiceImpl implements GastoService {

    private final GastoRepository gastoRepository;
    private final GastoMapper gastoMapper;
    private final EmpleadosRepository empleadosRepository;
    private final UsuariosRepository usuariosRepository;

    public GastoServiceImpl(
            GastoRepository gastoRepository,
            GastoMapper gastoMapper,
            EmpleadosRepository empleadosRepository,
            UsuariosRepository usuariosRepository) {
        this.gastoRepository = gastoRepository;
        this.gastoMapper = gastoMapper;
        this.empleadosRepository = empleadosRepository;
        this.usuariosRepository = usuariosRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<GastoResponseDTO> findAll() {
        return gastoRepository.findAll().stream()
                .map(gastoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GastoResponseDTO> findByRangoFecha(LocalDateTime inicio, LocalDateTime fin) {
        return gastoRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin).stream()
                .map(gastoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GastoResponseDTO> findByEmpleadoId(Long empleadoId) {
        return gastoRepository.findByEmpleadoIdOrderByFechaDesc(empleadoId).stream()
                .map(gastoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GastoResponseDTO findById(Long id) {
        return gastoRepository.findById(id)
                .map(gastoMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El registro de gasto con ID " + id + " no existe."));
    }

    @Override
    public GastoResponseDTO save(GastoRequestDTO requestDTO) {
        Gasto entity = gastoMapper.toEntity(requestDTO);

        if (entity.getFecha() == null) {
            entity.setFecha(LocalDateTime.now());
        }

        // Asignar Empleado si viene en la solicitud
        if (requestDTO.getEmpleadoId() != null) {
            Empleados emp = empleadosRepository.findById(requestDTO.getEmpleadoId())
                    .orElseThrow(() -> new ResourceNotFoundException("El empleado asociado no existe."));
            entity.setEmpleado(emp);
        }

        // Asignar Usuario que registra
        if (entity.getUsuario() == null || entity.getUsuario().getId() == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                Usuarios user = usuariosRepository.findByCodigoEmpleado(auth.getName()).orElse(null);
                if (user != null) {
                    entity.setUsuario(user);
                }
            }
        }

        if (entity.getUsuario() == null || entity.getUsuario().getId() == null) {
            Usuarios primerUsuario = usuariosRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("No hay usuarios en el sistema para registrar el gasto."));
            entity.setUsuario(primerUsuario);
        }

        Gasto saved = gastoRepository.save(entity);
        return gastoMapper.toResponseDTO(saved);
    }

    @Override
    public GastoResponseDTO update(Long id, GastoRequestDTO requestDTO) {
        if (!gastoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El registro de gasto que intenta actualizar no existe.");
        }

        Gasto entity = gastoMapper.toEntity(requestDTO);
        entity.setId(id);

        if (entity.getFecha() == null) {
            entity.setFecha(LocalDateTime.now());
        }

        if (requestDTO.getEmpleadoId() != null) {
            Empleados emp = empleadosRepository.findById(requestDTO.getEmpleadoId()).orElse(null);
            entity.setEmpleado(emp);
        }

        Gasto updated = gastoRepository.save(entity);
        return gastoMapper.toResponseDTO(updated);
    }

    @Override
    public void delete(Long id) {
        if (!gastoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El registro de gasto con ID " + id + " no existe.");
        }
        gastoRepository.deleteById(id);
    }
}
