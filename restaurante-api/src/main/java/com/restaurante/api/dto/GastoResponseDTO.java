package com.restaurante.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GastoResponseDTO {

    private Long id;

    private LocalDateTime fecha;

    private BigDecimal monto;

    private String categoria;

    private String descripcion;

    private Long empleadoId;

    private String nombreEmpleado;

    private Long usuarioId;

    private String codigoEmpleadoUsuario;
}
