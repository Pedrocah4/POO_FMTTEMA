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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import com.fmttema.api.models.EscalaArbitro;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.Patrocinador;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.models.StatusPresencaArbitro;
import com.fmttema.api.repositories.EscalaArbitroRepository;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.PatrocinadorRepository;

import java.util.List;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaPesoRepository categoriaPesoRepository;
    private final AtletaRepository atletaRepository;
    private final AcademiaRepository academiaRepository;
    private final EventoRepository eventoRepository;
    private final EscalaArbitroRepository escalaArbitroRepository;
    private final PatrocinadorRepository patrocinadorRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${admin.default.email:admin@fmttema.com}")
    private String adminEmail;

    @Value("${admin.default.password:admin123}")
    private String adminPassword;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            CategoriaPesoRepository categoriaPesoRepository,
            AtletaRepository atletaRepository,
            AcademiaRepository academiaRepository,
            EventoRepository eventoRepository,
            EscalaArbitroRepository escalaArbitroRepository,
            PatrocinadorRepository patrocinadorRepository,
            JdbcTemplate jdbcTemplate
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoriaPesoRepository = categoriaPesoRepository;
        this.atletaRepository = atletaRepository;
        this.academiaRepository = academiaRepository;
        this.eventoRepository = eventoRepository;
        this.escalaArbitroRepository = escalaArbitroRepository;
        this.patrocinadorRepository = patrocinadorRepository;
        this.jdbcTemplate = jdbcTemplate;
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

        // 5. Inicializa um Árbitro oficial padrão e escala pendente se não existir
        String arbitroEmail = "arbitro@fmttema.com";
        Usuario arbitro = usuarioRepository.findByEmail(arbitroEmail).orElseGet(() -> {
            Usuario novoArbitro = new Usuario(
                    arbitroEmail,
                    passwordEncoder.encode("123456"),
                    PerfilAcesso.ARBITRO,
                    StatusUsuario.ATIVO
            );
            Usuario salvo = usuarioRepository.save(novoArbitro);
            System.out.println(">>> [FMTTEMA] Usuário árbitro padrão inicializado com sucesso: " + arbitroEmail);
            return salvo;
        });

        // Escala o árbitro para o evento oficial se houver evento e ainda não estiver escalado
        Evento primeiroEvento = eventoRepository.findAll().stream().findFirst().orElse(null);
        if (primeiroEvento != null && !escalaArbitroRepository.existsByArbitroIdAndEventoId(arbitro.getId(), primeiroEvento.getId())) {
            EscalaArbitro escalaInicial = new EscalaArbitro(
                    arbitro,
                    primeiroEvento,
                    "Árbitro Central",
                    StatusPresencaArbitro.PENDENTE
            );
            escalaInicial.setObservacoes("Convocação oficial para o torneio de abertura da temporada.");
            escalaArbitroRepository.save(escalaInicial);
            System.out.println(">>> [FMTTEMA] Escala inicial do árbitro criada com sucesso (Status: PENDENTE).");
        }

        // 6. Inicializa patrocinadores oficiais padrão (US11) se não existirem
        if (patrocinadorRepository.count() == 0) {
            patrocinadorRepository.saveAll(List.of(
                    new Patrocinador(
                            "Maximum Boxing Brasil",
                            "https://www.maximumshop.com.br",
                            "https://placehold.co/320x120/002868/FFFFFF?text=MAXIMUM+BOXING",
                            "Patrocinador Master",
                            true,
                            1
                    ),
                    new Patrocinador(
                            "Yokkao Muaythai Gear",
                            "https://yokkao.com",
                            "https://placehold.co/320x120/D91C22/FFFFFF?text=YOKKAO+THAILAND",
                            "Material Esportivo",
                            true,
                            2
                    ),
                    new Patrocinador(
                            "Fairtex Fight Equipment",
                            "https://www.fairtex.com",
                            "https://placehold.co/320x120/0f172a/FFFFFF?text=FAIRTEX+OFFICIAL",
                            "Patrocinador Ouro",
                            true,
                            3
                    ),
                    new Patrocinador(
                            "Governo do Maranhão - SEDEL",
                            "https://sedel.ma.gov.br",
                            "https://placehold.co/320x120/059669/FFFFFF?text=SEDEL+MARANHAO",
                            "Apoio Institucional",
                            true,
                            4
                    )
            ));
            System.out.println(">>> [FMTTEMA] Patrocinadores oficiais iniciais cadastrados com sucesso.");
        }

        // 7. Cria/Atualiza Views SQL para Ranking de Volume e Eficiência (US12)
        inicializarViewsRankingSql();

        // 8. Inicializa/atualiza eventos oficiais ativos para a Vitrine Pública (US13)
        inicializarEventosVitrinePublica();
    }

    private void inicializarEventosVitrinePublica() {
        List<CategoriaPeso> todasCategorias = categoriaPesoRepository.findAll();

        // Atualiza eventos existentes que estejam com data no passado mas ainda AGENDADO, ou sem cartaz/ingresso
        eventoRepository.findAll().forEach(ev -> {
            boolean alterado = false;
            if (ev.getStatus() == StatusEvento.AGENDADO && ev.getData() != null && ev.getData().isBefore(LocalDate.now())) {
                ev.setData(LocalDate.now().plusDays(15));
                alterado = true;
            }
            if (ev.getCartazUrl() == null || ev.getCartazUrl().isBlank()) {
                ev.setCartazUrl("https://placehold.co/600x340/002868/FFFFFF?text=CIRCUITO+MARANHENSE+MUAYTHAI");
                alterado = true;
            }
            if (ev.getUrlIngresso() == null && !ev.getNome().toLowerCase().contains("seminário")) {
                ev.setUrlIngresso("https://www.sympla.com.br/eventos/esportes");
                alterado = true;
            }
            if (alterado) {
                eventoRepository.save(ev);
            }
        });

        if (eventoRepository.buscarEventosPublicosAtivos(LocalDate.now()).size() < 3) {
            Evento etapaEstadual = new Evento(
                    "1ª Etapa do Campeonato Maranhense de Muaythai Tradicional",
                    LocalDate.now().plusDays(20),
                    "Ginásio Georgiana Pflueger (Castelinho) - São Luís/MA",
                    StatusEvento.AGENDADO,
                    "Abertura oficial do calendário estadual FMTTEMA com disputas de cinturão amador e semi-pro."
            );
            etapaEstadual.setUrlIngresso("https://www.sympla.com.br/eventos/esportes");
            etapaEstadual.setCartazUrl("https://placehold.co/600x340/002868/FFFFFF?text=CAMPEONATO+MARANHENSE+2026");
            etapaEstadual.setCategorias(new java.util.ArrayList<>(todasCategorias.stream().limit(4).toList()));

            Evento copaIlha = new Evento(
                    "Grand Prix Ilha Bela de Muaythai - Edição Noturna",
                    LocalDate.now().plusDays(45),
                    "Arena Dom Bosco - Renascença, São Luís/MA",
                    StatusEvento.EM_ANDAMENTO,
                    "Card principal com superlutas estaduais e seletiva oficial para o Campeonato Brasileiro."
            );
            copaIlha.setUrlIngresso("https://www.bilheteriadigital.com");
            copaIlha.setCartazUrl("https://placehold.co/600x340/D91C22/FFFFFF?text=GRAND+PRIX+ILHA+BELA");
            copaIlha.setCategorias(new java.util.ArrayList<>(todasCategorias.stream().skip(2).limit(4).toList()));

            Evento seminarioEntradaFranca = new Evento(
                    "Festival Estadual de Graduação Khan & Pesagem Aberta",
                    LocalDate.now().plusDays(65),
                    "Centro de Treinamento Oficial FMTTEMA - São Luís/MA",
                    StatusEvento.AGENDADO,
                    "Evento institucional gratuito (sem venda de ingressos) para homologação técnica e exames de Khan."
            );
            seminarioEntradaFranca.setUrlIngresso(null);
            seminarioEntradaFranca.setCartazUrl("https://placehold.co/600x340/0f172a/FFFFFF?text=FESTIVAL+KRUANG+FMTTEMA");
            seminarioEntradaFranca.setCategorias(new java.util.ArrayList<>(todasCategorias.stream().limit(3).toList()));

            eventoRepository.saveAll(List.of(etapaEstadual, copaIlha, seminarioEntradaFranca));
            System.out.println(">>> [FMTTEMA] Eventos públicos ativos inicializados com sucesso (US13).");
        }
    }

    private void inicializarViewsRankingSql() {
        try {
            jdbcTemplate.execute("""
                    CREATE OR REPLACE VIEW vw_ranking_volume AS
                    SELECT
                        a.id AS atleta_id,
                        a.nome AS nome,
                        a.apelido AS apelido,
                        COALESCE(a.categoria, 'Sem Categoria') AS categoria,
                        COALESCE(a.graduacao, a.kruang, 'Não informada') AS graduacao,
                        COALESCE(ac.nome, 'Independente') AS academia_nome,
                        COALESCE(a.vitorias, 0) AS vitorias,
                        COALESCE(a.derrotas, 0) AS derrotas,
                        COALESCE(a.empates, 0) AS empates,
                        (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) AS total_lutas,
                        COALESCE(
                            ROUND(
                                (CAST(COALESCE(a.vitorias, 0) AS NUMERIC) * 100.0) /
                                NULLIF((COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)), 0),
                                2
                            ),
                            0.0
                        ) AS percentual_aproveitamento
                    FROM atletas a
                    LEFT JOIN academias ac ON ac.id = a.academia_id
                    ORDER BY
                        COALESCE(a.vitorias, 0) DESC,
                        percentual_aproveitamento DESC,
                        COALESCE(a.derrotas, 0) ASC,
                        a.nome ASC
                    """);

            jdbcTemplate.execute("""
                    CREATE OR REPLACE VIEW vw_ranking_eficiencia AS
                    SELECT
                        a.id AS atleta_id,
                        a.nome AS nome,
                        a.apelido AS apelido,
                        COALESCE(a.categoria, 'Sem Categoria') AS categoria,
                        COALESCE(a.graduacao, a.kruang, 'Não informada') AS graduacao,
                        COALESCE(ac.nome, 'Independente') AS academia_nome,
                        COALESCE(a.vitorias, 0) AS vitorias,
                        COALESCE(a.derrotas, 0) AS derrotas,
                        COALESCE(a.empates, 0) AS empates,
                        (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) AS total_lutas,
                        COALESCE(
                            ROUND(
                                (CAST(COALESCE(a.vitorias, 0) AS NUMERIC) * 100.0) /
                                NULLIF((COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)), 0),
                                2
                            ),
                            0.0
                        ) AS percentual_aproveitamento
                    FROM atletas a
                    LEFT JOIN academias ac ON ac.id = a.academia_id
                    WHERE (COALESCE(a.vitorias, 0) + COALESCE(a.derrotas, 0) + COALESCE(a.empates, 0)) >= 3
                    ORDER BY
                        percentual_aproveitamento DESC,
                        COALESCE(a.vitorias, 0) DESC,
                        COALESCE(a.derrotas, 0) ASC,
                        a.nome ASC
                    """);
            System.out.println(">>> [FMTTEMA] Views SQL 'vw_ranking_volume' e 'vw_ranking_eficiencia' inicializadas com sucesso.");
        } catch (Exception e) {
            System.out.println(">>> [FMTTEMA] Aviso ao criar Views de Ranking: " + e.getMessage());
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
