package com.fmttema.api.services;

import com.fmttema.api.dto.UsuarioResponseDTO;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AtletaRepository atletaRepository;
    private final AcademiaRepository academiaRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            AtletaRepository atletaRepository,
            AcademiaRepository academiaRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.atletaRepository = atletaRepository;
        this.academiaRepository = academiaRepository;
    }

    /**
     * Atualiza o status de credenciamento do usuário garantindo transação ACID.
     */
    @Transactional
    public Usuario atualizarStatus(Long id, StatusUsuario novoStatus) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o ID: " + id));

        usuario.setStatus(novoStatus);
        return usuarioRepository.save(usuario);
    }

    /**
     * Lista todos os usuários com status pendente de aprovação, enriquecidos com nome e documento.
     */
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarPendentes() {
        List<Usuario> pendentes = usuarioRepository.findByStatusIn(
                List.of(StatusUsuario.PENDENTE_APROVACAO, StatusUsuario.PENDENTE)
        );

        return pendentes.stream().map(usuario -> {
            String nome = usuario.getNome();
            String documento = usuario.getNumeroLicenca();

            if (usuario.getPerfil() == PerfilAcesso.ATLETA) {
                var atletaOpt = atletaRepository.findByUsuarioId(usuario.getId());
                if (atletaOpt.isPresent()) {
                    nome = atletaOpt.get().getNome();
                    documento = atletaOpt.get().getCpf();
                }
            } else if (usuario.getPerfil() == PerfilAcesso.ACADEMIA) {
                var academiaOpt = academiaRepository.findByUsuarioId(usuario.getId());
                if (academiaOpt.isPresent()) {
                    nome = academiaOpt.get().getNome();
                    documento = academiaOpt.get().getCidade();
                }
            }

            return UsuarioResponseDTO.fromEntity(
                    usuario,
                    nome != null ? nome : usuario.getEmail(),
                    documento != null ? documento : "-"
            );
        }).toList();
    }
}
