package com.restaurante.api.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurante.api.entity.DetalleDelPedido;

@Repository
public interface DetalleDelPedidoRepository extends JpaRepository<DetalleDelPedido, Long> {
    boolean existsById(Long id);
    boolean existsByPedidoId(Long pedidoId);
    boolean existsByProductoId(Long productoId);
    List<DetalleDelPedido> findByPedidoId(Long pedidoId);
}

