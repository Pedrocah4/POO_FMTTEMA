package com.fmttema.api.config;

import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario(
                    "admin@fmttema.com",
                    passwordEncoder.encode("admin123"),
                    PerfilAcesso.ADMIN
            );
            usuarioRepository.save(admin);
            System.out.println(">>> [FMTTEMA] Usuário inicial criado: admin@fmttema.com / admin123");
        }
    }
}
