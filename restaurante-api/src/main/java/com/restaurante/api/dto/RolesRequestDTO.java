package com.restaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolesRequestDTO {

    private Long id;

    @NotBlank
    private String nombre;

    @NotBlank
    private String descripcionRol;
}
