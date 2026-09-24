package com.restaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequestDTO {

    @NotBlank(message = "El código de empleado es obligatorio.")
    private String codigoEmpleado;

    @NotBlank(message = "La contraseña es obligatoria.")
    private String password;
}
