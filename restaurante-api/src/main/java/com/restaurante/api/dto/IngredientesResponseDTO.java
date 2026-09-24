package com.restaurante.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientesResponseDTO {

    private Long id;

    private String nombre;

    private Integer stock;

    private UnidadDeMedidaResponseDTO unidadDeMedida;
}
