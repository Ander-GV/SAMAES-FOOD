package com.restaurante.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProveedoresResponseDTO {

    private Long id;

    private String nit;

    private String nombre;

    private String telefono;

    private String email;

    private String direccion;
}
