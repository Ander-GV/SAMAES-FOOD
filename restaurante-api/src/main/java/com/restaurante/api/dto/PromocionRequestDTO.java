package com.restaurante.api.dto;

import com.restaurante.api.enums.TipoDescuento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromocionRequestDTO {

    private Long id;

    @NotBlank(message = "El nombre de la promoción es obligatorio.")
    private String nombre;

    private String descripcion;

    @NotNull(message = "El tipo de descuento es obligatorio.")
    private TipoDescuento tipoDescuento;

    @NotNull(message = "El valor del descuento es obligatorio.")
    @DecimalMin(value = "0.01", message = "El valor del descuento debe ser mayor a cero.")
    private BigDecimal valor;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    private Boolean activa = true;

    private String codigoCupon;

    private BigDecimal montoMinimoPedido;

    private Integer usosMaximos;

    private Integer usosActuales = 0;
}
