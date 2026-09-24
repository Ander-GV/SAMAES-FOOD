package com.restaurante.api.service;

import com.restaurante.api.dto.ClienteRequestDTO;
import com.restaurante.api.dto.ClienteResponseDTO;

import java.util.List;

public interface ClienteService {
    List<ClienteResponseDTO> findAll();
    ClienteResponseDTO findById(Long id);
    ClienteResponseDTO save(ClienteRequestDTO requestDTO);
    ClienteResponseDTO update(Long id, ClienteRequestDTO requestDTO);
    void delete(Long id);
}
