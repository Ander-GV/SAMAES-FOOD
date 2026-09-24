package com.restaurante.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagosResponseDTO {

    private Long id;

    private BigDecimal monto;

    private BigDecimal montoRecibido;

    private BigDecimal cambio;

    private BigDecimal totalPedido;

    private BigDecimal totalPagado;

    private BigDecimal saldoPendiente;

    private LocalDateTime fechaPago;

    private UsuariosResponseDTO usuario;

    private PedidosResponseDTO pedido;

    private TipoDePagoResponseDTO tipoPago;
}
