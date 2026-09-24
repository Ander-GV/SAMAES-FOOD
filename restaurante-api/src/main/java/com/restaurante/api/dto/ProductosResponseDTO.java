package com.restaurante.api.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductosResponseDTO {

    private Long id;

    private String nombre;

    private String descripcion;

    private BigDecimal precio;

    private String imagen;

    private EstadoDelProductoResponseDTO estadoDelProducto;

    private CategoriaResponseDTO categoria;
}
