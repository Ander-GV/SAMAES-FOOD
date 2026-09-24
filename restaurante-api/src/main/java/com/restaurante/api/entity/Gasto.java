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
@Table(name = "gastos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Gasto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "monto", nullable = false)
    private BigDecimal monto;

    @Column(name = "categoria", nullable = false)
    private String categoria; // "PAGO_EMPLEADO", "COMPRA_INSUMOS", "SERVICIOS", "MANTENIMIENTO", "OTROS"

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleados empleado;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuarios usuario;
}
