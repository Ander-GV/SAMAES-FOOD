package com.restaurante.api.repository;

import com.restaurante.api.entity.Proveedores;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedoresRepository extends JpaRepository<Proveedores, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    boolean existsByNitIgnoreCase(String nit);

    boolean existsByNitIgnoreCaseAndIdNot(String nit, Long id);
}
