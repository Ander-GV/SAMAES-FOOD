package com.restaurante.api.service;

import java.util.List;

import com.restaurante.api.dto.ProductosRequestDTO;
import com.restaurante.api.dto.ProductosResponseDTO;

public interface ProductosService {
    List<ProductosResponseDTO> findAll();
    ProductosResponseDTO findById(Long id);
    ProductosResponseDTO save(ProductosRequestDTO requestDTO);
    ProductosResponseDTO update(Long id, ProductosRequestDTO requestDTO);
    void delete(Long id);
    boolean existByNombreIgnoreCase(String nombre);

}
