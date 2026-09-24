package com.restaurante.api.service.impl;

import com.restaurante.api.dto.TipoDeMovimientoRequestDTO;
import com.restaurante.api.dto.TipoDeMovimientoResponseDTO;
import com.restaurante.api.entity.TipoDeMovimiento;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.TipoDeMovimientoMapper;
import com.restaurante.api.repository.TipoDeMovimientoRepository;
import com.restaurante.api.service.TipoDeMovimientoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TipoDeMovimientoServiceImpl implements TipoDeMovimientoService {

    private final TipoDeMovimientoRepository tipoDeMovimientoRepository;
    private final TipoDeMovimientoMapper tipoDeMovimientoMapper;

    public TipoDeMovimientoServiceImpl(TipoDeMovimientoRepository tipoDeMovimientoRepository, TipoDeMovimientoMapper tipoDeMovimientoMapper) {
        this.tipoDeMovimientoRepository = tipoDeMovimientoRepository;
        this.tipoDeMovimientoMapper = tipoDeMovimientoMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoDeMovimientoResponseDTO> findAll() {
        return tipoDeMovimientoRepository.findAll().stream()
                .map(tipoDeMovimientoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TipoDeMovimientoResponseDTO findById(Long id) {
        return tipoDeMovimientoRepository.findById(id)
                .map(tipoDeMovimientoMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El tipo de movimiento solicitado no fue encontrado."));
    }

    @Override
    public TipoDeMovimientoResponseDTO save(TipoDeMovimientoRequestDTO requestDTO) {
        TipoDeMovimiento entity = tipoDeMovimientoMapper.toEntity(requestDTO);
        TipoDeMovimiento savedEntity = tipoDeMovimientoRepository.save(entity);
        return tipoDeMovimientoMapper.toResponseDTO(savedEntity);
    }

    @Override
    public TipoDeMovimientoResponseDTO update(Long id, TipoDeMovimientoRequestDTO requestDTO) {
        if (!tipoDeMovimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El tipo de movimiento que intenta actualizar no existe.");
        }
        TipoDeMovimiento entity = tipoDeMovimientoMapper.toEntity(requestDTO);
        entity.setId(id);
        TipoDeMovimiento updatedEntity = tipoDeMovimientoRepository.save(entity);
        return tipoDeMovimientoMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!tipoDeMovimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El tipo de movimiento que intenta eliminar no existe.");
        }
        tipoDeMovimientoRepository.deleteById(id);
    }
}
