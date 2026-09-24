package com.restaurante.api.service.impl;

import com.restaurante.api.dto.EstadoDelProductoRequestDTO;
import com.restaurante.api.dto.EstadoDelProductoResponseDTO;
import com.restaurante.api.entity.EstadoDelProducto;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.EstadoDelProductoMapper;
import com.restaurante.api.repository.EstadoDelProductoRepository;
import com.restaurante.api.service.EstadoDelProductoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EstadoDelProductoServiceImpl implements EstadoDelProductoService {

    private final EstadoDelProductoRepository estadoDelProductoRepository;
    private final EstadoDelProductoMapper estadoDelProductoMapper;

    public EstadoDelProductoServiceImpl(EstadoDelProductoRepository estadoDelProductoRepository, EstadoDelProductoMapper estadoDelProductoMapper) {
        this.estadoDelProductoRepository = estadoDelProductoRepository;
        this.estadoDelProductoMapper = estadoDelProductoMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadoDelProductoResponseDTO> findAll() {
        return estadoDelProductoRepository.findAll().stream()
                .map(estadoDelProductoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EstadoDelProductoResponseDTO findById(Long id) {
        return estadoDelProductoRepository.findById(id)
                .map(estadoDelProductoMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El estado de producto solicitado no fue encontrado."));
    }

    @Override
    public EstadoDelProductoResponseDTO save(EstadoDelProductoRequestDTO requestDTO) {
        EstadoDelProducto entity = estadoDelProductoMapper.toEntity(requestDTO);
        EstadoDelProducto savedEntity = estadoDelProductoRepository.save(entity);
        return estadoDelProductoMapper.toResponseDTO(savedEntity);
    }

    @Override
    public EstadoDelProductoResponseDTO update(Long id, EstadoDelProductoRequestDTO requestDTO) {
        if (!estadoDelProductoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El estado de producto que intenta actualizar no existe.");
        }
        EstadoDelProducto entity = estadoDelProductoMapper.toEntity(requestDTO);
        entity.setId(id);
        EstadoDelProducto updatedEntity = estadoDelProductoRepository.save(entity);
        return estadoDelProductoMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!estadoDelProductoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El estado de producto que intenta eliminar no existe.");
        }
        estadoDelProductoRepository.deleteById(id);
    }
}
