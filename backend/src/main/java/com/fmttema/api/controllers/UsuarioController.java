package com.fmttema.api.controllers;

import com.fmttema.api.dto.AtualizarStatusUsuarioDTO;
import com.fmttema.api.dto.UsuarioResponseDTO;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.services.UsuarioService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/pendentes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarPendentes() {
        List<UsuarioResponseDTO> pendentes = usuarioService.listarPendentes();
        return ResponseEntity.ok(pendentes);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> alterarStatus(
            @PathVariable Long id,
            @RequestBody @Valid AtualizarStatusUsuarioDTO dto
    ) {
        try {
            Usuario usuarioAtualizado = usuarioService.atualizarStatus(id, dto.status());
            return ResponseEntity.ok(UsuarioResponseDTO.fromEntity(usuarioAtualizado));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }
}
