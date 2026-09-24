package com.restaurante.api.dto;

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
public class MovimientosDelInventarioResponseDTO {

    private Long id;

    private BigDecimal cantidad;

    private LocalDateTime fecha;

    private String motivo;

    private TipoDeMovimientoResponseDTO tipoDeMovimiento;

    private IngredientesResponseDTO ingrediente;

    private UsuariosResponseDTO usuario;

    private PedidosResponseDTO pedido;

    private ProveedoresResponseDTO proveedor;

    private UnidadDeMedidaResponseDTO unidadDeMedida;

    private BigDecimal cantidadDeConversion;
}
