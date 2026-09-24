package com.restaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClienteRequestDTO {

    private Long id;

    @NotBlank(message = "El nombre del cliente es obligatorio.")
    private String nombre;

    private String apellido;

    @NotBlank(message = "El teléfono del cliente es obligatorio.")
    private String telefono;
}
