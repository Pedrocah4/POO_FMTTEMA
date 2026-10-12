package com.fmttema.api.controllers;

import com.fmttema.api.dto.LoginRequestDTO;
import com.fmttema.api.dto.LoginResponseDTO;
import com.fmttema.api.dto.RegisterRequestDTO;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.UsuarioRepository;
import com.fmttema.api.security.TokenService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            TokenService tokenService,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequestDTO dto) {
        try {
            var authToken = new UsernamePasswordAuthenticationToken(dto.email(), dto.senha());
            Authentication authentication = authenticationManager.authenticate(authToken);

            Usuario usuario = (Usuario) authentication.getPrincipal();
            String token = tokenService.gerarToken(usuario);

            return ResponseEntity.ok(new LoginResponseDTO(token, usuario.getEmail(), usuario.getPerfil()));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "erro", "Não autorizado",
                    "mensagem", "Credenciais inválidas: e-mail ou senha incorretos"
            ));
        }
    }

    @PostMapping({"/register", "/registrar"})
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "erro", "Requisição inválida",
                    "mensagem", "O e-mail informado já está cadastrado"
            ));
        }

        String senhaCriptografada = passwordEncoder.encode(dto.senha());
        Usuario novoUsuario = new Usuario(dto.email(), senhaCriptografada, dto.perfil());
        usuarioRepository.save(novoUsuario);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "mensagem", "Usuário cadastrado com sucesso",
                "email", novoUsuario.getEmail(),
                "perfil", novoUsuario.getPerfil()
        ));
    }
}
