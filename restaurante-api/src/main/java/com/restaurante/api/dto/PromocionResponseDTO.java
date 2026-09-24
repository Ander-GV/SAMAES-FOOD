package com.restaurante.api.dto;

import com.restaurante.api.enums.TipoDescuento;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PromocionResponseDTO {

    private Long id;

    private String nombre;

    private String descripcion;

    private TipoDescuento tipoDescuento;

    private BigDecimal valor;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    private Boolean activa;

    private String codigoCupon;

    private BigDecimal montoMinimoPedido;

    private Integer usosMaximos;

    private Integer usosActuales;
}
