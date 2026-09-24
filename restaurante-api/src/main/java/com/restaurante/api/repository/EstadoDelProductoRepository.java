package com.restaurante.api.repository;

import com.restaurante.api.entity.EstadoDelProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoDelProductoRepository extends JpaRepository<EstadoDelProducto, Long> {
}
