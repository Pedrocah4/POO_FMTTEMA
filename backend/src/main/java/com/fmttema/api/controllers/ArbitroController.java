package com.fmttema.api.controllers;

import com.fmttema.api.dto.EscalaArbitroRequestDTO;
import com.fmttema.api.dto.EscalaArbitroResponseDTO;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusPresencaArbitro;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.UsuarioRepository;
import com.fmttema.api.services.EscalaArbitroService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/arbitros")
public class ArbitroController {

    private final EscalaArbitroService escalaArbitroService;
    private final UsuarioRepository usuarioRepository;

    public ArbitroController(EscalaArbitroService escalaArbitroService, UsuarioRepository usuarioRepository) {
        this.escalaArbitroService = escalaArbitroService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Endpoint obrigatório da US08:
     * GET /api/arbitros/me/escalas
     * Lista apenas os eventos e escalas do árbitro autenticado (extraído do Token JWT).
     */
    @GetMapping("/me/escalas")
    public ResponseEntity<?> listarMinhasEscalas(Authentication authentication) {
        Usuario usuario = obterUsuarioAutenticado(authentication);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "erro", "Não autorizado",
                    "mensagem", "Usuário não autenticado"
            ));
        }

        List<EscalaArbitroResponseDTO> escalas = escalaArbitroService.listarMinhasEscalas(usuario.getId());
        return ResponseEntity.ok(escalas);
    }

    /**
     * Confirma a presença do árbitro na escala especificada:
     * PATCH /api/arbitros/me/escalas/{id}/confirmar
     */
    @PatchMapping("/me/escalas/{id}/confirmar")
    public ResponseEntity<?> confirmarPresenca(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = obterUsuarioAutenticado(authentication);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "erro", "Não autorizado",
                    "mensagem", "Usuário não autenticado"
            ));
        }

        try {
            EscalaArbitroResponseDTO atualizada = escalaArbitroService.alterarPresenca(id, usuario.getId(), StatusPresencaArbitro.CONFIRMADO);
            return ResponseEntity.ok(atualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "erro", "Acesso negado",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Recusa a presença do árbitro na escala especificada:
     * PATCH /api/arbitros/me/escalas/{id}/recusar
     */
    @PatchMapping("/me/escalas/{id}/recusar")
    public ResponseEntity<?> recusarPresenca(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = obterUsuarioAutenticado(authentication);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "erro", "Não autorizado",
                    "mensagem", "Usuário não autenticado"
            ));
        }

        try {
            EscalaArbitroResponseDTO atualizada = escalaArbitroService.alterarPresenca(id, usuario.getId(), StatusPresencaArbitro.RECUSADO);
            return ResponseEntity.ok(atualizada);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "erro", "Acesso negado",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Convocação de árbitro para evento (acesso restrito ao ADMIN).
     * POST /api/arbitros/escalas
     */
    @PostMapping("/escalas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> convocarArbitro(@RequestBody @Valid EscalaArbitroRequestDTO dto) {
        try {
            EscalaArbitroResponseDTO response = escalaArbitroService.convocarArbitro(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Requisição inválida",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Lista todas as escalas de árbitros de um determinado evento (Admin).
     * GET /api/arbitros/escalas/evento/{eventoId}
     */
    @GetMapping("/escalas/evento/{eventoId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listarEscalasPorEvento(@PathVariable Long eventoId) {
        try {
            List<EscalaArbitroResponseDTO> escalas = escalaArbitroService.listarEscalasPorEvento(eventoId);
            return ResponseEntity.ok(escalas);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }

    /**
     * Lista todos os usuários árbitros cadastrados (Admin).
     * GET /api/arbitros
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listarArbitros() {
        List<Usuario> arbitros = usuarioRepository.findAll().stream()
                .filter(u -> u.getPerfil() == PerfilAcesso.ARBITRO)
                .toList();
        return ResponseEntity.ok(arbitros);
    }

    private Usuario obterUsuarioAutenticado(Authentication authentication) {
        if (authentication == null) return null;
        if (authentication.getPrincipal() instanceof Usuario usuario) {
            return usuario;
        }
        if (authentication.getName() != null) {
            return usuarioRepository.findByEmail(authentication.getName()).orElse(null);
        }
        return null;
    }
}
