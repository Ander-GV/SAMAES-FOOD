package com.restaurante.api.service;

import com.restaurante.api.dto.EmpleadosRequestDTO;
import com.restaurante.api.dto.EmpleadosResponseDTO;

import java.util.List;

public interface EmpleadosService {
    List<EmpleadosResponseDTO> findAll();
    EmpleadosResponseDTO findById(Long id);
    EmpleadosResponseDTO save(EmpleadosRequestDTO requestDTO);
    EmpleadosResponseDTO update(Long id, EmpleadosRequestDTO requestDTO);
    void delete(Long id);
}
