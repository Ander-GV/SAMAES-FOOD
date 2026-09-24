package com.restaurante.api.repository;

import com.restaurante.api.entity.TipoDePedidos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoDePedidosRepository extends JpaRepository<TipoDePedidos, Long> {
}
