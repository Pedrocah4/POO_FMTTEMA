package com.fmttema.api.config;

import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.email:admin@fmttema.com}")
    private String adminEmail;

    @Value("${admin.default.password:admin123}")
    private String adminPassword;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario(
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    PerfilAcesso.ADMIN
            );
            usuarioRepository.save(admin);
            System.out.println(">>> [FMTTEMA] Usuário administrador padrão inicializado com sucesso: " + adminEmail);
        }
    }
}
