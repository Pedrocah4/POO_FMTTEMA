package com.fmttema.api.services;

import com.fmttema.api.dto.PatrocinadorRequestDTO;
import com.fmttema.api.dto.PatrocinadorResponseDTO;
import com.fmttema.api.models.Patrocinador;
import com.fmttema.api.repositories.PatrocinadorRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class PatrocinadorService {

    private final PatrocinadorRepository patrocinadorRepository;
    private final FileUploadService fileUploadService;

    public PatrocinadorService(PatrocinadorRepository patrocinadorRepository, FileUploadService fileUploadService) {
        this.patrocinadorRepository = patrocinadorRepository;
        this.fileUploadService = fileUploadService;
    }

    @Transactional(readOnly = true)
    public List<PatrocinadorResponseDTO> listarTodos() {
        return patrocinadorRepository.findAllByOrderByOrdemExibicaoAscIdDesc()
                .stream()
                .map(PatrocinadorResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PatrocinadorResponseDTO> listarAtivos() {
        return patrocinadorRepository.findByAtivoTrueOrderByOrdemExibicaoAsc()
                .stream()
                .map(PatrocinadorResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public PatrocinadorResponseDTO buscarPorId(Long id) {
        Patrocinador patrocinador = patrocinadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado com o ID: " + id));
        return PatrocinadorResponseDTO.fromEntity(patrocinador);
    }

    @Transactional
    public PatrocinadorResponseDTO criar(PatrocinadorRequestDTO dto, MultipartFile logoFile) {
        String logoUrl = null;

        if (logoFile != null && !logoFile.isEmpty()) {
            try {
                logoUrl = fileUploadService.salvarLogomarca(logoFile);
            } catch (IOException e) {
                throw new RuntimeException("Erro ao processar upload da logomarca: " + e.getMessage(), e);
            }
        } else if (dto.logoUrl() != null && !dto.logoUrl().isBlank()) {
            logoUrl = dto.logoUrl().trim();
        }

        if (logoUrl == null || logoUrl.isBlank()) {
            throw new IllegalArgumentException("A logomarca é obrigatória (arquivo de upload ou link direto da imagem).");
        }

        Patrocinador patrocinador = new Patrocinador(
                dto.nome().trim(),
                dto.siteUrl() != null ? dto.siteUrl().trim() : null,
                logoUrl,
                dto.categoria() != null ? dto.categoria().trim() : "Apoiador Oficial",
                dto.ativo() != null ? dto.ativo() : true,
                dto.ordemExibicao() != null ? dto.ordemExibicao() : 0
        );

        Patrocinador salvo = patrocinadorRepository.save(patrocinador);
        return PatrocinadorResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public PatrocinadorResponseDTO atualizar(Long id, PatrocinadorRequestDTO dto, MultipartFile logoFile) {
        Patrocinador patrocinador = patrocinadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado com o ID: " + id));

        if (dto.nome() != null && !dto.nome().isBlank()) {
            patrocinador.setNome(dto.nome().trim());
        }

        if (dto.siteUrl() != null) {
            patrocinador.setSiteUrl(dto.siteUrl().trim());
        }

        if (dto.categoria() != null) {
            patrocinador.setCategoria(dto.categoria().trim());
        }

        if (dto.ativo() != null) {
            patrocinador.setAtivo(dto.ativo());
        }

        if (dto.ordemExibicao() != null) {
            patrocinador.setOrdemExibicao(dto.ordemExibicao());
        }

        if (logoFile != null && !logoFile.isEmpty()) {
            try {
                String novoLogoUrl = fileUploadService.salvarLogomarca(logoFile);
                fileUploadService.excluirArquivoSeExistir(patrocinador.getLogoUrl());
                patrocinador.setLogoUrl(novoLogoUrl);
            } catch (IOException e) {
                throw new RuntimeException("Erro ao substituir upload da logomarca: " + e.getMessage(), e);
            }
        } else if (dto.logoUrl() != null && !dto.logoUrl().isBlank()) {
            patrocinador.setLogoUrl(dto.logoUrl().trim());
        }

        Patrocinador atualizado = patrocinadorRepository.save(patrocinador);
        return PatrocinadorResponseDTO.fromEntity(atualizado);
    }

    @Transactional
    public PatrocinadorResponseDTO alterarStatus(Long id, Boolean ativo) {
        Patrocinador patrocinador = patrocinadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado com o ID: " + id));

        patrocinador.setAtivo(ativo != null ? ativo : !patrocinador.getAtivo());
        Patrocinador salvo = patrocinadorRepository.save(patrocinador);
        return PatrocinadorResponseDTO.fromEntity(salvo);
    }

    @Transactional
    public void excluir(Long id) {
        Patrocinador patrocinador = patrocinadorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patrocinador não encontrado com o ID: " + id));

        fileUploadService.excluirArquivoSeExistir(patrocinador.getLogoUrl());
        patrocinadorRepository.delete(patrocinador);
    }
}
