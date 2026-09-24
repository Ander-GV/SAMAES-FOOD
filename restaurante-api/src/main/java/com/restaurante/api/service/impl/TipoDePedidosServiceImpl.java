package com.restaurante.api.service.impl;

import com.restaurante.api.dto.TipoDePedidosRequestDTO;
import com.restaurante.api.dto.TipoDePedidosResponseDTO;
import com.restaurante.api.entity.TipoDePedidos;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.TipoDePedidosMapper;
import com.restaurante.api.repository.TipoDePedidosRepository;
import com.restaurante.api.service.TipoDePedidosService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TipoDePedidosServiceImpl implements TipoDePedidosService {

    private final TipoDePedidosRepository tipoDePedidosRepository;
    private final TipoDePedidosMapper tipoDePedidosMapper;

    public TipoDePedidosServiceImpl(TipoDePedidosRepository tipoDePedidosRepository, TipoDePedidosMapper tipoDePedidosMapper) {
        this.tipoDePedidosRepository = tipoDePedidosRepository;
        this.tipoDePedidosMapper = tipoDePedidosMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoDePedidosResponseDTO> findAll() {
        return tipoDePedidosRepository.findAll().stream()
                .map(tipoDePedidosMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TipoDePedidosResponseDTO findById(Long id) {
        return tipoDePedidosRepository.findById(id)
                .map(tipoDePedidosMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El tipo de pedido solicitado no fue encontrado."));
    }

    @Override
    public TipoDePedidosResponseDTO save(TipoDePedidosRequestDTO requestDTO) {
        TipoDePedidos entity = tipoDePedidosMapper.toEntity(requestDTO);
        TipoDePedidos savedEntity = tipoDePedidosRepository.save(entity);
        return tipoDePedidosMapper.toResponseDTO(savedEntity);
    }

    @Override
    public TipoDePedidosResponseDTO update(Long id, TipoDePedidosRequestDTO requestDTO) {
        if (!tipoDePedidosRepository.existsById(id)) {
            throw new ResourceNotFoundException("El tipo de pedido que intenta actualizar no existe.");
        }
        TipoDePedidos entity = tipoDePedidosMapper.toEntity(requestDTO);
        entity.setId(id);
        TipoDePedidos updatedEntity = tipoDePedidosRepository.save(entity);
        return tipoDePedidosMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!tipoDePedidosRepository.existsById(id)) {
            throw new ResourceNotFoundException("El tipo de pedido que intenta eliminar no existe.");
        }
        tipoDePedidosRepository.deleteById(id);
    }
}
