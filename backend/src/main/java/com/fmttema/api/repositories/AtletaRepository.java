package com.fmttema.api.repositories;

import com.fmttema.api.models.Atleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtletaRepository extends JpaRepository<Atleta, Long> {
    List<Atleta> findByAcademiaId(Long academiaId);
    Optional<Atleta> findByCpf(String cpf);
    Optional<Atleta> findByUsuarioId(Long usuarioId);
}
