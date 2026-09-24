package com.restaurante.api.service;

import com.restaurante.api.dto.TipoDePagoRequestDTO;
import com.restaurante.api.dto.TipoDePagoResponseDTO;

import java.util.List;

public interface TipoDePagoService {
    List<TipoDePagoResponseDTO> findAll();
    TipoDePagoResponseDTO findById(Long id);
    TipoDePagoResponseDTO save(TipoDePagoRequestDTO requestDTO);
    TipoDePagoResponseDTO update(Long id, TipoDePagoRequestDTO requestDTO);
    void delete(Long id);
}
