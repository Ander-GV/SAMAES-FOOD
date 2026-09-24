package com.restaurante.api.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "unidad_de_medida")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class UnidadDeMedida {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;

    @Column(name = "abreviatura", nullable = false, unique = true)
    private String abreviatura;

    @Column(name = "factor_de_conversion", nullable = false)
    private BigDecimal factorDeConversion;

    @Column(name = "tipo_de_unidad")
    private String tipoDeUnidad; // "PESO", "LIQUIDO", "UNIDAD"
}
