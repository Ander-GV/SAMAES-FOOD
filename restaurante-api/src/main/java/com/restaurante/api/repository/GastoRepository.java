package com.restaurante.api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurante.api.entity.Gasto;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByFechaBetweenOrderByFechaDesc(LocalDateTime inicio, LocalDateTime fin);

    List<Gasto> findByEmpleadoIdOrderByFechaDesc(Long empleadoId);
}
