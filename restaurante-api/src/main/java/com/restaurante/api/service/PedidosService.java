package com.restaurante.api.service;

import com.restaurante.api.dto.PedidosRequestDTO;
import com.restaurante.api.dto.PedidosResponseDTO;

import java.util.List;

public interface PedidosService {
    List<PedidosResponseDTO> findAll();
    PedidosResponseDTO findById(Long id);
    PedidosResponseDTO save(PedidosRequestDTO requestDTO);
    PedidosResponseDTO update(Long id, PedidosRequestDTO requestDTO);
    PedidosResponseDTO cambiarEstado(Long id, Long nuevoEstadoId);
    void delete(Long id);
    void recalcularSubtotalYTotalDelPedido(Long pedidoId);
}


