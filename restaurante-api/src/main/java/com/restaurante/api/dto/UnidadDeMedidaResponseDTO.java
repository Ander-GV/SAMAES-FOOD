package com.restaurante.api.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnidadDeMedidaResponseDTO {

    private Long id;

    private String nombre;

    private String abreviatura;

    private BigDecimal factorDeConversion;

    private String tipoDeUnidad; // "PESO", "LIQUIDO", "UNIDAD"
}
