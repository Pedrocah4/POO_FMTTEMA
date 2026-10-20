package com.fmttema.api.repositories;

import com.fmttema.api.models.Academia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademiaRepository extends JpaRepository<Academia, Long> {
    Optional<Academia> findByNome(String nome);
    Optional<Academia> findByUsuarioId(Long usuarioId);
}
