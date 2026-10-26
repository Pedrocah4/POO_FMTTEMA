package com.fmttema.api.services;

import com.fmttema.api.dto.EscalaArbitroRequestDTO;
import com.fmttema.api.dto.EscalaArbitroResponseDTO;
import com.fmttema.api.models.EscalaArbitro;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusPresencaArbitro;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.EscalaArbitroRepository;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EscalaArbitroService {

    private final EscalaArbitroRepository escalaArbitroRepository;
    private final UsuarioRepository usuarioRepository;
    private final EventoRepository eventoRepository;

    public EscalaArbitroService(
            EscalaArbitroRepository escalaArbitroRepository,
            UsuarioRepository usuarioRepository,
            EventoRepository eventoRepository
    ) {
        this.escalaArbitroRepository = escalaArbitroRepository;
        this.usuarioRepository = usuarioRepository;
        this.eventoRepository = eventoRepository;
    }

    /**
     * Lista as escalas do árbitro autenticado (filtrado estritamente pelo ID do Token JWT).
     */
    @Transactional(readOnly = true)
    public List<EscalaArbitroResponseDTO> listarMinhasEscalas(Long arbitroId) {
        List<EscalaArbitro> escalas = escalaArbitroRepository.findByArbitroIdComEvento(arbitroId);
        return escalas.stream()
                .map(EscalaArbitroResponseDTO::fromEntity)
                .toList();
    }

    /**
     * Confirma ou altera o status de presença de uma convocação específica do árbitro autenticado.
     */
    @Transactional
    public EscalaArbitroResponseDTO alterarPresenca(Long escalaId, Long arbitroId, StatusPresencaArbitro novoStatus) {
        EscalaArbitro escala = escalaArbitroRepository.findById(escalaId)
                .orElseThrow(() -> new EntityNotFoundException("Escala não encontrada para o ID: " + escalaId));

        if (!escala.getArbitro().getId().equals(arbitroId)) {
            throw new IllegalArgumentException("Acesso negado: a escala informada não pertence ao árbitro autenticado.");
        }

        StatusPresencaArbitro statusFinal = novoStatus != null ? novoStatus : StatusPresencaArbitro.CONFIRMADO;
        escala.setStatus(statusFinal);

        if (statusFinal == StatusPresencaArbitro.CONFIRMADO) {
            escala.setDataConfirmacao(LocalDateTime.now());
        }

        EscalaArbitro atualizada = escalaArbitroRepository.save(escala);
        return EscalaArbitroResponseDTO.fromEntity(atualizada);
    }

    /**
     * Permite ao Administrador convocar/escalar um árbitro para um evento.
     */
    @Transactional
    public EscalaArbitroResponseDTO convocarArbitro(EscalaArbitroRequestDTO dto) {
        Usuario arbitro = usuarioRepository.findById(dto.arbitroId())
                .orElseThrow(() -> new EntityNotFoundException("Árbitro não encontrado com ID: " + dto.arbitroId()));

        if (arbitro.getPerfil() != PerfilAcesso.ARBITRO && arbitro.getPerfil() != PerfilAcesso.ADMIN) {
            throw new IllegalArgumentException("O usuário selecionado não possui perfil de Árbitro.");
        }

        Evento evento = eventoRepository.findById(dto.eventoId())
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado com ID: " + dto.eventoId()));

        if (escalaArbitroRepository.existsByArbitroIdAndEventoId(dto.arbitroId(), dto.eventoId())) {
            throw new IllegalStateException("Este árbitro já está escalado para este evento.");
        }

        EscalaArbitro novaEscala = new EscalaArbitro(
                arbitro,
                evento,
                dto.funcao() != null && !dto.funcao().isBlank() ? dto.funcao() : "Árbitro Central"
        );
        novaEscala.setObservacoes(dto.observacoes());

        EscalaArbitro salva = escalaArbitroRepository.save(novaEscala);
        return EscalaArbitroResponseDTO.fromEntity(salva);
    }

    /**
     * Lista todas as escalas de árbitros para um determinado evento (visão do Admin).
     */
    @Transactional(readOnly = true)
    public List<EscalaArbitroResponseDTO> listarEscalasPorEvento(Long eventoId) {
        if (!eventoRepository.existsById(eventoId)) {
            throw new EntityNotFoundException("Evento não encontrado com ID: " + eventoId);
        }
        return escalaArbitroRepository.findByEventoIdComArbitro(eventoId)
                .stream()
                .map(EscalaArbitroResponseDTO::fromEntity)
                .toList();
    }
}
