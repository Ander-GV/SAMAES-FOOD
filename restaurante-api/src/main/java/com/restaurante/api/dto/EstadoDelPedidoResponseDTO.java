package com.restaurante.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadoDelPedidoResponseDTO {

    private Long id;

    private String nombre;

    private String descripcion;
}
