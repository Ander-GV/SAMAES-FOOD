package com.restaurante.api.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientesAndProductosResponseDTO {

    private Long id;

    private BigDecimal cantidad;

    private IngredientesResponseDTO ingredientes;

    private ProductosResponseDTO productos;
}
