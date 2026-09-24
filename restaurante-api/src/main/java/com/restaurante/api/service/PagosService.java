package com.restaurante.api.service;

import com.restaurante.api.dto.PagosRequestDTO;
import com.restaurante.api.dto.PagosResponseDTO;

import java.util.List;

public interface PagosService {
    List<PagosResponseDTO> findAll();
    PagosResponseDTO findById(Long id);
    PagosResponseDTO save(PagosRequestDTO requestDTO);
    PagosResponseDTO update(Long id, PagosRequestDTO requestDTO);
    void delete(Long id);
}
