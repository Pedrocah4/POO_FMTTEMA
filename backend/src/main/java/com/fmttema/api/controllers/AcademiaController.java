package com.fmttema.api.controllers;

import com.fmttema.api.dto.AcademiaRequestDTO;
import com.fmttema.api.dto.AcademiaResponseDTO;
import com.fmttema.api.models.Academia;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/academias")
public class AcademiaController {

    private final AcademiaRepository academiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AcademiaController(
            AcademiaRepository academiaRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.academiaRepository = academiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> cadastrarAcademia(@RequestBody @Valid AcademiaRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Requisição inválida",
                    "mensagem", "O e-mail informado já está cadastrado"
            ));
        }

        String senhaCriptografada = passwordEncoder.encode(dto.senha());

        // Força status interno para PENDENTE_APROVACAO
        Usuario usuario = new Usuario(
                dto.email(),
                senhaCriptografada,
                PerfilAcesso.ACADEMIA,
                StatusUsuario.PENDENTE_APROVACAO
        );
        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        Academia academia = new Academia(
                dto.nome(),
                dto.responsavel(),
                dto.telefone(),
                dto.cidade(),
                usuarioSalvo
        );
        Academia academiaSalva = academiaRepository.save(academia);

        return ResponseEntity.status(HttpStatus.CREATED).body(AcademiaResponseDTO.fromEntity(academiaSalva));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<AcademiaResponseDTO>> listarAcademias() {
        List<AcademiaResponseDTO> lista = academiaRepository.findAllComUsuario().stream()
                .map(AcademiaResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/me")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ACADEMIA', 'ADMIN')")
    public ResponseEntity<AcademiaResponseDTO> obterMinhaAcademia(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new EntityNotFoundException("Usuário não autenticado");
        }
        Academia academia = academiaRepository.findByUsuarioEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("Perfil de agremiação não encontrado para o usuário logado: " + authentication.getName()));
        return ResponseEntity.ok(AcademiaResponseDTO.fromEntity(academia));
    }
}
