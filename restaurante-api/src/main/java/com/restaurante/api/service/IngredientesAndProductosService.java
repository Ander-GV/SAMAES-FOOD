package com.restaurante.api.service;

import com.restaurante.api.dto.IngredientesAndProductosRequestDTO;
import com.restaurante.api.dto.IngredientesAndProductosResponseDTO;

import java.util.List;

public interface IngredientesAndProductosService {
    List<IngredientesAndProductosResponseDTO> findAll();
    List<IngredientesAndProductosResponseDTO> findByProductosId(Long productoId);
    IngredientesAndProductosResponseDTO findById(Long id);
    IngredientesAndProductosResponseDTO save(IngredientesAndProductosRequestDTO requestDTO);
    IngredientesAndProductosResponseDTO update(Long id, IngredientesAndProductosRequestDTO requestDTO);
    void delete(Long id);
}

