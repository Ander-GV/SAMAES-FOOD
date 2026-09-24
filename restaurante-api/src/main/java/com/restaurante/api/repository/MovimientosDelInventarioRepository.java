package com.restaurante.api.repository;

import com.restaurante.api.entity.MovimientosDelInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovimientosDelInventarioRepository extends JpaRepository<MovimientosDelInventario, Long> {

    boolean existsByProveedorId(Long proveedorId);
    boolean existsByPedidoId(Long pedidoId);
}

