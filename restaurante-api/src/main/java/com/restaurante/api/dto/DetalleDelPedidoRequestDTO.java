package com.restaurante.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleDelPedidoRequestDTO {

    private Long id;

    @Min(value = 1, message = "La cantidad debe ser al menos 1.")
    private int cantidad;

    private BigDecimal precioUnitario;

    private BigDecimal precioTotal;

    private String observaciones;

    private Long pedidoId;

    private Long productoId;

    private PedidosRequestDTO pedido;

    private ProductosRequestDTO producto;
}
