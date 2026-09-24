package com.restaurante.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovimientosDelInventarioRequestDTO {

    private Long id;

    @NotNull
    private BigDecimal cantidad;

    @NotNull
    private LocalDateTime fecha;

    @NotBlank
    private String motivo;

    @NotNull
    private TipoDeMovimientoRequestDTO tipoDeMovimiento;

    private IngredientesRequestDTO ingrediente;

    @NotNull
    private UsuariosRequestDTO usuario;

    private PedidosRequestDTO pedido;

    private ProveedoresRequestDTO proveedor;

    @NotNull
    private UnidadDeMedidaRequestDTO unidadDeMedida;

    @NotNull
    private BigDecimal cantidadDeConversion;
}
