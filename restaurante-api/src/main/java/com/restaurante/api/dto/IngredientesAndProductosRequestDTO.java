package com.restaurante.api.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientesAndProductosRequestDTO {

    private Long id;

    private BigDecimal cantidad;

    private IngredientesRequestDTO ingredientes;

    private ProductosRequestDTO productos;
}
