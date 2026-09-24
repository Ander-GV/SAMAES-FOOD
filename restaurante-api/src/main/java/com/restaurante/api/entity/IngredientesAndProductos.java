package com.restaurante.api.entity;


import java.math.BigDecimal;
import java.util.List;

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
@Table(name = "ingredientes_and_productos")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class IngredientesAndProductos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal cantidad;

    @ManyToOne
    @JoinColumn(name = "ingrediente_id")
    private Ingredientes ingredientes;

    @ManyToOne
    @JoinColumn(name = "producto_id")
    private Productos productos;

}

