package com.restaurante.api.service;

import java.util.List;

import com.restaurante.api.dto.CategoriaRequestDTO;
import com.restaurante.api.dto.CategoriaResponseDTO;

public interface CategoriaService {
    List<CategoriaResponseDTO> findAll();
    CategoriaResponseDTO findById(Long id);
    CategoriaResponseDTO save(CategoriaRequestDTO requestDTO);
    CategoriaResponseDTO update(Long id, CategoriaRequestDTO requestDTO);
    void delete(Long id);
    boolean existByNombreIgnoreCase(String nombre);
}
