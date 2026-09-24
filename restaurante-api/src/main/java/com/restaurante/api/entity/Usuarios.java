package com.restaurante.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Setter @Getter
@AllArgsConstructor
@NoArgsConstructor
public class Usuarios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "codigo_empleado", nullable = false, unique = true)
    private String codigoEmpleado;

    @OneToOne
    @JoinColumn(name = "empleados_id", unique = true)
    private Empleados empleados;

    @ManyToOne
    @JoinColumn(name = "roles_id")
    private Roles roles;

}
