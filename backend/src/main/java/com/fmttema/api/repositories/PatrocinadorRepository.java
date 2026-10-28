package com.fmttema.api.repositories;

import com.fmttema.api.models.Patrocinador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatrocinadorRepository extends JpaRepository<Patrocinador, Long> {

    List<Patrocinador> findByAtivoTrueOrderByOrdemExibicaoAsc();

    List<Patrocinador> findAllByOrderByOrdemExibicaoAscIdDesc();

    boolean existsByNomeIgnoreCase(String nome);
}
