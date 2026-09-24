package com.restaurante.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurante.api.entity.Productos;

@Repository
public interface ProductosRepository extends JpaRepository<Productos, Long> {

    boolean existsByCategoriaId(Long categoriaId);
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
    boolean existsByNombreIgnoreCaseAndCategoriaId(String nombre, Long categoriaId);
    boolean existsByNombreIgnoreCaseAndCategoriaIdAndIdNot(String nombre, Long categoriaId, Long id);
}
