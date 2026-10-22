package com.fmttema.api.repositories;

import com.fmttema.api.models.CategoriaPeso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaPesoRepository extends JpaRepository<CategoriaPeso, Long> {
    Optional<CategoriaPeso> findByNome(String nome);
    List<CategoriaPeso> findByNomeContainingIgnoreCase(String termo);
    boolean existsByNome(String nome);
}
