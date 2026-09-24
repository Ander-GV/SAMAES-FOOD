package com.restaurante.api.service;

import com.restaurante.api.dto.TipoDePedidosRequestDTO;
import com.restaurante.api.dto.TipoDePedidosResponseDTO;

import java.util.List;

public interface TipoDePedidosService {
    List<TipoDePedidosResponseDTO> findAll();
    TipoDePedidosResponseDTO findById(Long id);
    TipoDePedidosResponseDTO save(TipoDePedidosRequestDTO requestDTO);
    TipoDePedidosResponseDTO update(Long id, TipoDePedidosRequestDTO requestDTO);
    void delete(Long id);
}
