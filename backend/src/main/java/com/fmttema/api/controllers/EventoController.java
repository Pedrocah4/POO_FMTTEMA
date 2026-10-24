package com.fmttema.api.controllers;

import com.fmttema.api.dto.ChaveamentoResponseDTO;
import com.fmttema.api.dto.EventoRequestDTO;
import com.fmttema.api.dto.EventoResponseDTO;
import com.fmttema.api.dto.InscricaoRequestDTO;
import com.fmttema.api.dto.InscricaoResponseDTO;
import com.fmttema.api.exceptions.PagamentoPendenteException;
import com.fmttema.api.services.EventoService;
import com.fmttema.api.services.GeradorChavesService;
import com.fmttema.api.services.InscricaoService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService eventoService;
    private final InscricaoService inscricaoService;
    private final GeradorChavesService geradorChavesService;

    public EventoController(
            EventoService eventoService,
            InscricaoService inscricaoService,
            GeradorChavesService geradorChavesService
    ) {
        this.eventoService = eventoService;
        this.inscricaoService = inscricaoService;
        this.geradorChavesService = geradorChavesService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> criarEvento(@RequestBody @Valid EventoRequestDTO dto) {
        try {
            EventoResponseDTO response = eventoService.criarEvento(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Data inválida",
                    "mensagem", e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<List<EventoResponseDTO>> listarEventos() {
        return ResponseEntity.ok(eventoService.listarEventos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        try {
            EventoResponseDTO response = eventoService.buscarPorId(id);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint de inscrição no evento com validação estrita de pagamento (403) e peso compatível.
     */
    @PostMapping("/{id}/inscrever")
    public ResponseEntity<?> inscreverAtleta(
            @PathVariable Long id,
            @RequestBody(required = false) InscricaoRequestDTO dto,
            Authentication authentication
    ) {
        try {
            String email = authentication != null ? authentication.getName() : null;
            InscricaoResponseDTO inscricao = inscricaoService.inscreverAtleta(id, dto, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(inscricao);
        } catch (PagamentoPendenteException e) {
            // Regra de Negócio 1: Retornar erro 403 Forbidden se o status_pagamento estiver pendente
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "erro", "Inscrição negada",
                    "mensagem", e.getMessage()
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Requisição inválida",
                    "mensagem", e.getMessage()
            ));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Lista todas as inscrições confirmadas para um evento específico.
     */
    @GetMapping("/{id}/inscricoes")
    public ResponseEntity<?> listarInscricoesPorEvento(@PathVariable Long id) {
        try {
            List<InscricaoResponseDTO> inscricoes = inscricaoService.listarInscricoesPorEvento(id);
            return ResponseEntity.ok(inscricoes);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Gera o chaveamento oficial do evento com cruzamento de ranking e regra do Bye (US07).
     */
    @PostMapping({"/{id}/chaves", "/{id}/gerar-chaves"})
    @PreAuthorize("hasAnyRole('ADMIN', 'TREINADOR')")
    public ResponseEntity<?> gerarChaves(@PathVariable Long id) {
        try {
            ChaveamentoResponseDTO chaveamento = geradorChavesService.gerarChavesPorEvento(id);
            return ResponseEntity.ok(chaveamento);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Consulta as chaves geradas e emparelhamento de lutas do evento.
     */
    @GetMapping("/{id}/chaves")
    public ResponseEntity<?> consultarChaves(@PathVariable Long id) {
        try {
            ChaveamentoResponseDTO chaveamento = geradorChavesService.gerarChavesPorEvento(id);
            return ResponseEntity.ok(chaveamento);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }
}
