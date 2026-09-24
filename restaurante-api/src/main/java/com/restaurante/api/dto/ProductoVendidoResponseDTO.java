package com.restaurante.api.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoVendidoResponseDTO {

    private Long productoId;

    private String nombreProducto;

    private Long cantidadVendida;

    private BigDecimal totalRecaudado;
}
