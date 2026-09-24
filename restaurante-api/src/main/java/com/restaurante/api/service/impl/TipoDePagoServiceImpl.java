package com.restaurante.api.service.impl;

import com.restaurante.api.dto.TipoDePagoRequestDTO;
import com.restaurante.api.dto.TipoDePagoResponseDTO;
import com.restaurante.api.entity.TipoDePago;
import com.restaurante.api.exception.ResourceNotFoundException;
import com.restaurante.api.mapper.TipoDePagoMapper;
import com.restaurante.api.repository.TipoDePagoRepository;
import com.restaurante.api.service.TipoDePagoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TipoDePagoServiceImpl implements TipoDePagoService {

    private final TipoDePagoRepository tipoDePagoRepository;
    private final TipoDePagoMapper tipoDePagoMapper;

    public TipoDePagoServiceImpl(TipoDePagoRepository tipoDePagoRepository, TipoDePagoMapper tipoDePagoMapper) {
        this.tipoDePagoRepository = tipoDePagoRepository;
        this.tipoDePagoMapper = tipoDePagoMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TipoDePagoResponseDTO> findAll() {
        return tipoDePagoRepository.findAll().stream()
                .map(tipoDePagoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TipoDePagoResponseDTO findById(Long id) {
        return tipoDePagoRepository.findById(id)
                .map(tipoDePagoMapper::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("El tipo de pago solicitado no fue encontrado."));
    }

    @Override
    public TipoDePagoResponseDTO save(TipoDePagoRequestDTO requestDTO) {
        TipoDePago entity = tipoDePagoMapper.toEntity(requestDTO);
        TipoDePago savedEntity = tipoDePagoRepository.save(entity);
        return tipoDePagoMapper.toResponseDTO(savedEntity);
    }

    @Override
    public TipoDePagoResponseDTO update(Long id, TipoDePagoRequestDTO requestDTO) {
        if (!tipoDePagoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El tipo de pago que intenta actualizar no existe.");
        }
        TipoDePago entity = tipoDePagoMapper.toEntity(requestDTO);
        entity.setId(id);
        TipoDePago updatedEntity = tipoDePagoRepository.save(entity);
        return tipoDePagoMapper.toResponseDTO(updatedEntity);
    }

    @Override
    public void delete(Long id) {
        if (!tipoDePagoRepository.existsById(id)) {
            throw new ResourceNotFoundException("El tipo de pago que intenta eliminar no existe.");
        }
        tipoDePagoRepository.deleteById(id);
    }
}
