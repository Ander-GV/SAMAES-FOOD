package com.restaurante.api.entity;

import java.math.BigDecimal;

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
@Table(name = "detalle_del_pedido")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class DetalleDelPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cantidad", nullable = false)
    private int cantidad;

    @Column(name = "precio_unitario", nullable = false)
    private BigDecimal precioUnitario;

    @Column(name = "precio_total", nullable = false)
    private BigDecimal precioTotal;


    @Column(name = "observaciones")
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedidos pedido;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Productos producto;
}
