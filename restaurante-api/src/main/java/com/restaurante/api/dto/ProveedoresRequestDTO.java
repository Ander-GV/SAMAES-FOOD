package com.restaurante.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProveedoresRequestDTO {

    private Long id;

    private String nit; // Opcional (permite compras a vendedores informales)

    @NotBlank(message = "El nombre del proveedor es obligatorio.")
    private String nombre;

    @NotBlank(message = "El teléfono del proveedor es obligatorio.")
    private String telefono;

    @Email(message = "El correo electrónico debe tener un formato válido.")
    private String email;

    private String direccion;
}
