package com.restaurante.api.repository;

import com.restaurante.api.entity.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion, Long> {

    Optional<Promocion> findByCodigoCuponAndActivaTrue(String codigoCupon);

    List<Promocion> findByActivaTrue();

    @Query("SELECT p FROM Promocion p WHERE p.activa = true " +
           "AND (p.fechaInicio IS NULL OR p.fechaInicio <= :fechaActual) " +
           "AND (p.fechaFin IS NULL OR p.fechaFin >= :fechaActual) " +
           "AND p.montoMinimoPedido IS NOT NULL " +
           "AND :subtotal >= p.montoMinimoPedido " +
           "ORDER BY p.montoMinimoPedido DESC")
    List<Promocion> findPromocionesElegiblesPorMonto(
            @Param("subtotal") BigDecimal subtotal,
            @Param("fechaActual") LocalDateTime fechaActual
    );
}
