package com.restaurante.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuariosResponseDTO {

    private Long id;

    private String password;

    private String codigoEmpleado;

    private EmpleadosResponseDTO empleados;

    private RolesResponseDTO roles;
}
