package com.restaurante.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurante.api.entity.Ingredientes;

@Repository
public interface IngredientesRepository extends JpaRepository<Ingredientes, Long> {

    boolean existsByUnidadDeMedidaId(Long unidadDeMedidaId);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    List<Ingredientes> findByStockLessThanEqualOrderByStockAsc(Integer limiteStock);
}
