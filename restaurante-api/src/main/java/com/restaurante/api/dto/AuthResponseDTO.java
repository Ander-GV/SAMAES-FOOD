package com.restaurante.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDTO {

    private String accessToken;
    private String tokenType = "Bearer";
    private String codigoEmpleado;
    private String role;
    private String nombreEmpleado;

    public AuthResponseDTO(String accessToken, String codigoEmpleado, String role, String nombreEmpleado) {
        this.accessToken = accessToken;
        this.codigoEmpleado = codigoEmpleado;
        this.role = role;
        this.nombreEmpleado = nombreEmpleado;
    }
}
