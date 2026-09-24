package com.restaurante.api.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurante.api.entity.IngredientesAndProductos;

@Repository
public interface IngredientesAndProductosRepository extends JpaRepository<IngredientesAndProductos, Long> {

    boolean existsByIngredientesId(Long ingredientesId);

    List<IngredientesAndProductos> findByProductosId(Long productoId);
}

