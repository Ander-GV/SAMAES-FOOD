package com.restaurante.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnidadDeMedidaRequestDTO {

    private Long id;

    @NotBlank
    private String nombre;

    @NotBlank
    private String abreviatura;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "El factor de conversión debe ser mayor que cero")
    private BigDecimal factorDeConversion;

    private String tipoDeUnidad; // "PESO", "LIQUIDO", "UNIDAD"
}
