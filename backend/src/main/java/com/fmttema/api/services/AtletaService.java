package com.fmttema.api.services;

import com.fmttema.api.dto.AtletaResponseDTO;
import com.fmttema.api.dto.AtualizarCartelDTO;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.repositories.AtletaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AtletaService {

    private final AtletaRepository atletaRepository;

    public AtletaService(AtletaRepository atletaRepository) {
        this.atletaRepository = atletaRepository;
    }

    /**
     * Atualiza o cartel e a graduação (Kruang) do atleta com garantia de transação ACID.
     * O mapeamento do DTO ocorre dentro da transação para evitar LazyInitializationException.
     */
    @Transactional
    public AtletaResponseDTO atualizarCartel(Long id, AtualizarCartelDTO dto) {
        Atleta atleta = atletaRepository.findById(id)
                .or(() -> atletaRepository.findByUsuarioId(id))
                .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado com o ID ou Usuário ID: " + id));

        if (dto.vitorias() != null) {
            atleta.setVitorias(dto.vitorias());
        }
        if (dto.derrotas() != null) {
            atleta.setDerrotas(dto.derrotas());
        }
        if (dto.empates() != null) {
            atleta.setEmpates(dto.empates());
        }
        if (dto.kruang() != null && !dto.kruang().isBlank()) {
            atleta.setKruang(dto.kruang());
        } else if (dto.graduacao() != null && !dto.graduacao().isBlank()) {
            atleta.setGraduacao(dto.graduacao());
        }

        Atleta atletaSalvo = atletaRepository.save(atleta);
        return AtletaResponseDTO.fromEntity(atletaSalvo);
    }

    @Transactional(readOnly = true)
    public List<AtletaResponseDTO> listarTodos() {
        return atletaRepository.findAll().stream()
                .map(AtletaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public AtletaResponseDTO buscarPorId(Long id) {
        Atleta atleta = atletaRepository.findById(id)
                .or(() -> atletaRepository.findByUsuarioId(id))
                .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado com o ID: " + id));
        return AtletaResponseDTO.fromEntity(atleta);
    }

    @Transactional(readOnly = true)
    public AtletaResponseDTO buscarPorEmailUsuario(String email) {
        Atleta atleta = atletaRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado para o e-mail: " + email));
        return AtletaResponseDTO.fromEntity(atleta);
    }

    @Transactional
    public AtletaResponseDTO atualizarStatusPagamento(Long id, StatusPagamento status) {
        Atleta atleta = atletaRepository.findById(id)
                .or(() -> atletaRepository.findByUsuarioId(id))
                .orElseThrow(() -> new EntityNotFoundException("Atleta não encontrado com o ID: " + id));
        atleta.setStatusPagamento(status);
        Atleta salvo = atletaRepository.save(atleta);
        return AtletaResponseDTO.fromEntity(salvo);
    }
}
