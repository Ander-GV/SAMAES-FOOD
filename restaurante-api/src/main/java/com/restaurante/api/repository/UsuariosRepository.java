package com.restaurante.api.repository;

import java.util.Optional;

import com.restaurante.api.entity.Usuarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuariosRepository extends JpaRepository<Usuarios, Long> {
    Optional<Usuarios> findByCodigoEmpleado(String codigoEmpleado);
    Optional<Usuarios> findByEmpleadosId(Long empleadosId);
}

