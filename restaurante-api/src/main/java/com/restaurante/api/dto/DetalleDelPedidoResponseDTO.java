package com.restaurante.api.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleDelPedidoResponseDTO {

    private Long id;

    private int cantidad;

    private BigDecimal precioUnitario;

    private BigDecimal precioTotal;

    private String observaciones;

    private Long pedidoId;

    private Long productoId;

    private String nombreProducto;
}
