package com.restaurante.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadosResponseDTO {

    private Long id;

    private String nombre;

    private String apellido;

    private String email;

    private String telefono;

    private String documento;

    private String cargo;

    private boolean activo;
}
