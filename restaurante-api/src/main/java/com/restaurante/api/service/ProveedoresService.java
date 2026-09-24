package com.restaurante.api.service;

import com.restaurante.api.dto.ProveedoresRequestDTO;
import com.restaurante.api.dto.ProveedoresResponseDTO;

import java.util.List;

public interface ProveedoresService {
    List<ProveedoresResponseDTO> findAll();
    ProveedoresResponseDTO findById(Long id);
    ProveedoresResponseDTO save(ProveedoresRequestDTO requestDTO);
    ProveedoresResponseDTO update(Long id, ProveedoresRequestDTO requestDTO);
    void delete(Long id);
}
