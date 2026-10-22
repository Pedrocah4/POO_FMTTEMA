package com.fmttema.api.repositories;

import com.fmttema.api.models.Evento;
import com.fmttema.api.models.StatusEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByStatus(StatusEvento status);
    List<Evento> findByNomeContainingIgnoreCase(String nome);
}
