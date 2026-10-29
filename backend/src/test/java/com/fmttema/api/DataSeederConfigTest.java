package com.fmttema.api;

import com.fmttema.api.config.DataSeederConfig;
import com.fmttema.api.dto.ChaveCategoriaDTO;
import com.fmttema.api.dto.ChaveamentoResponseDTO;
import com.fmttema.api.dto.UsuarioResponseDTO;
import com.fmttema.api.models.Academia;
import com.fmttema.api.models.CategoriaPeso;
import com.fmttema.api.models.Evento;
import com.fmttema.api.models.FluxoCaixa;
import com.fmttema.api.models.Inscricao;
import com.fmttema.api.models.PerfilAcesso;
import com.fmttema.api.models.StatusEvento;
import com.fmttema.api.models.StatusInscricao;
import com.fmttema.api.models.StatusUsuario;
import com.fmttema.api.models.Usuario;
import com.fmttema.api.repositories.AcademiaRepository;
import com.fmttema.api.repositories.AtletaRepository;
import com.fmttema.api.repositories.CategoriaPesoRepository;
import com.fmttema.api.repositories.EventoRepository;
import com.fmttema.api.repositories.FluxoCaixaRepository;
import com.fmttema.api.repositories.InscricaoRepository;
import com.fmttema.api.repositories.UsuarioRepository;
import com.fmttema.api.services.GeradorChavesService;
import com.fmttema.api.services.UsuarioService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DataSeederConfigTest {

    @Autowired
    private DataSeederConfig dataSeederConfig;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AcademiaRepository academiaRepository;

    @Autowired
    private AtletaRepository atletaRepository;

    @Autowired
    private CategoriaPesoRepository categoriaPesoRepository;

    @Autowired
    private EventoRepository eventoRepository;

    @Autowired
    private InscricaoRepository inscricaoRepository;

    @Autowired
    private FluxoCaixaRepository fluxoCaixaRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private GeradorChavesService geradorChavesService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("1. Idempotência Estrita: Executar DataSeederConfig múltiplas vezes não duplica registros nem viola Unique Constraints")
    void deveSerEstritamenteIdempotenteAoExecutarMultiplasVezes() {
        long totalUsuariosAntes = usuarioRepository.count();
        long totalAcademiasAntes = academiaRepository.count();
        long totalAtletasAntes = atletaRepository.count();
        long totalInscricoesAntes = inscricaoRepository.count();
        long totalFluxoAntes = fluxoCaixaRepository.count();

        assertDoesNotThrow(() -> {
            dataSeederConfig.run();
            dataSeederConfig.run();
        });

        assertEquals(totalUsuariosAntes, usuarioRepository.count(), "Não deve duplicar usuários após múltiplas execuções");
        assertEquals(totalAcademiasAntes, academiaRepository.count(), "Não deve duplicar academias após múltiplas execuções");
        assertEquals(totalAtletasAntes, atletaRepository.count(), "Não deve duplicar atletas após múltiplas execuções");
        assertEquals(totalInscricoesAntes, inscricaoRepository.count(), "Não deve duplicar inscrições após múltiplas execuções");
        assertEquals(totalFluxoAntes, fluxoCaixaRepository.count(), "Não deve duplicar lançamentos financeiros após múltiplas execuções");
    }

    @Test
    @DisplayName("2. Perfis e Fila de Pendências (US01/US03): Todos os 5 perfis com BCrypt, 3 atletas e 2 academias pendentes e contas suspensas")
    void devePopularTodosOsPerfisEFilaDePendenciasESuspensas() {
        List<Usuario> todosUsuarios = usuarioRepository.findAll();
        Set<PerfilAcesso> perfisPresentes = todosUsuarios.stream()
                .map(Usuario::getPerfil)
                .collect(Collectors.toSet());

        assertTrue(perfisPresentes.contains(PerfilAcesso.ADMIN), "Deve conter conta ADMIN");
        assertTrue(perfisPresentes.contains(PerfilAcesso.ATLETA), "Deve conter conta ATLETA");
        assertTrue(perfisPresentes.contains(PerfilAcesso.ACADEMIA), "Deve conter conta ACADEMIA");
        assertTrue(perfisPresentes.contains(PerfilAcesso.ARBITRO), "Deve conter conta ARBITRO");
        assertTrue(perfisPresentes.contains(PerfilAcesso.TREINADOR), "Deve conter conta TREINADOR");

        // Verifica senhas criptografadas em BCrypt nas contas padrão
        Usuario admin = usuarioRepository.findByEmail("admin@fmttema.com").orElseThrow();
        assertTrue(passwordEncoder.matches("admin123", admin.getSenha()));

        Usuario atletaPadrao = usuarioRepository.findByEmail("atleta@fmttema.com").orElseThrow();
        assertTrue(passwordEncoder.matches("123456", atletaPadrao.getSenha()));

        // Fila de pendências (US03): pelo menos 3 atletas e 2 academias aguardando aprovação
        List<UsuarioResponseDTO> filaPendentes = usuarioService.listarPendentes();
        long atletasPendentes = filaPendentes.stream()
                .filter(u -> u.perfil() == PerfilAcesso.ATLETA)
                .count();
        long academiasPendentes = filaPendentes.stream()
                .filter(u -> u.perfil() == PerfilAcesso.ACADEMIA)
                .count();

        assertTrue(atletasPendentes >= 3, "Deve haver pelo menos 3 atletas pendentes de aprovação na fila");
        assertTrue(academiasPendentes >= 2, "Deve haver pelo menos 2 academias pendentes de aprovação na fila");

        // Contas com status SUSPENSA
        List<Usuario> contasSuspensas = usuarioRepository.findByStatus(StatusUsuario.SUSPENSA);
        assertFalse(contasSuspensas.isEmpty(), "Deve haver registros com status SUSPENSA para casos de borda");

        // Verossimilhança regional (cidades do Maranhão)
        List<String> cidadesAcademias = academiaRepository.findAll().stream()
                .map(Academia::getCidade)
                .filter(c -> c != null)
                .toList();
        assertTrue(cidadesAcademias.stream().anyMatch(c -> c.contains("São Luís")), "Deve conter academia em São Luís");
        assertTrue(cidadesAcademias.stream().anyMatch(c -> c.contains("Imperatriz")), "Deve conter academia em Imperatriz");
        assertTrue(cidadesAcademias.stream().anyMatch(c -> c.contains("Barreirinhas")), "Deve conter academia em Barreirinhas");
        assertTrue(cidadesAcademias.stream().anyMatch(c -> c.contains("Caxias")), "Deve conter academia em Caxias");
    }

    @Test
    @DisplayName("3. Licenças e Credenciamento: Treinadores e Árbitros (estadual, nacional, internacional) vigentes e vencidos")
    void devePopularTreinadoresEArbitrosComLicencasVigentesEVencidas() {
        LocalDate hoje = LocalDate.now();

        List<Usuario> treinadores = usuarioRepository.findAll().stream()
                .filter(u -> u.getPerfil() == PerfilAcesso.TREINADOR)
                .toList();

        assertTrue(treinadores.stream().anyMatch(t -> t.getDataValidadeLicenca() != null && t.getDataValidadeLicenca().isAfter(hoje)),
                "Deve existir pelo menos 1 treinador com licença dentro da validade");
        assertTrue(treinadores.stream().anyMatch(t -> t.getDataValidadeLicenca() != null && t.getDataValidadeLicenca().isBefore(hoje)),
                "Deve existir pelo menos 1 treinador com data_validade_licenca expirada");

        List<Usuario> arbitros = usuarioRepository.findAll().stream()
                .filter(u -> u.getPerfil() == PerfilAcesso.ARBITRO && u.getNivelArbitragem() != null)
                .toList();

        for (String nivel : List.of("estadual", "nacional", "internacional")) {
            assertTrue(arbitros.stream().anyMatch(a -> nivel.equalsIgnoreCase(a.getNivelArbitragem())
                            && a.getDataValidadeLicenca() != null && a.getDataValidadeLicenca().isAfter(hoje)),
                    "Deve existir árbitro nível " + nivel + " com licença vigente");
            assertTrue(arbitros.stream().anyMatch(a -> nivel.equalsIgnoreCase(a.getNivelArbitragem())
                            && a.getDataValidadeLicenca() != null && a.getDataValidadeLicenca().isBefore(hoje)),
                    "Deve existir árbitro nível " + nivel + " com licença vencida");
        }
    }

    @Test
    @DisplayName("4. Torneios e Chaveamento com 'Bye' (US06/US07.1): 3 status de eventos e número ímpar de atletas acionando o Bye")
    void devePopularTorneiosEmTodosOsStatusEValidarRegraDoByeComNumeroImpar() {
        assertFalse(eventoRepository.findByStatus(StatusEvento.AGENDADO).isEmpty(), "Deve existir competição planejada (AGENDADO)");
        assertFalse(eventoRepository.findByStatus(StatusEvento.EM_ANDAMENTO).isEmpty(), "Deve existir competição em andamento (EM_ANDAMENTO)");
        assertFalse(eventoRepository.findByStatus(StatusEvento.FINALIZADO).isEmpty(), "Deve existir competição encerrada (FINALIZADO)");

        CategoriaPeso catPesado = categoriaPesoRepository.findAll().stream()
                .filter(c -> "Peso-Pesado".equalsIgnoreCase(c.getNome()))
                .findFirst()
                .orElseThrow();

        // Localiza a competição EM_ANDAMENTO que possui inscrições na categoria Peso-Pesado
        Evento eventoComChaveImpar = eventoRepository.findByStatus(StatusEvento.EM_ANDAMENTO).stream()
                .filter(ev -> !inscricaoRepository.findByEventoIdAndCategoriaPesoIdOrderByAtletaVitoriasDesc(ev.getId(), catPesado.getId()).isEmpty())
                .findFirst()
                .orElseThrow();

        ChaveamentoResponseDTO chaveamento = geradorChavesService.gerarChavesPorEvento(eventoComChaveImpar.getId());
        ChaveCategoriaDTO chaveGerada = chaveamento.categorias().stream()
                .filter(c -> catPesado.getId().equals(c.categoriaId()))
                .findFirst()
                .orElseThrow();

        assertTrue(chaveGerada.totalInscritos() % 2 != 0 && chaveGerada.totalInscritos() >= 5,
                "Deve ter número ímpar de atletas inscritos (>= 5) para forçar o caso de borda do Bye");
        assertTrue(chaveGerada.temBye(), "A regra técnica do Bye deve ser acionada automaticamente para número ímpar de atletas");
        assertNotNull(chaveGerada.atletaBye(), "O cabeça de chave #1 (maior número de vitórias) deve receber o Bye");
        assertEquals("Lucas Oliveira", chaveGerada.atletaBye().nome(), "Lucas Oliveira (10 vitórias) deve avançar direto pelo Bye");
    }

    @Test
    @DisplayName("5. Cenários Financeiros e Inscrições: Todos os status de inscrição e todos os métodos/status de pagamento")
    void devePopularCenariosFinanceirosEInscricoesCompletos() {
        Set<StatusInscricao> statusInscricoes = inscricaoRepository.findAll().stream()
                .map(Inscricao::getStatus)
                .collect(Collectors.toSet());

        assertTrue(statusInscricoes.contains(StatusInscricao.CONFIRMADA), "Deve conter inscrição CONFIRMADA");
        assertTrue(statusInscricoes.contains(StatusInscricao.PENDENTE), "Deve conter inscrição PENDENTE");
        assertTrue(statusInscricoes.contains(StatusInscricao.CANCELADA), "Deve conter inscrição CANCELADA");

        List<FluxoCaixa> lancamentos = fluxoCaixaRepository.findAll();

        Set<String> metodos = lancamentos.stream()
                .map(FluxoCaixa::getMetodoPagamento)
                .filter(m -> m != null)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        assertTrue(metodos.containsAll(List.of("PIX", "CARTAO", "BOLETO", "DINHEIRO")),
                "Deve cobrir todos os métodos de pagamento: PIX, CARTAO, BOLETO e DINHEIRO");

        Set<String> statusTransacoes = lancamentos.stream()
                .map(FluxoCaixa::getStatusTransacao)
                .filter(s -> s != null)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        assertTrue(statusTransacoes.containsAll(List.of("APROVADO", "PENDENTE", "RECUSADO", "ESTORNADO")),
                "Deve cobrir todos os status de pagamento: APROVADO, PENDENTE, RECUSADO e ESTORNADO");
    }
}
