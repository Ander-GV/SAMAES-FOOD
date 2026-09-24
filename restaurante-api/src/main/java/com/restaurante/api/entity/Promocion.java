package com.restaurante.api.entity;

import com.restaurante.api.enums.TipoDescuento;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promociones")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Promocion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    private String descripcion;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_descuento", nullable = false)
    private TipoDescuento tipoDescuento;

    @Column(name = "valor", nullable = false)
    private BigDecimal valor;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(name = "activa", nullable = false)
    private Boolean activa = true;

    @Column(name = "codigo_cupon", unique = true)
    private String codigoCupon;

    @Column(name = "monto_minimo_pedido")
    private BigDecimal montoMinimoPedido;

    @Column(name = "usos_maximos")
    private Integer usosMaximos; // null = ilimitado

    @Column(name = "usos_actuales")
    private Integer usosActuales = 0;
}
