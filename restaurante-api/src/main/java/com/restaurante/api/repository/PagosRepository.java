package com.restaurante.api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurante.api.entity.Pagos;

@Repository
public interface PagosRepository extends JpaRepository<Pagos, Long> {

    List<Pagos> findByPedidoId(Long pedidoId);

    List<Pagos> findByUsuarioId(Long usuarioId);

    List<Pagos> findByUsuarioIdAndFechaPagoBetween(Long usuarioId, LocalDateTime inicio, LocalDateTime fin);

    List<Pagos> findByFechaPagoBetween(LocalDateTime inicio, LocalDateTime fin);
}
