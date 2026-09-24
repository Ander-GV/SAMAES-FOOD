package com.restaurante.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductosRequestDTO {

    private Long id;

    @NotBlank(message = "El nombre del producto es obligatorio.")
    private String nombre;

    @NotBlank(message = "La descripción del producto es obligatoria.")
    private String descripcion;

    @NotNull(message = "El precio del producto es obligatorio.")
    @Positive(message = "El precio del producto debe ser mayor a cero.")
    private BigDecimal precio;

    private String imagen;

    private EstadoDelProductoRequestDTO estadoDelProducto;

    @NotNull(message = "El ID de la categoría es obligatorio.")
    private Long categoriaId;
}
