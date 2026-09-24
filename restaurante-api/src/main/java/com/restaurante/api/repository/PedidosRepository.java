package com.restaurante.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurante.api.entity.Pedidos;

@Repository
public interface PedidosRepository extends JpaRepository<Pedidos, Long> {
    boolean existsById(Long id);

    boolean existsByMesaId(Long mesaId);

    boolean existsByClienteId(Long clienteId);
}
