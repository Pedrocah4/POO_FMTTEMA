package com.fmttema.api.services;

import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
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
}
