package com.restaurante.api.repository;

import java.util.Optional;

import com.restaurante.api.entity.TipoDeMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoDeMovimientoRepository extends JpaRepository<TipoDeMovimiento, Long> {
    Optional<TipoDeMovimiento> findByNombre(String nombre);
}

