package com.restaurante.api.repository;

import com.restaurante.api.entity.TipoDePago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoDePagoRepository extends JpaRepository<TipoDePago, Long> {
}
