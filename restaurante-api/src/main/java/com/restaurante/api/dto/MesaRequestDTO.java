package com.restaurante.api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MesaRequestDTO {

    private Long id;

    @NotNull(message = "El número de mesa es obligatorio.")
    @Positive(message = "El número de mesa debe ser un número entero positivo.")
    private Integer numeroMesa;
}
