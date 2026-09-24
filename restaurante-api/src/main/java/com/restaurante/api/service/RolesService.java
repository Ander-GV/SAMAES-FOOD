package com.restaurante.api.service;

import com.restaurante.api.dto.RolesRequestDTO;
import com.restaurante.api.dto.RolesResponseDTO;

import java.util.List;

public interface RolesService {
    List<RolesResponseDTO> findAll();
    RolesResponseDTO findById(Long id);
    RolesResponseDTO save(RolesRequestDTO requestDTO);
    RolesResponseDTO update(Long id, RolesRequestDTO requestDTO);
    void delete(Long id);
}
