package com.restaurante.api.service;

import com.restaurante.api.dto.EstadoDelPedidoRequestDTO;
import com.restaurante.api.dto.EstadoDelPedidoResponseDTO;

import java.util.List;

public interface EstadoDelPedidoService {
    List<EstadoDelPedidoResponseDTO> findAll();
    EstadoDelPedidoResponseDTO findById(Long id);
    EstadoDelPedidoResponseDTO save(EstadoDelPedidoRequestDTO requestDTO);
    EstadoDelPedidoResponseDTO update(Long id, EstadoDelPedidoRequestDTO requestDTO);
    void delete(Long id);
}
