package com.restaurante.api.service;

import com.restaurante.api.dto.PromocionRequestDTO;
import com.restaurante.api.dto.PromocionResponseDTO;

import java.math.BigDecimal;
import java.util.List;

public interface PromocionService {
    List<PromocionResponseDTO> findAll();
    PromocionResponseDTO findById(Long id);
    PromocionResponseDTO save(PromocionRequestDTO requestDTO);
    PromocionResponseDTO update(Long id, PromocionRequestDTO requestDTO);
    void delete(Long id);
    PromocionResponseDTO findByCodigoCupon(String codigoCupon);
    PromocionResponseDTO obtenerPromocionElegible(BigDecimal subtotal);
}
