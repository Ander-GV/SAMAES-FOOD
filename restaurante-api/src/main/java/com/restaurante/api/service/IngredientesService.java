package com.restaurante.api.service;

import java.util.List;

import com.restaurante.api.dto.IngredientesRequestDTO;
import com.restaurante.api.dto.IngredientesResponseDTO;

public interface IngredientesService {
    List<IngredientesResponseDTO> findAll();
    IngredientesResponseDTO findById(Long id);
    IngredientesResponseDTO save(IngredientesRequestDTO requestDTO);
    IngredientesResponseDTO update(Long id, IngredientesRequestDTO requestDTO);
    void delete(Long id);
}
