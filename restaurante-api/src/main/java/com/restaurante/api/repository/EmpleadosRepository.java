package com.restaurante.api.repository;

import com.restaurante.api.entity.Empleados;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpleadosRepository extends JpaRepository<Empleados, Long> {
}
