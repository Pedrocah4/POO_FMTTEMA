package com.fmttema.api.config;

import com.fmttema.api.models.Academia;
import com.fmttema.api.models.Atleta;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.EscalaArbitro;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.FluxoCaixa;
import com.fmttema.api.models.Inscricao;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.models.StatusInscricao;
import com.fmttema.api.models.StatusPagamento;
import com.fmttema.api.models.StatusPresencaArbitro;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.TipoTransacao;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import com.fmttema.api.repositories.EscalaArbitroRepository;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.FluxoCaixaRepository;
import com.fmttema.api.repositories.InscricaoRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Rotina automática e estritamente idempotente de população de dados (Database Seeding)
 * com cenários de teste, verossimilhança regional (Maranhão) e casos de borda (Regra do Bye,
 * Fila de Pendências, Licenças Vigentes/Vencidas e Métodos Financeiros).
 *
 * Respeita estritamente a Ordem de Dependência Relacional (Foreign Keys):
 * 1. Usuario/Pessoa -> 2. Academia -> 3. Treinador/Arbitro -> 4. Atleta ->
 * 5. Competicao (Evento) -> 6. Inscricao -> 7. Pagamento (FluxoCaixa) -> 8. Chaveamento/Lutas.
 */
@Configuration
@Order(2)
public class DataSeederConfig implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final AcademiaRepository academiaRepository;
    private final AtletaRepository atletaRepository;
    private final CategoriaPesoRepository categoriaPesoRepository;
    private final EventoRepository eventoRepository;
    private final InscricaoRepository inscricaoRepository;
    private final EscalaArbitroRepository escalaArbitroRepository;
    private final FluxoCaixaRepository fluxoCaixaRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeederConfig(
            UsuarioRepository usuarioRepository,
            AcademiaRepository academiaRepository,
            AtletaRepository atletaRepository,
            CategoriaPesoRepository categoriaPesoRepository,
            EventoRepository eventoRepository,
            InscricaoRepository inscricaoRepository,
            EscalaArbitroRepository escalaArbitroRepository,
            FluxoCaixaRepository fluxoCaixaRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.academiaRepository = academiaRepository;
        this.atletaRepository = atletaRepository;
        this.categoriaPesoRepository = categoriaPesoRepository;
        this.eventoRepository = eventoRepository;
        this.inscricaoRepository = inscricaoRepository;
        this.escalaArbitroRepository = escalaArbitroRepository;
        this.fluxoCaixaRepository = fluxoCaixaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        System.out.println(">>> [DataSeederConfig] Iniciando verificação idempotente de cenários de teste e casos de borda...");

        // 1 & 2. Garantir contas base por perfil, Academias Regionais do Maranhão e Fila de Pendências/Suspensões (US01/US03)
        Academia ctSaoLuis = popularAcademiasECredenciamentosRegionais();

        // 3. Popular Cenários de Licenças e Credenciamento (Treinadores e Árbitros Vigentes vs Vencidos)
        List<Usuario> arbitrosOficiais = popularCenariosLicencasTreinadoresEArbitros();

        // 4. Popular Atletas Regionais, Fila de Pendências de Atletas e Casos de Borda para Chaveamento
        popularAtletasEPendencias(ctSaoLuis);

        // 5. Popular 3 Competições (Planejada/Agendada, Em Andamento com Regra do Bye Ímpar e Encerrada/Finalizada)
        popularTorneiosInscricoesEChaveamentoComBye(arbitrosOficiais);

        // 6. Popular Cenários Financeiros Completos (PIX, Cartão, Boleto, Dinheiro / Pendente, Aprovado, Recusado, Estornado)
        popularCenariosFinanceiros(ctSaoLuis);

        System.out.println(">>> [DataSeederConfig] Seeding de cenários de teste e casos de borda concluído com sucesso!");
    }

    /**
     * Passo 1 e 2: Garante academias regionais do Maranhão (São Luís, Imperatriz, Barreirinhas, Caxias)
     * nos status ATIVO, PENDENTE_APROVACAO e SUSPENSA.
     */
    private Academia popularAcademiasECredenciamentosRegionais() {
        // Academia Padrão Ativa 1 - São Luís
        Usuario userAcadPadrao = garantirUsuario(
                "academia@fmttema.com",
                "123456",
                PerfilAcesso.ACADEMIA,
                StatusUsuario.ATIVO,
                "Centro de Treinamento FMTTEMA - São Luís",
                null,
                null,
                null
        );

        Academia ctSaoLuis = academiaRepository.findByNome("Centro de Treinamento FMTTEMA").orElseGet(() -> {
            Academia ac = new Academia(
                    "Centro de Treinamento FMTTEMA",
                    "Mestre Raimundo Guajajara",
                    "(98) 98888-7777",
                    "São Luís - MA",
                    userAcadPadrao
            );
            ac.setCnpj("12.345.678/0001-01");
            ac.setStatusPagamento(StatusPagamento.PAGO);
            ac.setComprovantePagamento("https://comprovantes.fmttema.com/2026/anuidade_ct_fmttema_pix.pdf");
            return academiaRepository.save(ac);
        });
        if (ctSaoLuis.getUsuario() == null) {
            ctSaoLuis.setUsuario(userAcadPadrao);
            ctSaoLuis.setStatusPagamento(StatusPagamento.PAGO);
            if (ctSaoLuis.getComprovantePagamento() == null) {
                ctSaoLuis.setComprovantePagamento("https://comprovantes.fmttema.com/2026/anuidade_ct_fmttema_pix.pdf");
            }
            ctSaoLuis = academiaRepository.save(ctSaoLuis);
        }

        // Academia Ativa 2 - Imperatriz
        garantirAcademia(
                "Arena Tocantins Muaythai",
                "12.345.678/0001-02",
                "Kru Cláudio Sampaio",
                "(99) 99123-4500",
                "Imperatriz - MA",
                "arena.imperatriz@fmttema.com",
                StatusUsuario.ATIVO,
                StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/anuidade_arena_imperatriz_cartao.pdf"
        );

        // Academia Ativa 3 (Com Anuidade Pendente no Financeiro) - Barreirinhas
        garantirAcademia(
                "CT Lençóis Fight Muaythai",
                "12.345.678/0001-03",
                "Kru Patrícia Dunas",
                "(98) 98411-2233",
                "Barreirinhas - MA",
                "ct.lencois@fmttema.com",
                StatusUsuario.ATIVO,
                StatusPagamento.PENDENTE,
                null
        );

        // 2 Academias aguardando aprovação (Status PENDENTE_APROVACAO para alimentar /painel/pendencias - US03)
        garantirAcademia(
                "CT Muaythai Imperatriz Fight",
                "12.345.678/0001-04",
                "Kru Antônio Bandeira",
                "(99) 98112-3344",
                "Imperatriz - MA",
                "ct.imperatriz.pendente@fmttema.com",
                StatusUsuario.PENDENTE_APROVACAO,
                StatusPagamento.PENDENTE,
                null
        );

        garantirAcademia(
                "Associação Caxiense de Muaythai Tradicional",
                "12.345.678/0001-05",
                "Mestre Raimundo Teixeira",
                "(99) 98445-6677",
                "Caxias - MA",
                "academia.caxias.pendente@fmttema.com",
                StatusUsuario.PENDENTE_APROVACAO,
                StatusPagamento.PENDENTE,
                null
        );

        // 1 Academia com status SUSPENSA (Caso de borda de credenciamento)
        garantirAcademia(
                "CT Litoral Norte Fight Club",
                "12.345.678/0001-06",
                "Mestre Josenildo Costa",
                "(98) 98711-2299",
                "Barreirinhas - MA",
                "ct.barreirinhas.suspensa@fmttema.com",
                StatusUsuario.SUSPENSA,
                StatusPagamento.PENDENTE,
                null
        );

        return ctSaoLuis;
    }

    /**
     * Passo 3: Popula Treinadores (licença vigente vs expirada) e Árbitros nos 3 níveis
     * (estadual, nacional, internacional), alternando licenças vigentes e vencidas.
     */
    private List<Usuario> popularCenariosLicencasTreinadoresEArbitros() {
        // Treinador 1: Licença dentro da validade (apto a vincular/editar atletas)
        garantirUsuario(
                "treinador@fmttema.com",
                "123456",
                PerfilAcesso.TREINADOR,
                StatusUsuario.ATIVO,
                "Kru Marcos Vinícius Guajajara (São Luís/MA)",
                "LIC-TRN-MA-2026-001",
                LocalDate.now().plusYears(1),
                null
        );

        // Treinador 2: Licença dentro da validade (Imperatriz/MA)
        garantirUsuario(
                "treinador.imperatriz@fmttema.com",
                "123456",
                PerfilAcesso.TREINADOR,
                StatusUsuario.ATIVO,
                "Mestre Cláudio Sampaio (Imperatriz/MA)",
                "LIC-TRN-MA-2026-002",
                LocalDate.now().plusMonths(8),
                null
        );

        // Treinador 3: Caso de Borda - data_validade_licenca EXPIRADA (bloqueio de credenciamento)
        garantirUsuario(
                "treinador.expirado@fmttema.com",
                "123456",
                PerfilAcesso.TREINADOR,
                StatusUsuario.SUSPENSA,
                "Treinador Roberto Alcântara (Caxias/MA - Licença Vencida)",
                "LIC-TRN-MA-2024-099",
                LocalDate.now().minusMonths(4),
                null
        );

        List<Usuario> arbitros = new ArrayList<>();

        // Árbitro Nível Estadual - Licença VIGENTE
        arbitros.add(garantirUsuario(
                "arbitro@fmttema.com",
                "123456",
                PerfilAcesso.ARBITRO,
                StatusUsuario.ATIVO,
                "Árbitro Carlos Eduardo Jansen (Estadual - São Luís/MA)",
                "LIC-ARB-EST-2026-001",
                LocalDate.now().plusMonths(10),
                "estadual"
        ));

        // Árbitro Nível Estadual - Licença VENCIDA
        arbitros.add(garantirUsuario(
                "arbitro.estadual.vencido@fmttema.com",
                "123456",
                PerfilAcesso.ARBITRO,
                StatusUsuario.SUSPENSA,
                "Árbitro Raimundo Bezerra (Estadual - Caxias/MA)",
                "LIC-ARB-EST-2024-002",
                LocalDate.now().minusMonths(3),
                "estadual"
        ));

        // Árbitro Nível Nacional - Licença VIGENTE
        arbitros.add(garantirUsuario(
                "arbitro.nacional@fmttema.com",
                "123456",
                PerfilAcesso.ARBITRO,
                StatusUsuario.ATIVO,
                "Árbitra Juliana Cantanhede (Nacional - Imperatriz/MA)",
                "LIC-ARB-NAC-2026-003",
                LocalDate.now().plusYears(1),
                "nacional"
        ));

        // Árbitro Nível Nacional - Licença VENCIDA
        arbitros.add(garantirUsuario(
                "arbitro.nacional.vencido@fmttema.com",
                "123456",
                PerfilAcesso.ARBITRO,
                StatusUsuario.SUSPENSA,
                "Árbitro Henrique Belfort (Nacional - Barreirinhas/MA)",
                "LIC-ARB-NAC-2024-004",
                LocalDate.now().minusDays(45),
                "nacional"
        ));

        // Árbitro Nível Internacional - Licença VIGENTE
        arbitros.add(garantirUsuario(
                "arbitro.internacional@fmttema.com",
                "123456",
                PerfilAcesso.ARBITRO,
                StatusUsuario.ATIVO,
                "Mestre Árbitro Fernando Sarney (Internacional - São Luís/MA)",
                "LIC-ARB-INT-2026-005",
                LocalDate.now().plusYears(2),
                "internacional"
        ));

        // Árbitro Nível Internacional - Licença VENCIDA
        arbitros.add(garantirUsuario(
                "arbitro.internacional.vencido@fmttema.com",
                "123456",
                PerfilAcesso.ARBITRO,
                StatusUsuario.SUSPENSA,
                "Árbitro Paulo Roberto Timon (Internacional - Caxias/MA)",
                "LIC-ARB-INT-2024-006",
                LocalDate.now().minusMonths(6),
                "internacional"
        ));

        return arbitros;
    }

    /**
     * Passo 4: Popula atletas ativos adicionais, conta padrão atleta@fmttema.com,
     * 3 atletas com status PENDENTE_APROVACAO (para /painel/pendencias) e 1 atleta com status SUSPENSA.
     */
    private void popularAtletasEPendencias(Academia ctSaoLuis) {
        Academia arenaImperatriz = academiaRepository.findByNome("Arena Tocantins Muaythai").orElse(ctSaoLuis);
        Academia ctBarreirinhas = academiaRepository.findByNome("CT Lençóis Fight Muaythai").orElse(ctSaoLuis);

        // Garante os atletas base para as chaves de Peso-Pesado (5 lutadores = ímpar) e Peso-Leve (5 lutadores = ímpar)
        garantirAtleta(
                "Thiago Silva", "Pitbull", "001.222.333-01", LocalDate.of(1998, 4, 15),
                68.0, "Peso-Leve", "Vermelho", 9, 2, 1, StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/pix_thiago_silva_aprovado.pdf",
                "thiago.pitbull@fmttema.com", StatusUsuario.ATIVO, ctSaoLuis
        );
        garantirAtleta(
                "Lucas Oliveira", "Samurai", "001.222.333-03", LocalDate.of(1995, 11, 30),
                84.0, "Peso-Pesado", "Preto", 10, 1, 0, StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/recibo_dinheiro_lucas_oliveira.pdf",
                "lucas.samurai@fmttema.com", StatusUsuario.ATIVO, ctSaoLuis
        );
        garantirAtleta(
                "Rafael Costa", "Demolidor", "001.222.333-04", LocalDate.of(1996, 2, 18),
                88.5, "Peso-Pesado", "Vermelho e Branco", 8, 4, 1, StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/pix_rafael_costa.pdf",
                "rafael.costa@fmttema.com", StatusUsuario.ATIVO, arenaImperatriz
        );
        garantirAtleta(
                "Matheus Pereira", "Sniper", "001.222.333-05", LocalDate.of(2000, 9, 5),
                85.0, "Peso-Pesado", "Azul", 6, 2, 0, StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/pix_matheus_sniper.pdf",
                "matheus.sniper@fmttema.com", StatusUsuario.ATIVO, ctSaoLuis
        );
        garantirAtleta(
                "Daniel Ferreira", "Cobra", "001.222.333-06", LocalDate.of(1997, 12, 12),
                82.0, "Peso-Pesado", "Verde", 4, 3, 0, StatusPagamento.PENDENTE,
                "https://comprovantes.fmttema.com/2026/boleto_daniel_pendente.pdf",
                "daniel.cobra@fmttema.com", StatusUsuario.ATIVO, arenaImperatriz
        );
        garantirAtleta(
                "Bruno Lima", "Furacão", "001.222.333-07", LocalDate.of(2001, 3, 27),
                86.0, "Peso-Pesado", "Amarelo e Verde", 2, 1, 0, StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/pix_bruno_lima.pdf",
                "bruno.furacao@fmttema.com", StatusUsuario.ATIVO, ctBarreirinhas
        );
        garantirAtleta(
                "Igor Rocha", "Trovão", "001.222.333-08", LocalDate.of(1999, 10, 14),
                62.0, "Peso-Leve", "Verde e Azul", 5, 2, 1, StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/pix_igor_rocha.pdf",
                "igor.trovao@fmttema.com", StatusUsuario.ATIVO, ctSaoLuis
        );
        garantirAtleta(
                "Caio Barbosa", "Gladiador", "001.222.333-10", LocalDate.of(1994, 8, 19),
                70.5, "Peso-Meio-Médio", "Vermelho", 11, 3, 2, StatusPagamento.PENDENTE,
                null,
                "caio.gladiador@fmttema.com", StatusUsuario.ATIVO, arenaImperatriz
        );

        // Conta padrão de Atleta (atleta@fmttema.com) para login imediato de demonstração
        garantirAtleta(
                "João Vitor Timbiras",
                "Guerreiro da Ilha",
                "110.220.330-10",
                LocalDate.of(1999, 3, 12),
                62.8,
                "Peso-Leve",
                "Vermelho e Branco",
                7, 2, 0,
                StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/pix_joao_timbiras.pdf",
                "atleta@fmttema.com",
                StatusUsuario.ATIVO,
                ctSaoLuis
        );

        // Mais atletas Peso-Leve ativos para fechar chave ímpar de 5 atletas no Peso-Leve também
        garantirAtleta(
                "Pedro Henrique Sabiá",
                "Relâmpago do Mearim",
                "110.220.330-11",
                LocalDate.of(2000, 8, 25),
                63.2,
                "Peso-Leve",
                "Azul",
                6, 2, 1,
                StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/cartao_pedro_sabia.pdf",
                "pedro.sabia@fmttema.com",
                StatusUsuario.ATIVO,
                arenaImperatriz
        );

        garantirAtleta(
                "Vitor Hugo Alcântara",
                "Ciclone",
                "110.220.330-12",
                LocalDate.of(2001, 1, 19),
                61.5,
                "Peso-Leve",
                "Verde",
                4, 2, 0,
                StatusPagamento.PAGO,
                "https://comprovantes.fmttema.com/2026/boleto_vitor_ciclone.pdf",
                "vitor.ciclone@fmttema.com",
                StatusUsuario.ATIVO,
                ctBarreirinhas
        );

        // --- 3 ATLETAS PENDENTES DE APROVAÇÃO (Alimentam /painel/pendencias - US03) ---
        garantirAtleta(
                "Raimundo Nonato Sousa",
                "Tubarão da Ilha",
                "110.220.330-01",
                LocalDate.of(2001, 5, 14),
                63.0,
                "Peso-Leve",
                "Branco e Vermelho",
                3, 2, 0,
                StatusPagamento.PENDENTE,
                null,
                "raimundo.pendente@fmttema.com",
                StatusUsuario.PENDENTE_APROVACAO,
                ctSaoLuis
        );

        garantirAtleta(
                "Welligton Maranhão Alves",
                "Falcão do Tocantins",
                "110.220.330-02",
                LocalDate.of(1998, 11, 3),
                70.0,
                "Peso-Meio-Médio",
                "Azul",
                4, 2, 1,
                StatusPagamento.PENDENTE,
                null,
                "welligton.pendente@fmttema.com",
                StatusUsuario.PENDENTE_APROVACAO,
                arenaImperatriz
        );

        garantirAtleta(
                "Kauã Lençóis Cardoso",
                "Duna Feroz",
                "110.220.330-03",
                LocalDate.of(2003, 2, 20),
                56.5,
                "Peso-Pena",
                "Verde",
                2, 1, 0,
                StatusPagamento.PENDENTE,
                null,
                "kaua.pendente@fmttema.com",
                StatusUsuario.PENDENTE_APROVACAO,
                ctBarreirinhas
        );

        // --- 1 ATLETA COM CONTA SUSPENSA (Caso de borda de credenciamento) ---
        garantirAtleta(
                "Marcelo Viana Mendes",
                "Tempestade dos Cocais",
                "110.220.330-04",
                LocalDate.of(1996, 7, 9),
                74.5,
                "Peso-Médio",
                "Azul e Vermelho",
                3, 4, 0,
                StatusPagamento.PENDENTE,
                null,
                "marcelo.suspenso@fmttema.com",
                StatusUsuario.SUSPENSA,
                arenaImperatriz
        );
    }

    /**
     * Passo 5: Garante 3 competições cobrindo todos os status:
     * - AGENDADO (planejada / inscrições abertas)
     * - EM_ANDAMENTO (com número ímpar de 5 atletas na mesma categoria para acionar a Regra do Bye)
     * - FINALIZADO (encerrada / histórico consolidado)
     */
    private void popularTorneiosInscricoesEChaveamentoComBye(List<Usuario> arbitros) {
        List<CategoriaPeso> todasCategorias = categoriaPesoRepository.findAll();
        if (todasCategorias.isEmpty()) {
            return;
        }

        CategoriaPeso catPesado = todasCategorias.stream()
                .filter(c -> c.getNome() != null && c.getNome().equalsIgnoreCase("Peso-Pesado"))
                .findFirst()
                .orElse(todasCategorias.get(todasCategorias.size() - 1));

        CategoriaPeso catLeve = todasCategorias.stream()
                .filter(c -> c.getNome() != null && c.getNome().equalsIgnoreCase("Peso-Leve"))
                .findFirst()
                .orElse(todasCategorias.get(0));

        CategoriaPeso catMedio = todasCategorias.stream()
                .filter(c -> c.getNome() != null && c.getNome().equalsIgnoreCase("Peso-Médio"))
                .findFirst()
                .orElse(todasCategorias.get(0));

        // 1. Competição EM_ANDAMENTO (Com chaves geradas e Caso de Borda Ímpar - Regra do Bye)
        Evento eventoEmAndamento = eventoRepository.findByStatus(StatusEvento.EM_ANDAMENTO).stream()
                .findFirst()
                .orElseGet(() -> {
                    Evento ev = new Evento(
                            "Grand Prix Ilha Bela de Muaythai - Edição Noturna",
                            LocalDate.now().plusDays(10),
                            "Arena Dom Bosco - Renascença, São Luís/MA",
                            StatusEvento.EM_ANDAMENTO,
                            "Card principal em andamento com chaves eliminatórias e aplicação oficial da Regra do Bye."
                    );
                    ev.setUrlIngresso("https://www.bilheteriadigital.com");
                    ev.setCartazUrl("https://placehold.co/600x340/D91C22/FFFFFF?text=GRAND+PRIX+ILHA+BELA");
                    ev.setCategorias(new ArrayList<>(List.of(catPesado, catLeve, catMedio)));
                    return eventoRepository.save(ev);
                });

        // 2. Competição PLANEJADA / AGENDADA (Inscrições abertas)
        Evento eventoPlanejado = eventoRepository.findByStatus(StatusEvento.AGENDADO).stream()
                .findFirst()
                .orElseGet(() -> {
                    Evento ev = new Evento(
                            "1ª Etapa do Campeonato Maranhense de Muaythai Tradicional",
                            LocalDate.now().plusDays(25),
                            "Ginásio Georgiana Pflueger (Castelinho) - São Luís/MA",
                            StatusEvento.AGENDADO,
                            "Abertura oficial do calendário estadual FMTTEMA com inscrições abertas."
                    );
                    ev.setUrlIngresso("https://www.sympla.com.br/eventos/esportes");
                    ev.setCartazUrl("https://placehold.co/600x340/002868/FFFFFF?text=CAMPEONATO+MARANHENSE+2026");
                    ev.setCategorias(new ArrayList<>(List.of(catPesado, catLeve, catMedio)));
                    return eventoRepository.save(ev);
                });

        // 3. Competição ENCERRADA / FINALIZADA (Histórico consolidado em Imperatriz/MA)
        Evento eventoEncerrado = eventoRepository.findByStatus(StatusEvento.FINALIZADO).stream()
                .findFirst()
                .orElseGet(() -> {
                    Evento ev = new Evento(
                            "Copa Imperatriz de Muaythai Tradicional - Etapa Sul Maranhense",
                            LocalDate.now().minusDays(40),
                            "Ginásio Poliesportivo Beira-Rio - Imperatriz/MA",
                            StatusEvento.FINALIZADO,
                            "Torneio regional encerrado com histórico oficial homologado pela FMTTEMA."
                    );
                    ev.setUrlIngresso(null);
                    ev.setCartazUrl("https://placehold.co/600x340/0f172a/FFFFFF?text=COPA+IMPERATRIZ+ENCERRADA");
                    ev.setCategorias(new ArrayList<>(List.of(catPesado, catLeve)));
                    return eventoRepository.save(ev);
                });

        // --- CASO DE BORDA DE CHAVEAMENTO: NÚMERO ÍMPAR DE ATLETAS (5 LUTADORES) NA MESMA CATEGORIA ---
        // Categoria Peso-Pesado: 5 atletas (Lucas Oliveira 10W recebe o BYE e avança direto para a Semifinal!)
        List<String> cpfsPesoPesadoImpar = List.of(
                "001.222.333-03", // Lucas Oliveira "Samurai" (10 vitórias -> Cabeça de Chave #1 / BYE)
                "001.222.333-04", // Rafael Costa "Demolidor" (8 vitórias)
                "001.222.333-05", // Matheus Pereira "Sniper" (6 vitórias)
                "001.222.333-06", // Daniel Ferreira "Cobra" (4 vitórias)
                "001.222.333-07"  // Bruno Lima "Furacão" (2 vitórias)
        );

        for (String cpf : cpfsPesoPesadoImpar) {
            atletaRepository.findByCpf(cpf).ifPresent(atleta -> {
                garantirInscricao(atleta, eventoEmAndamento, catPesado, StatusInscricao.CONFIRMADA);
                garantirInscricao(atleta, eventoPlanejado, catPesado, StatusInscricao.CONFIRMADA);
            });
        }

        // Categoria Peso-Leve: 5 atletas (número ímpar!) inscritos no evento em andamento (Thiago Silva 9W recebe o BYE)
        List<String> cpfsPesoLeveImpar = List.of(
                "001.222.333-01", // Thiago Silva "Pitbull" (9 vitórias -> Cabeça de Chave #1 / BYE)
                "110.220.330-10", // João Vitor Timbiras (7 vitórias)
                "110.220.330-11", // Pedro Henrique Sabiá (6 vitórias)
                "001.222.333-08", // Igor Rocha "Trovão" (5 vitórias)
                "110.220.330-12"  // Vitor Hugo Alcântara (4 vitórias)
        );

        for (String cpf : cpfsPesoLeveImpar) {
            atletaRepository.findByCpf(cpf).ifPresent(atleta -> {
                garantirInscricao(atleta, eventoEmAndamento, catLeve, StatusInscricao.CONFIRMADA);
                garantirInscricao(atleta, eventoPlanejado, catLeve, StatusInscricao.CONFIRMADA);
            });
        }

        // No evento encerrado, registrar inscrições cobrindo todos os status: CONFIRMADA, PENDENTE e CANCELADA
        atletaRepository.findByCpf("001.222.333-03").ifPresent(a ->
                garantirInscricao(a, eventoEncerrado, catPesado, StatusInscricao.CONFIRMADA));
        atletaRepository.findByCpf("001.222.333-04").ifPresent(a ->
                garantirInscricao(a, eventoEncerrado, catPesado, StatusInscricao.CONFIRMADA));
        atletaRepository.findByCpf("001.222.333-06").ifPresent(a ->
                garantirInscricao(a, eventoEncerrado, catPesado, StatusInscricao.PENDENTE));
        atletaRepository.findByCpf("001.222.333-07").ifPresent(a ->
                garantirInscricao(a, eventoEncerrado, catPesado, StatusInscricao.CANCELADA));

        // Escalar árbitros nos eventos cobrindo status PENDENTE, CONFIRMADO e RECUSADO (US08)
        if (!arbitros.isEmpty()) {
            Usuario arbEstadual = arbitros.get(0); // arbitro@fmttema.com
            garantirEscalaArbitro(arbEstadual, eventoEmAndamento, "Árbitro Central", StatusPresencaArbitro.CONFIRMADO,
                    "Presença homologada para conduzir as lutas principais do GP Ilha Bela.");
            garantirEscalaArbitro(arbEstadual, eventoPlanejado, "Árbitro Central", StatusPresencaArbitro.PENDENTE,
                    "Convocação oficial para a 1ª Etapa do Campeonato Maranhense.");

            if (arbitros.size() >= 3) {
                Usuario arbNacional = arbitros.get(2); // arbitro.nacional@fmttema.com
                garantirEscalaArbitro(arbNacional, eventoEmAndamento, "Juiz Lateral (Pontuação)", StatusPresencaArbitro.CONFIRMADO,
                        "Designada para a mesa lateral de pontuação eletrônica.");
                garantirEscalaArbitro(arbNacional, eventoPlanejado, "Juiz Lateral (Pontuação)", StatusPresencaArbitro.PENDENTE,
                        "Aguardando confirmação de deslocamento Imperatriz -> São Luís.");
            }

            if (arbitros.size() >= 5) {
                Usuario arbInternacional = arbitros.get(4); // arbitro.internacional@fmttema.com
                garantirEscalaArbitro(arbInternacional, eventoEmAndamento, "Mesário / Súmula", StatusPresencaArbitro.CONFIRMADO,
                        "Supervisor geral de súmulas e regra do Bye.");
                garantirEscalaArbitro(arbInternacional, eventoEncerrado, "Árbitro Central", StatusPresencaArbitro.RECUSADO,
                        "Indisponibilidade justificada por compromisso internacional IFMA.");
            }
        }
    }

    /**
     * Passo 6: Popula cenários financeiros no Fluxo de Caixa cobrindo todos os métodos
     * (PIX, CARTAO, BOLETO, DINHEIRO) e status (APROVADO, PENDENTE, RECUSADO, ESTORNADO).
     */
    private void popularCenariosFinanceiros(Academia ctSaoLuis) {
        Academia arenaImperatriz = academiaRepository.findByNome("Arena Tocantins Muaythai").orElse(ctSaoLuis);
        Atleta thiago = atletaRepository.findByCpf("001.222.333-01").orElse(null);
        Atleta lucas = atletaRepository.findByCpf("001.222.333-03").orElse(null);
        Atleta daniel = atletaRepository.findByCpf("001.222.333-06").orElse(null);
        Atleta caio = atletaRepository.findByCpf("001.222.333-10").orElse(null);

        // 1. Método PIX - Status APROVADO (Entrada Anuidade Atleta)
        garantirLancamentoFinanceiro(
                TipoTransacao.ENTRADA,
                "[SEED-FIN-01] Anuidade Atleta 2026 via PIX - Thiago Silva (São Luís/MA)",
                150.00,
                "https://comprovantes.fmttema.com/2026/pix_thiago_silva_aprovado.pdf",
                thiago,
                null,
                "PIX",
                "APROVADO",
                "Pagamento instantâneo via QR Code PIX homologado pela tesouraria."
        );

        // 2. Método CARTAO - Status APROVADO (Entrada Anuidade Academia)
        garantirLancamentoFinanceiro(
                TipoTransacao.ENTRADA,
                "[SEED-FIN-02] Taxa de Filiação Anual Academia via CARTAO - Arena Tocantins (Imperatriz/MA)",
                450.00,
                "https://comprovantes.fmttema.com/2026/cartao_arena_imperatriz_aprovado.pdf",
                null,
                arenaImperatriz,
                "CARTAO",
                "APROVADO",
                "Pagamento em cartão de crédito aprovado (NSU 884920)."
        );

        // 3. Método BOLETO - Status PENDENTE (Inscrição / Anuidade aguardando compensação bancária)
        garantirLancamentoFinanceiro(
                TipoTransacao.ENTRADA,
                "[SEED-FIN-03] Boleto Anuidade Atleta - Daniel Ferreira (Aguardando Compensação)",
                150.00,
                "https://comprovantes.fmttema.com/2026/boleto_daniel_pendente.pdf",
                daniel,
                null,
                "BOLETO",
                "PENDENTE",
                "Boleto emitido; aguardando compensação bancária em até 48h úteis."
        );

        // 4. Método DINHEIRO - Status APROVADO (Taxa de Inscrição presencial na secretaria da Federação)
        garantirLancamentoFinanceiro(
                TipoTransacao.ENTRADA,
                "[SEED-FIN-04] Inscrição Torneio e Anuidade em DINHEIRO - Lucas Oliveira (São Luís/MA)",
                200.00,
                "https://comprovantes.fmttema.com/2026/recibo_dinheiro_lucas_oliveira.pdf",
                lucas,
                ctSaoLuis,
                "DINHEIRO",
                "APROVADO",
                "Recebido em espécie na secretaria da FMTTEMA no Ginásio Castelinho."
        );

        // 5. Método CARTAO - Status RECUSADO (Tentativa de pagamento recusada pela operadora)
        garantirLancamentoFinanceiro(
                TipoTransacao.ENTRADA,
                "[SEED-FIN-05] Tentativa de Pagamento Anuidade via CARTAO - Caio Barbosa (Recusado)",
                150.00,
                null,
                caio,
                null,
                "CARTAO",
                "RECUSADO",
                "Transação não autorizada pelo emissor do cartão; atleta permanece inadimplente."
        );

        // 6. Método PIX - Status ESTORNADO (Saída / Estorno de inscrição cancelada)
        garantirLancamentoFinanceiro(
                TipoTransacao.SAIDA,
                "[SEED-FIN-06] Estorno de Taxa de Inscrição Cancelada via PIX - Copa Imperatriz",
                80.00,
                "https://comprovantes.fmttema.com/2026/estorno_pix_inscricao_cancelada.pdf",
                null,
                null,
                "PIX",
                "ESTORNADO",
                "Devolução integral referente a inscrição cancelada antes da pesagem oficial."
        );

        // 7. Despesa Operacional da Federação (Saída - Arbitragem e Ringue)
        garantirLancamentoFinanceiro(
                TipoTransacao.SAIDA,
                "[SEED-FIN-07] Despesa de Montagem de Ringue Oficial e Equipe de Arbitragem - GP Ilha Bela",
                320.00,
                "https://comprovantes.fmttema.com/2026/nf_locacao_ringue_arbitragem.pdf",
                null,
                null,
                "BOLETO",
                "APROVADO",
                "Pagamento de estrutura logística do evento em São Luís/MA."
        );
    }

    private Usuario garantirUsuario(
            String email,
            String senhaPura,
            PerfilAcesso perfil,
            StatusUsuario status,
            String nome,
            String numeroLicenca,
            LocalDate dataValidadeLicenca,
            String nivelArbitragem
    ) {
        return usuarioRepository.findByEmail(email).map(existente -> {
            boolean atualizado = false;
            if (existente.getNome() == null && nome != null) {
                existente.setNome(nome);
                atualizado = true;
            }
            if (existente.getNumeroLicenca() == null && numeroLicenca != null && !usuarioRepository.existsByNumeroLicenca(numeroLicenca)) {
                existente.setNumeroLicenca(numeroLicenca);
                atualizado = true;
            }
            if (existente.getDataValidadeLicenca() == null && dataValidadeLicenca != null) {
                existente.setDataValidadeLicenca(dataValidadeLicenca);
                atualizado = true;
            }
            if (existente.getNivelArbitragem() == null && nivelArbitragem != null) {
                existente.setNivelArbitragem(nivelArbitragem);
                atualizado = true;
            }
            return atualizado ? usuarioRepository.save(existente) : existente;
        }).orElseGet(() -> {
            Usuario novo = new Usuario(
                    email,
                    passwordEncoder.encode(senhaPura),
                    perfil,
                    status
            );
            novo.setNome(nome);
            if (numeroLicenca != null && !usuarioRepository.existsByNumeroLicenca(numeroLicenca)) {
                novo.setNumeroLicenca(numeroLicenca);
            }
            novo.setDataValidadeLicenca(dataValidadeLicenca);
            novo.setNivelArbitragem(nivelArbitragem);
            return usuarioRepository.save(novo);
        });
    }

    private Academia garantirAcademia(
            String nome,
            String cnpj,
            String responsavel,
            String telefone,
            String cidade,
            String email,
            StatusUsuario statusUsuario,
            StatusPagamento statusPagamento,
            String comprovante
    ) {
        return academiaRepository.findByNome(nome).orElseGet(() -> {
            if (cnpj != null && academiaRepository.existsByCnpj(cnpj)) {
                return academiaRepository.findByCnpj(cnpj).orElseThrow();
            }
            Usuario usuario = garantirUsuario(
                    email,
                    "123456",
                    PerfilAcesso.ACADEMIA,
                    statusUsuario,
                    nome,
                    null,
                    null,
                    null
            );
            Academia nova = new Academia(nome, responsavel, telefone, cidade, usuario);
            nova.setCnpj(cnpj);
            nova.setStatusPagamento(statusPagamento);
            nova.setComprovantePagamento(comprovante);
            return academiaRepository.save(nova);
        });
    }

    private Atleta garantirAtleta(
            String nome,
            String apelido,
            String cpf,
            LocalDate dataNascimento,
            Double peso,
            String categoria,
            String kruang,
            int vitorias,
            int derrotas,
            int empates,
            StatusPagamento statusPagamento,
            String comprovante,
            String email,
            StatusUsuario statusUsuario,
            Academia academia
    ) {
        return atletaRepository.findByCpf(cpf).orElseGet(() -> {
            Usuario usuario = garantirUsuario(
                    email,
                    "123456",
                    PerfilAcesso.ATLETA,
                    statusUsuario,
                    nome,
                    null,
                    null,
                    null
            );

            Atleta atleta = new Atleta();
            atleta.setNome(nome);
            atleta.setApelido(apelido);
            atleta.setCpf(cpf);
            atleta.setDataNascimento(dataNascimento);
            atleta.setPeso(peso);
            atleta.setCategoria(categoria);
            atleta.setGraduacao(kruang);
            atleta.setKruang(kruang);
            atleta.setVitorias(vitorias);
            atleta.setDerrotas(derrotas);
            atleta.setEmpates(empates);
            atleta.setStatusPagamento(statusPagamento);
            atleta.setComprovantePagamento(comprovante);
            atleta.setUsuario(usuario);
            atleta.setAcademia(academia);
            return atletaRepository.save(atleta);
        });
    }

    private void garantirInscricao(Atleta atleta, Evento evento, CategoriaPeso categoriaPeso, StatusInscricao status) {
        if (atleta == null || evento == null) return;
        if (!inscricaoRepository.existsByAtletaIdAndEventoId(atleta.getId(), evento.getId())) {
            Inscricao inscricao = new Inscricao(atleta, evento, categoriaPeso);
            inscricao.setStatus(status != null ? status : StatusInscricao.CONFIRMADA);
            inscricaoRepository.save(inscricao);
        }
    }

    private void garantirEscalaArbitro(
            Usuario arbitro,
            Evento evento,
            String funcao,
            StatusPresencaArbitro status,
            String observacoes
    ) {
        if (arbitro == null || evento == null) return;
        if (!escalaArbitroRepository.existsByArbitroIdAndEventoId(arbitro.getId(), evento.getId())) {
            EscalaArbitro escala = new EscalaArbitro(arbitro, evento, funcao, status);
            escala.setObservacoes(observacoes);
            if (status == StatusPresencaArbitro.CONFIRMADO) {
                escala.setDataConfirmacao(LocalDateTime.now().minusHours(2));
            }
            escalaArbitroRepository.save(escala);
        }
    }

    private void garantirLancamentoFinanceiro(
            TipoTransacao tipo,
            String descricao,
            Double valor,
            String comprovanteUrl,
            Atleta atleta,
            Academia academia,
            String metodoPagamento,
            String statusTransacao,
            String observacoes
    ) {
        if (!fluxoCaixaRepository.existsByDescricao(descricao)) {
            FluxoCaixa lancamento = new FluxoCaixa(
                    tipo,
                    descricao,
                    valor,
                    comprovanteUrl,
                    atleta,
                    academia,
                    "admin@fmttema.com"
            );
            lancamento.setMetodoPagamento(metodoPagamento);
            lancamento.setStatusTransacao(statusTransacao);
            lancamento.setObservacoes(observacoes);
            fluxoCaixaRepository.save(lancamento);
        }
    }
}
