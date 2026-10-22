package com.fmttema.api.services;

import com.fmttema.api.dto.EventoRequestDTO;
import com.fmttema.api.dto.EventoResponseDTO;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import com.fmttema.api.repositories.EventoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final CategoriaPesoRepository categoriaPesoRepository;

    public EventoService(EventoRepository eventoRepository, CategoriaPesoRepository categoriaPesoRepository) {
        this.eventoRepository = eventoRepository;
        this.categoriaPesoRepository = categoriaPesoRepository;
    }

    /**
     * Cria um novo evento/torneio chancelado pela FMTTEMA.
     * Bloqueia eventos com datas retroativas conforme convenção obrigatória.
     */
    @Transactional
    public EventoResponseDTO criarEvento(EventoRequestDTO dto) {
        if (dto.data() != null && dto.data().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Não é permitido criar eventos com datas retroativas (no passado)");
        }

        Evento evento = new Evento();
        evento.setNome(dto.nome());
        evento.setData(dto.data());
        evento.setLocal(dto.local());
        evento.setDescricao(dto.descricao());
        evento.setStatus(dto.status() != null ? dto.status() : StatusEvento.AGENDADO);

        if (dto.categoriasIds() != null && !dto.categoriasIds().isEmpty()) {
            List<CategoriaPeso> categorias = categoriaPesoRepository.findAllById(dto.categoriasIds());
            for (CategoriaPeso cat : categorias) {
                evento.adicionarCategoria(cat);
            }
        }

        Evento eventoSalvo = eventoRepository.save(evento);
        return EventoResponseDTO.fromEntity(eventoSalvo);
    }

    /**
     * Retorna a lista de eventos ordenada por data crescente (próximos eventos primeiro).
     */
    @Transactional(readOnly = true)
    public List<EventoResponseDTO> listarEventos() {
        return eventoRepository.findAll(Sort.by(Sort.Direction.ASC, "data")).stream()
                .map(EventoResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Busca um evento específico por ID com suas respectivas categorias.
     */
    @Transactional(readOnly = true)
    public EventoResponseDTO buscarPorId(Long id) {
        Evento evento = eventoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado com o ID: " + id));
        return EventoResponseDTO.fromEntity(evento);
    }
}
