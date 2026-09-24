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
public class PedidosResponseDTO {

    private Long id;

    private LocalDateTime fechaInicio;

    private EstadoDelPedidoResponseDTO estadoPedido;

    private TipoDePedidosResponseDTO tipoPedido;

    private ClienteResponseDTO cliente;

    private MesaResponseDTO mesa;

    private BigDecimal subtotal;

    private BigDecimal descuento;

    private BigDecimal total;

    private PromocionResponseDTO promocion;

    private UsuariosResponseDTO usuario;

    private String direccionEntrega;

    private String nombreDestinatario;

    private String telefonoDestinatario;

    private LocalDateTime fechafinalizacion;

    private java.util.List<DetalleDelPedidoResponseDTO> detalles;
}
