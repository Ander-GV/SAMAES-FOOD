package com.restaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadosRequestDTO {

    private Long id;

    @NotBlank(message = "El nombre del empleado es obligatorio.")
    private String nombre;

    private String apellido;

    private String email;

    @NotBlank(message = "El teléfono de contacto del empleado es obligatorio.")
    private String telefono;

    private String documento;

    private String cargo;

    private boolean activo = true;
}
