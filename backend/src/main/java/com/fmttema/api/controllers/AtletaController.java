package com.fmttema.api.controllers;

import com.fmttema.api.dto.AtletaRequestDTO;
import com.fmttema.api.dto.AtletaResponseDTO;
import com.fmttema.api.dto.AtualizarCartelDTO;
import com.fmttema.api.models.Academia;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import com.fmttema.api.services.AtletaService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/atletas")
public class AtletaController {

    private final AtletaRepository atletaRepository;
    private final AcademiaRepository academiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AtletaService atletaService;

    public AtletaController(
            AtletaRepository atletaRepository,
            AcademiaRepository academiaRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AtletaService atletaService
    ) {
        this.atletaRepository = atletaRepository;
        this.academiaRepository = academiaRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.atletaService = atletaService;
    }

    @PostMapping
    public ResponseEntity<?> cadastrarAtleta(@RequestBody @Valid AtletaRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Requisição inválida",
                    "mensagem", "O e-mail informado já está cadastrado"
            ));
        }

        if (atletaRepository.existsByCpf(dto.cpf())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Requisição inválida",
                    "mensagem", "O CPF informado já está cadastrado"
            ));
        }

        Academia academia = null;
        if (dto.academiaId() != null) {
            Optional<Academia> academiaOpt = academiaRepository.findById(dto.academiaId());
            if (academiaOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "erro", "Requisição inválida",
                        "mensagem", "Academia vinculada não encontrada para o ID informado"
                ));
            }
            academia = academiaOpt.get();
        }

        String senhaCriptografada = passwordEncoder.encode(dto.senha());

        // Força status interno para PENDENTE_APROVACAO
        Usuario usuario = new Usuario(
                dto.email(),
                senhaCriptografada,
                PerfilAcesso.ATLETA,
                StatusUsuario.PENDENTE_APROVACAO
        );
        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        Atleta atleta = new Atleta();
        atleta.setNome(dto.nome());
        atleta.setApelido(dto.apelido());
        atleta.setCpf(dto.cpf());
        atleta.setDataNascimento(dto.dataNascimento());
        atleta.setPeso(dto.peso());
        atleta.setCategoria(dto.categoria());
        atleta.setGraduacao(dto.graduacao());
        atleta.setKruang(dto.graduacao());
        atleta.setUsuario(usuarioSalvo);
        atleta.setAcademia(academia);

        Atleta atletaSalvo = atletaRepository.save(atleta);

        return ResponseEntity.status(HttpStatus.CREATED).body(AtletaResponseDTO.fromEntity(atletaSalvo));
    }

    @PatchMapping("/{id}/cartel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREINADOR')")
    public ResponseEntity<?> atualizarCartel(
            @PathVariable Long id,
            @RequestBody @Valid AtualizarCartelDTO dto
    ) {
        try {
            AtletaResponseDTO resposta = atletaService.atualizarCartel(id, dto);
            return ResponseEntity.ok(resposta);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<List<AtletaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(atletaService.listarTodos());
    }

    @GetMapping("/me")
    public ResponseEntity<?> obterMeuPerfil(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "erro", "Não autorizado",
                    "mensagem", "Usuário não autenticado"
            ));
        }
        try {
            AtletaResponseDTO atleta = atletaService.buscarPorEmailUsuario(authentication.getName());
            return ResponseEntity.ok(atleta);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", "Perfil de atleta não encontrado para o usuário logado"
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obterPorId(@PathVariable Long id) {
        try {
            AtletaResponseDTO atleta = atletaService.buscarPorId(id);
            return ResponseEntity.ok(atleta);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "erro", "Não encontrado",
                    "mensagem", e.getMessage()
            ));
        }
    }
}
