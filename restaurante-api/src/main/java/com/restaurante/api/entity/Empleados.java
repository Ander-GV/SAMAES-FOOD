package com.restaurante.api.entity;

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
@Table(name = "empleados")
@Setter @Getter
@AllArgsConstructor
@NoArgsConstructor
public class Empleados {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "apellido", nullable = true)
    private String apellido;

    @Column(name = "email", nullable = true)
    private String email;

    @Column(name = "telefono", nullable = true)
    private String telefono;

    @Column(name = "documento", nullable = true)
    private String documento;

    @Column(name = "cargo", nullable = true)
    private String cargo;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;
}