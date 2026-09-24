package com.restaurante.api.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteVentasResponseDTO {

    private BigDecimal totalVentas;

    private Long cantidadPedidos;

    private BigDecimal promedioTicket;

    private List<VentasPorTipoPagoDTO> descomposicionMetodosPago;
}
