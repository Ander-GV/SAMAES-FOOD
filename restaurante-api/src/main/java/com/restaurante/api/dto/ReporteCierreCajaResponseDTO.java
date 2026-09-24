package com.restaurante.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteCierreCajaResponseDTO {

    private Long usuarioId;

    private String nombreUsuario;

    private String codigoEmpleado;

    private LocalDateTime fechaConsulta;

    private BigDecimal totalRecaudado;

    private BigDecimal totalEfectivo;

    private BigDecimal totalTarjeta;

    private BigDecimal totalTransferencia;

    private BigDecimal totalEgresos;

    private BigDecimal totalPagosEmpleados;

    private BigDecimal totalGastosOperativos;

    private BigDecimal saldoNetoEfectivo;

    private Long cantidadTransacciones;

    private Long cantidadPedidosCompletados;

    private java.util.List<GastoResponseDTO> gastos;
}
