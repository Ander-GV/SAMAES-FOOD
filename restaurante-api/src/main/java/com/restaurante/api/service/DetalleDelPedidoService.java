package com.restaurante.api.service;

import com.restaurante.api.dto.DetalleDelPedidoRequestDTO;
import com.restaurante.api.dto.DetalleDelPedidoResponseDTO;

import java.util.List;

public interface DetalleDelPedidoService {
    List<DetalleDelPedidoResponseDTO> findAll();
    DetalleDelPedidoResponseDTO findById(Long id);
    DetalleDelPedidoResponseDTO save(DetalleDelPedidoRequestDTO requestDTO);
    DetalleDelPedidoResponseDTO update(Long id, DetalleDelPedidoRequestDTO requestDTO);
    void delete(Long id);
}
