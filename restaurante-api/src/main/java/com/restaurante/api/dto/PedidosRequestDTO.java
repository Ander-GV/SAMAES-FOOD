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
public class PedidosRequestDTO {

    private Long id;

    private LocalDateTime fechaInicio;

    private EstadoDelPedidoRequestDTO estadoPedido;

    @NotNull(message = "El tipo de pedido es obligatorio.")
    private TipoDePedidosRequestDTO tipoPedido;

    private ClienteRequestDTO cliente;

    private MesaRequestDTO mesa;

    private BigDecimal subtotal;

    private BigDecimal descuento;

    private BigDecimal total;

    private String codigoCupon;

    private Long promocionId;

    private UsuariosRequestDTO usuario;

    @NotBlank(message = "La dirección de entrega o mesa es obligatoria.")
    private String direccionEntrega;

    private String nombreDestinatario;

    private String telefonoDestinatario;

    private LocalDateTime fechafinalizacion;

    private java.util.List<DetalleDelPedidoRequestDTO> detalles;
}

