package com.fmttema.api.repositories;

import com.fmttema.api.models.Inscricao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InscricaoRepository extends JpaRepository<Inscricao, Long> {
    boolean existsByAtletaIdAndEventoId(Long atletaId, Long eventoId);
    Optional<Inscricao> findByAtletaIdAndEventoId(Long atletaId, Long eventoId);
    List<Inscricao> findByEventoId(Long eventoId);
    List<Inscricao> findByAtletaId(Long atletaId);
}
