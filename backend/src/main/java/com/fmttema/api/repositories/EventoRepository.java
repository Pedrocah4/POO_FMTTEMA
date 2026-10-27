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

    Long countByStatus(StatusEvento status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) FROM Evento e WHERE e.status = 'AGENDADO' OR e.status = 'EM_ANDAMENTO'")
    Long countEventosAtivos();
}
