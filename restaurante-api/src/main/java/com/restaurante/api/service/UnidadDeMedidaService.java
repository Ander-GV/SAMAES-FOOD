package com.restaurante.api.service;

import java.util.List;

import com.restaurante.api.dto.UnidadDeMedidaRequestDTO;
import com.restaurante.api.dto.UnidadDeMedidaResponseDTO;

public interface UnidadDeMedidaService {
    List<UnidadDeMedidaResponseDTO> findAll();
    UnidadDeMedidaResponseDTO findById(Long id);
    UnidadDeMedidaResponseDTO save(UnidadDeMedidaRequestDTO requestDTO);
    UnidadDeMedidaResponseDTO update(Long id, UnidadDeMedidaRequestDTO requestDTO);
    void delete(Long id);
    boolean existByNombreIgnoreCaseAndIdNot(String nombre, Long id);
    boolean existByAbreviaturaIgnoreCaseAndIdNot(String abreviatura, Long id);
}
