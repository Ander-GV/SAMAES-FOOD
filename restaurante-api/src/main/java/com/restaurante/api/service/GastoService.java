package com.restaurante.api.service;

import java.time.LocalDateTime;
import java.util.List;

import com.restaurante.api.dto.GastoRequestDTO;
import com.restaurante.api.dto.GastoResponseDTO;

public interface GastoService {

    List<GastoResponseDTO> findAll();

    List<GastoResponseDTO> findByRangoFecha(LocalDateTime inicio, LocalDateTime fin);

    List<GastoResponseDTO> findByEmpleadoId(Long empleadoId);

    GastoResponseDTO findById(Long id);

    GastoResponseDTO save(GastoRequestDTO requestDTO);

    GastoResponseDTO update(Long id, GastoRequestDTO requestDTO);

    void delete(Long id);
}
