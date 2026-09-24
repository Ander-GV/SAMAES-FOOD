package com.restaurante.api.entity;


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
@Table(name = "ingredientes")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class Ingredientes {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    @ManyToOne
    @JoinColumn(name = "unidad_de_medida_id", nullable = false)
    private UnidadDeMedida unidadDeMedida;

}
