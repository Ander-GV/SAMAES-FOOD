package com.restaurante.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurante.api.entity.UnidadDeMedida;

@Repository
public interface UnidadDeMedidaRepository extends JpaRepository<UnidadDeMedida, Long> {
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
    boolean existsByAbreviaturaIgnoreCaseAndIdNot(String abreviatura, Long id);
}
