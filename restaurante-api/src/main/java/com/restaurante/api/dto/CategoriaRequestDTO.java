package com.restaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaRequestDTO {

    private Long id;

    @NotBlank(message = "El nombre de la categoría es obligatorio.")
    private String nombre;

    @NotBlank(message = "La descripción de la categoría es obligatoria.")
    private String descripcion;

    @NotNull(message = "El estado de la categoría es obligatorio.")
    private Boolean estado;
}
