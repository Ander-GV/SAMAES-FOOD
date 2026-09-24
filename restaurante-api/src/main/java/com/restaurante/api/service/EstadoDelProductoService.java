package com.restaurante.api.service;

import com.restaurante.api.dto.EstadoDelProductoRequestDTO;
import com.restaurante.api.dto.EstadoDelProductoResponseDTO;

import java.util.List;

public interface EstadoDelProductoService {
    List<EstadoDelProductoResponseDTO> findAll();
    EstadoDelProductoResponseDTO findById(Long id);
    EstadoDelProductoResponseDTO save(EstadoDelProductoRequestDTO requestDTO);
    EstadoDelProductoResponseDTO update(Long id, EstadoDelProductoRequestDTO requestDTO);
    void delete(Long id);
}
