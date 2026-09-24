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
@Table(name = "productos")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class Productos {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    private String descripcion;

    private BigDecimal precio;

    private String imagen;

    @ManyToOne
    @JoinColumn(name = "estado_del_producto_id")
    private EstadoDelProducto estadoDelProducto;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;


}
