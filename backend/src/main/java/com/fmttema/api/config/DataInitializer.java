package com.fmttema.api.config;

import com.fmttema.api.models.Academia;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaPesoRepository categoriaPesoRepository;
    private final AtletaRepository atletaRepository;
    private final AcademiaRepository academiaRepository;

    @Value("${admin.default.email:admin@fmttema.com}")
    private String adminEmail;

    @Value("${admin.default.password:admin123}")
    private String adminPassword;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            CategoriaPesoRepository categoriaPesoRepository,
            AtletaRepository atletaRepository,
            AcademiaRepository academiaRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoriaPesoRepository = categoriaPesoRepository;
        this.atletaRepository = atletaRepository;
        this.academiaRepository = academiaRepository;
    }

    @Override
    public void run(String... args) {
        // 1. Cria usuário Admin padrão se não existir
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario(
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    PerfilAcesso.ADMIN
            );
            usuarioRepository.save(admin);
            System.out.println(">>> [FMTTEMA] Usuário administrador padrão inicializado com sucesso: " + adminEmail);
        }

        // 2. Inicializa as categorias oficiais de Muaythai
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

        // 3. Atualiza Rodrigo Minotauro ("Guerreiro") para Fellype Dylon ("Larper")
        atletaRepository.findAll().forEach(atleta -> {
            if (atleta.getNome() != null && (
                    atleta.getNome().toLowerCase().contains("minotauro") ||
                    atleta.getNome().toLowerCase().contains("rodrigo")
            )) {
                atleta.setNome("Fellype Dylon");
                atleta.setApelido("Larper");
                atletaRepository.save(atleta);
                System.out.println(">>> [FMTTEMA] Atleta renomeado com sucesso: Fellype Dylon 'Larper'");
            }
        });

        // 4. Popula o banco com 10 atletas realistas adicionais se houver menos de 10 atletas
        if (atletaRepository.count() < 11) {
            Academia academiaPadrao = academiaRepository.findAll().stream().findFirst().orElseGet(() -> {
                Academia novaAcademia = new Academia();
                novaAcademia.setNome("Centro de Treinamento FMTTEMA");
                novaAcademia.setCidade("São Luís");
                novaAcademia.setResponsavel("Mestre FMTTEMA");
                novaAcademia.setTelefone("(98) 98888-7777");
                return academiaRepository.save(novaAcademia);
            });

            cadastrarAtletaSeNaoExistir(
                    "Thiago Silva", "Pitbull", "001.222.333-01", LocalDate.of(1998, 4, 15),
                    68.0, "Peso-Leve", "Vermelho", 9, 2, 1, StatusPagamento.PAGO,
                    "thiago.pitbull@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Gabriel Santos", "Tigre", "001.222.333-02", LocalDate.of(1999, 7, 22),
                    74.0, "Peso-Médio", "Azul e Vermelho", 7, 3, 0, StatusPagamento.PAGO,
                    "gabriel.tigre@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Lucas Oliveira", "Samurai", "001.222.333-03", LocalDate.of(1995, 11, 30),
                    84.0, "Peso-Pesado", "Preto", 10, 1, 0, StatusPagamento.PAGO,
                    "lucas.samurai@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Rafael Costa", "Demolidor", "001.222.333-04", LocalDate.of(1996, 2, 18),
                    88.5, "Peso-Pesado", "Vermelho e Branco", 8, 4, 1, StatusPagamento.PAGO,
                    "rafael.costa@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Matheus Pereira", "Sniper", "001.222.333-05", LocalDate.of(2000, 9, 5),
                    85.0, "Peso-Pesado", "Azul", 6, 2, 0, StatusPagamento.PAGO,
                    "matheus.sniper@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Daniel Ferreira", "Cobra", "001.222.333-06", LocalDate.of(1997, 12, 12),
                    82.0, "Peso-Pesado", "Verde", 4, 3, 0, StatusPagamento.PENDENTE,
                    "daniel.cobra@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Bruno Lima", "Furacão", "001.222.333-07", LocalDate.of(2001, 3, 27),
                    86.0, "Peso-Pesado", "Amarelo e Verde", 2, 1, 0, StatusPagamento.PAGO,
                    "bruno.furacao@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Igor Rocha", "Trovão", "001.222.333-08", LocalDate.of(1999, 10, 14),
                    62.0, "Peso-Leve", "Verde e Azul", 5, 2, 1, StatusPagamento.PAGO,
                    "igor.trovao@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Felipe Martins", "Predador", "001.222.333-09", LocalDate.of(2002, 6, 8),
                    53.0, "Peso-Galo", "Branco e Amarelo", 3, 0, 0, StatusPagamento.PAGO,
                    "felipe.predador@fmttema.com", academiaPadrao
            );

            cadastrarAtletaSeNaoExistir(
                    "Caio Barbosa", "Gladiador", "001.222.333-10", LocalDate.of(1994, 8, 19),
                    70.5, "Peso-Meio-Médio", "Vermelho", 11, 3, 2, StatusPagamento.PENDENTE,
                    "caio.gladiador@fmttema.com", academiaPadrao
            );

            System.out.println(">>> [FMTTEMA] 10 atletas adicionais povoados no banco de dados com sucesso!");
        }
    }

    private void cadastrarAtletaSeNaoExistir(
            String nome, String apelido, String cpf, LocalDate dataNasc,
            Double peso, String categoria, String kruang, int vitorias, int derrotas, int empates,
            StatusPagamento statusPagamento, String email, Academia academia
    ) {
        if (!atletaRepository.existsByCpf(cpf)) {
            Usuario usuario = new Usuario(
                    email,
                    passwordEncoder.encode("123456"),
                    PerfilAcesso.ATLETA,
                    StatusUsuario.ATIVO
            );
            usuario = usuarioRepository.save(usuario);

            Atleta atleta = new Atleta();
            atleta.setNome(nome);
            atleta.setApelido(apelido);
            atleta.setCpf(cpf);
            atleta.setDataNascimento(dataNasc);
            atleta.setPeso(peso);
            atleta.setCategoria(categoria);
            atleta.setGraduacao(kruang);
            atleta.setKruang(kruang);
            atleta.setVitorias(vitorias);
            atleta.setDerrotas(derrotas);
            atleta.setEmpates(empates);
            atleta.setStatusPagamento(statusPagamento);
            atleta.setUsuario(usuario);
            atleta.setAcademia(academia);

            atletaRepository.save(atleta);
        }
    }
}
