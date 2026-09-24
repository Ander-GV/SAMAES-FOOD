package com.restaurante.api.service;

import com.restaurante.api.dto.MesaRequestDTO;
import com.restaurante.api.dto.MesaResponseDTO;

import java.util.List;

public interface MesaService {
    List<MesaResponseDTO> findAll();
    MesaResponseDTO findById(Long id);
    MesaResponseDTO save(MesaRequestDTO requestDTO);
    MesaResponseDTO update(Long id, MesaRequestDTO requestDTO);
    void delete(Long id);
}
