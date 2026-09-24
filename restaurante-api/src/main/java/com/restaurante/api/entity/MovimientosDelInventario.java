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
@Table(name = "movimientos_del_inventario")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class MovimientosDelInventario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cantidad", nullable = false)
    private BigDecimal cantidad;

    @Column(name = "fecha", nullable = false)
    private LocalDateTime fecha;

    @Column(name = "motivo", nullable = false)
    private String motivo;

    @ManyToOne
    @JoinColumn(name = "tipo_de_movimiento_id", nullable = false)
    private TipoDeMovimiento tipoDeMovimiento;

    @ManyToOne
    @JoinColumn(name = "ingrediente_id")
    private Ingredientes ingrediente;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuarios usuario;

    @ManyToOne
    @JoinColumn(name = "pedido_id")
    private Pedidos pedido;

    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedores proveedor;

    @ManyToOne
    @JoinColumn(name = "unidad_de_medida_id", nullable = false)
    private UnidadDeMedida unidadDeMedida;

    @Column(name = "cantidad_de_conversion", nullable = false)
    private BigDecimal cantidadDeConversion;


}
