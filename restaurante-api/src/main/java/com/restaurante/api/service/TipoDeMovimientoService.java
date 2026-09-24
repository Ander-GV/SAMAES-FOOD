package com.restaurante.api.service;

import com.restaurante.api.dto.TipoDeMovimientoRequestDTO;
import com.restaurante.api.dto.TipoDeMovimientoResponseDTO;

import java.util.List;

public interface TipoDeMovimientoService {
    List<TipoDeMovimientoResponseDTO> findAll();
    TipoDeMovimientoResponseDTO findById(Long id);
    TipoDeMovimientoResponseDTO save(TipoDeMovimientoRequestDTO requestDTO);
    TipoDeMovimientoResponseDTO update(Long id, TipoDeMovimientoRequestDTO requestDTO);
    void delete(Long id);
}
