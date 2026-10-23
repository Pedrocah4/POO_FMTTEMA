package com.fmttema.api.services;

import com.fmttema.api.dto.InscricaoRequestDTO;
import com.fmttema.api.dto.InscricaoResponseDTO;
import com.fmttema.api.exceptions.PagamentoPendenteException;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.Inscricao;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.InscricaoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class InscricaoService {

    private final InscricaoRepository inscricaoRepository;
    private final EventoRepository eventoRepository;
    private final AtletaRepository atletaRepository;
    private final CategoriaPesoRepository categoriaPesoRepository;

    public InscricaoService(
            InscricaoRepository inscricaoRepository,
            EventoRepository eventoRepository,
            AtletaRepository atletaRepository,
            CategoriaPesoRepository categoriaPesoRepository
    ) {
        this.inscricaoRepository = inscricaoRepository;
        this.eventoRepository = eventoRepository;
        this.atletaRepository = atletaRepository;
        this.categoriaPesoRepository = categoriaPesoRepository;
    }

    /**
     * Realiza a inscrição de um atleta em um evento com validação estrita de pagamento e peso.
     * Regra 1: Bloqueia (403 Forbidden) se o status_pagamento do atleta estiver pendente.
     * Regra 2: Vincula automaticamente o atleta à categoria correta lendo o peso do perfil.
     */
    @Transactional
    public InscricaoResponseDTO inscreverAtleta(Long eventoId, InscricaoRequestDTO dto, String emailUsuarioAutenticado) {
        // 1. Localiza o Evento
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado com o ID: " + eventoId));

        if (evento.getStatus() == StatusEvento.FINALIZADO) {
            throw new IllegalStateException("Não é possível realizar inscrições em um evento já finalizado.");
        }

        // 2. Localiza o Atleta (via DTO atletaId ou pelo e-mail do usuário autenticado)
        Atleta atleta;
        if (dto != null && dto.atletaId() != null) {
            atleta = atletaRepository.findById(dto.atletaId())
                    .or(() -> atletaRepository.findByUsuarioId(dto.atletaId()))
                    .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado com o ID informado: " + dto.atletaId()));
        } else if (emailUsuarioAutenticado != null && !emailUsuarioAutenticado.isBlank()) {
            atleta = atletaRepository.findByUsuarioEmail(emailUsuarioAutenticado)
                    .orElseThrow(() -> new EntityNotFoundException("Nenhum atleta vinculado ao usuário autenticado: " + emailUsuarioAutenticado));
        } else {
            throw new IllegalArgumentException("Identificação do atleta ausente na requisição.");
        }

        // 3. Regra de Negócio 1: Bloquear se o status_pagamento estiver pendente
        if (atleta.getStatusPagamento() == null || atleta.getStatusPagamento() == StatusPagamento.PENDENTE) {
            throw new PagamentoPendenteException(
                    "Inscrição negada: O atleta " + atleta.getNome() + " possui pendências na anuidade/pagamento. Regularize o status_pagamento para prosseguir."
            );
        }

        // 4. Validação de inscrição duplicada
        if (inscricaoRepository.existsByAtletaIdAndEventoId(atleta.getId(), evento.getId())) {
            throw new IllegalStateException("O atleta " + atleta.getNome() + " já está inscrito neste evento.");
        }

        // 5. Regra de Negócio 2: Vincular à categoria correta pelo peso do atleta
        if (atleta.getPeso() == null || atleta.getPeso() <= 0) {
            throw new IllegalArgumentException("O atleta precisa ter o peso corporal devidamente cadastrado no perfil.");
        }

        List<CategoriaPeso> categoriasDisponiveis = (evento.getCategorias() != null && !evento.getCategorias().isEmpty())
                ? evento.getCategorias()
                : categoriaPesoRepository.findAll();

        if (categoriasDisponiveis.isEmpty()) {
            throw new IllegalStateException("Não há categorias de peso cadastradas para este torneio.");
        }

        // Encontra a menor categoria de peso cujo limite superior comporta o peso do atleta
        CategoriaPeso categoriaCompativel = categoriasDisponiveis.stream()
                .filter(cat -> cat.getPesoMaximo() != null && cat.getPesoMaximo() >= atleta.getPeso())
                .min(Comparator.comparingDouble(CategoriaPeso::getPesoMaximo))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Peso do atleta (" + atleta.getPeso() + " kg) excede o limite máximo de todas as categorias disponíveis no torneio."
                ));

        // 6. Cria e persiste a inscrição
        Inscricao novaInscricao = new Inscricao(atleta, evento, categoriaCompativel);
        Inscricao inscricaoSalva = inscricaoRepository.save(novaInscricao);

        return InscricaoResponseDTO.fromEntity(inscricaoSalva);
    }

    /**
     * Lista todas as inscrições homologadas para um evento específico.
     */
    @Transactional(readOnly = true)
    public List<InscricaoResponseDTO> listarInscricoesPorEvento(Long eventoId) {
        if (!eventoRepository.existsById(eventoId)) {
            throw new EntityNotFoundException("Evento não encontrado com o ID: " + eventoId);
        }
        return inscricaoRepository.findByEventoId(eventoId).stream()
                .map(InscricaoResponseDTO::fromEntity)
                .toList();
    }
}
