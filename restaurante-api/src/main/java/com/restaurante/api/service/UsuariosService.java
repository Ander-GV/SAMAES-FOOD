package com.restaurante.api.service;

import com.restaurante.api.dto.UsuariosRequestDTO;
import com.restaurante.api.dto.UsuariosResponseDTO;

import java.util.List;

public interface UsuariosService {
    List<UsuariosResponseDTO> findAll();
    UsuariosResponseDTO findById(Long id);
    UsuariosResponseDTO save(UsuariosRequestDTO requestDTO);
    UsuariosResponseDTO update(Long id, UsuariosRequestDTO requestDTO);
    void delete(Long id);
}
