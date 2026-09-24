package com.restaurante.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsumoAlertaResponseDTO {

    private Long ingredienteId;

    private String nombreIngrediente;

    private Integer stockActual;

    private String unidadMedida;

    private String nivelAlerta;
}
