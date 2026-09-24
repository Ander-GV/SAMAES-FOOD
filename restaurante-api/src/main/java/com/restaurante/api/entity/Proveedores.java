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
@Table(name = "proveedores")
@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class Proveedores {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nit")
    private String nit;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "telefono", nullable = false)
    private String telefono;

    @Column(name = "email")
    private String email;  
    
    @Column(name = "direccion")
    private String direccion;
}
