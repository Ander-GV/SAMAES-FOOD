package com.restaurante.api.repository;

import com.restaurante.api.entity.EstadoDelPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstadoDelPedidoRepository extends JpaRepository<EstadoDelPedido, Long> {
}
