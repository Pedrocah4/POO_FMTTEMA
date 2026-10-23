package com.fmttema.api.config;

import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaPesoRepository categoriaPesoRepository;

    @Value("${admin.default.email:admin@fmttema.com}")
    private String adminEmail;

    @Value("${admin.default.password:admin123}")
    private String adminPassword;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            CategoriaPesoRepository categoriaPesoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoriaPesoRepository = categoriaPesoRepository;
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

        if (categoriaPesoRepository.count() == 0) {
            categoriaPesoRepository.saveAll(List.of(
                    new CategoriaPeso("Peso-Mosca", 51.0, "MASCULINO", "Até 51.0 kg"),
                    new CategoriaPeso("Peso-Galo", 54.0, "MASCULINO", "Até 54.0 kg"),
                    new CategoriaPeso("Peso-Pena", 57.0, "MASCULINO", "Até 57.0 kg"),
                    new CategoriaPeso("Peso-Leve", 63.5, "MASCULINO", "Até 63.5 kg"),
                    new CategoriaPeso("Peso-Meio-Médio", 71.0, "MASCULINO", "Até 71.0 kg"),
                    new CategoriaPeso("Peso-Médio", 75.0, "MASCULINO", "Até 75.0 kg"),
                    new CategoriaPeso("Peso-Meio-Pesado", 81.0, "MASCULINO", "Até 81.0 kg"),
                    new CategoriaPeso("Peso-Pesado", 91.0, "MASCULINO", "Até 91.0 kg"),
                    new CategoriaPeso("Peso-Super-Pesado", 120.0, "MASCULINO", "Acima de 91.0 kg")
            ));
            System.out.println(">>> [FMTTEMA] Categorias oficiais de peso inicializadas com sucesso.");
        }
    }
}
