package com.fmttema.api.dto;

import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;

import java.time.LocalDate;

public record AtletaResponseDTO(
        Long id,
        String nome,
        String apelido,
        String cpf,
        Double peso,
        String categoria,
        LocalDate dataNascimento,
        String graduacao,
        String kruang,
        Integer vitorias,
        Integer derrotas,
        Integer empates,
        String email,
        StatusUsuario status,
        StatusPagamento statusPagamento,
        Long academiaId,
        String academiaNome
) {
    public static AtletaResponseDTO fromEntity(Atleta atleta) {
        return new AtletaResponseDTO(
                atleta.getId(),
                atleta.getNome(),
                atleta.getApelido(),
                atleta.getCpf(),
                atleta.getPeso(),
                atleta.getCategoria(),
                atleta.getDataNascimento(),
                atleta.getGraduacao(),
                atleta.getKruang(),
                atleta.getVitorias(),
                atleta.getDerrotas(),
                atleta.getEmpates(),
                atleta.getUsuario() != null ? atleta.getUsuario().getEmail() : null,
                atleta.getUsuario() != null ? atleta.getUsuario().getStatus() : null,
                atleta.getStatusPagamento() != null ? atleta.getStatusPagamento() : StatusPagamento.PENDENTE,
                atleta.getAcademia() != null ? atleta.getAcademia().getId() : null,
                atleta.getAcademia() != null ? atleta.getAcademia().getNome() : null
        );
    }
}
