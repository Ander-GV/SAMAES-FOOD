package com.restaurante.api.service;

import com.restaurante.api.dto.MovimientosDelInventarioRequestDTO;
import com.restaurante.api.dto.MovimientosDelInventarioResponseDTO;

import java.util.List;

public interface MovimientosDelInventarioService {
    List<MovimientosDelInventarioResponseDTO> findAll();
    MovimientosDelInventarioResponseDTO findById(Long id);
    MovimientosDelInventarioResponseDTO save(MovimientosDelInventarioRequestDTO requestDTO);
    MovimientosDelInventarioResponseDTO update(Long id, MovimientosDelInventarioRequestDTO requestDTO);
    void delete(Long id);
}
