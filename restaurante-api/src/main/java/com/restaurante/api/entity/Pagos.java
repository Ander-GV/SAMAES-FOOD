package com.restaurante.api.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
@Table(name = "pagos")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class Pagos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal monto;

    private LocalDateTime fechaPago;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuarios usuario;

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedidos pedido;

    @ManyToOne
    @JoinColumn(name = "tipo_de_pago_id", nullable = false)
    private TipoDePago tipoPago;

}
