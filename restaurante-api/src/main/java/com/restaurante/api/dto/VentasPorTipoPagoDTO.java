package com.restaurante.api.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentasPorTipoPagoDTO {

    private String tipoPago;

    private BigDecimal totalRecaudado;

    private Double porcentajeTotal;
}
