package com.restaurante.api.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pedidos")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class Pedidos {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inicio_pedido", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "sincronizado", nullable = false)
    private Boolean sincronizado = false;

    @ManyToOne
    @JoinColumn(name = "estado_del_pedido_id", nullable = false)
    private EstadoDelPedido estadoPedido;

    @ManyToOne
    @JoinColumn(name = "tipo_de_pedido_id", nullable = false)
    private TipoDePedidos tipoPedido;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;

    @Column(name = "subtotal")
    private BigDecimal subtotal;

    @Column(name = "descuento")
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "total", nullable = false)
    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "promocion_id")
    private Promocion promocion;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuarios usuario;

    @Column(name = "direccion_entrega")
    private String direccionEntrega;

    @Column(name = "nombre_destinatario")
    private String nombreDestinatario;

    @Column(name = "telefono_destinatario")
    private String telefonoDestinatario;

    @Column(name = "fecha_finalizacion")
    private LocalDateTime fechafinalizacion;
}
