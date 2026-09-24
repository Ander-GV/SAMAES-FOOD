package com.restaurante.api.service.impl;

import com.restaurante.api.dto.EstadoDelPedidoRequestDTO;
import com.restaurante.api.dto.EstadoDelPedidoResponseDTO;
import com.restaurante.api.entity.EstadoDelPedido;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.EstadoDelPedidoMapper;
import com.restaurante.api.repository.EstadoDelPedidoRepository;
import com.restaurante.api.service.EstadoDelPedidoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EstadoDelPedidoServiceImpl implements EstadoDelPedidoService {

    private final EstadoDelPedidoRepository estadoDelPedidoRepository;
    private final EstadoDelPedidoMapper estadoDelPedidoMapper;

    public EstadoDelPedidoServiceImpl(EstadoDelPedidoRepository estadoDelPedidoRepository, EstadoDelPedidoMapper estadoDelPedidoMapper) {
        this.estadoDelPedidoRepository = estadoDelPedidoRepository;
        this.estadoDelPedidoMapper = estadoDelPedidoMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EstadoDelPedidoResponseDTO> findAll() {
        return estadoDelPedidoRepository.findAll().stream()
                .map(estadoDelPedidoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EstadoDelPedidoResponseDTO findById(Long id) {
        return estadoDelPedidoRepository.findById(id)
                .map(estadoDelPedidoMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El estado de pedido solicitado no fue encontrado."));
    }

    @Override
    public EstadoDelPedidoResponseDTO save(EstadoDelPedidoRequestDTO requestDTO) {
        EstadoDelPedido entity = estadoDelPedidoMapper.toEntity(requestDTO);
        EstadoDelPedido savedEntity = estadoDelPedidoRepository.save(entity);
        return estadoDelPedidoMapper.toResponseDTO(savedEntity);
    }

    @Override
    public EstadoDelPedidoResponseDTO update(Long id, EstadoDelPedidoRequestDTO requestDTO) {
        if (!estadoDelPedidoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El estado de pedido que intenta actualizar no existe.");
        }
        EstadoDelPedido entity = estadoDelPedidoMapper.toEntity(requestDTO);
        entity.setId(id);
        EstadoDelPedido updatedEntity = estadoDelPedidoRepository.save(entity);
        return estadoDelPedidoMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!estadoDelPedidoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El estado de pedido que intenta eliminar no existe.");
        }
        estadoDelPedidoRepository.deleteById(id);
    }
}
