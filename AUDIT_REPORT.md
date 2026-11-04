# Relatório de Auditoria Técnica Fullstack e Revisão Arquitetural — FMTTEMA

**Projeto**: Federação Maranhense de Tradicional Muaythai e Muayboran (FMTTEMA)  
**Versão da Auditoria**: 1.0.0 — Documento Oficial Consolidado  
**Data de Emissão**: 2026-11-04  
**Responsável Técnico**: Worker 1 (Master Technical Audit Author)  
**Escopo**: Auditoria de Segurança, Controle de Acesso Baseado em Funções (RBAC), Qualidade de Frontend & UX, Robustez Arquitetural Spring Boot 3 / React 18 e Integridade de Regras de Negócio Federativas.  
**Modo de Execução**: Somente Leitura (Read-Only) — Nenhuma modificação direta foi aplicada ao código-fonte ou submetida ao Git.

---

## 1. Sumário Executivo da Auditoria Técnica

### 1.1. Visão Geral da Auditoria Fullstack
A Federação Maranhense de Tradicional Muaythai e Muayboran (FMTTEMA) implementou uma plataforma integrada moderna composta por uma API RESTful em **Java 17 / Spring Boot 3.2.3** e uma aplicação Web Single Page Application (SPA) em **React 18 / Vite / TailwindCSS**. O objetivo primordial do sistema é gerenciar com integridade institucional a filiação de academias, o cadastro e cartel de atletas, o ciclo financeiro de anuidades, a convocação e gestão do corpo arbitral, e a execução de torneios oficiais com geração e persistência de chaveamento eliminatório.

Durante o ciclo de auditoria técnica profunda, foram inspecionadas ponta a ponta as camadas de persistência (Spring Data JPA / Hibernate), segurança (Spring Security 6 / JWT), controladores REST, serviços de domínio, contextos de estado do cliente (`AuthContext.jsx`), interceptores de rede (`api.js`), roteamento (`PrivateRoute.jsx`) e interfaces de usuário (`.jsx`).

### 1.2. Quadro Resumo de Severidades e Classificação de Riscos

| Severidade | Quantidade | Áreas / Pilares Afetados | Descrição do Impacto Institucional |
| :--- | :---: | :--- | :--- |
| **Crítica (P0)** | **4** | Segurança Central, RBAC, Criptografia, Persistência JPA | Exposição direta de credenciais criptográficas (hashes BCrypt), autocadastro público de administradores com ativação automática, vazamento irrestrito de PII/LGPD de atletas e inconsistência transacional gerando usuários órfãos. |
| **Alta (P1)** | **7** | RBAC, Integridade Multi-Tenant, Arquitetura Backend, Uploads | Erro HTTP 403 Forbidden para o perfil ACADEMIA mascarado por mocks, isolamento simulado por filtros de string (`includes('imperatriz')`), ausência total de `@RestControllerAdvice`, upload simulado no módulo financeiro, vulnerabilidade IDOR em inscrições e concessão indevida de privilégios de arbitragem. |
| **Média (P2)** | **6** | Regras de Negócio, Validação de Dados (Bean Validation), UX | Convocação de árbitros com licença vencida/suspensa, ausência de checagem da regularidade da academia na inscrição, ausência de UX preventiva (rejeição reativa 400 por peso nulo), empty states retornando telas em branco (`return null;`) e bypass da camada Service. |
| **Baixa (P3)** | **2** | UX / Interface com Navegador, Padronização REST | Utilização de chamadas bloqueantes nativas do navegador (`alert`, `window.confirm`) e anomalia de retorno HTTP 404 associado a array vazio `[]`. |
| **TOTAL** | **19** | Fullstack (Backend, Frontend, UX, Banco de Dados, Segurança) | Panorama consolidado de oportunidades de evolução técnica prioritárias. |

### 1.3. Diagnóstico Geral do Estado do Projeto
O ecossistema FMTTEMA possui uma excelente fundamentação tecnológica e modelagem conceitual rica em entidades do esporte (cartéis, kruangs, confrontos, chaves e escalas). No entanto, o projeto encontra-se em um estágio em que **a autorização de segurança foi terceirizada perigosamente para a interface com o usuário (client-side)**, enquanto o backend falha em impor limites rígidos de autorização vertical e horizontal:
1. **Quebra de Confidencialidade**: Credenciais e dados protegidos por sigilo constitucional e pela LGPD trafegam sem sanitização em endpoints abertos ou semi-abertos.
2. **Fragilidade Multi-Tenant**: Perfis federados não-administradores (`TREINADOR`, `ACADEMIA`, `ATLETA`) recebem coleções completas de terceiros e dependem de filtros artificiais no React para selecionar suas agremiações.
3. **Mocks e Ilusão de Funcionamento**: Falhas reais de permissão backend (como o 403 em anuidades) foram camufladas no frontend com dados fixos em bloco `catch`, criando divergência entre o comportamento simulado na interface e a realidade do banco de dados.

---

## 2. Seção Pilar 1: Matriz de Perfis (RBAC Ponta a Ponta)

### 2.1. Tabela Comparativa dos 5 Perfis Auditados
A tabela a seguir consolida a avaliação analítica detalhada dos cinco papéis institucionais definidos em `PerfilAcesso.java`:

| Perfil | Permissões Esperadas | Permissões Efetivas no Backend | Comportamento Observado no Frontend | Vulnerabilidades & Inconsistências Identificadas |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Gestão institucional irrestrita: atletas, academias, eventos, homologação de súmulas, tesouraria e escalas arbitrais. | Acesso concedido a todos os controladores (`@PreAuthorize("hasRole('ADMIN')")`). | Acesso total à barra lateral de navegação (`Sidebar.jsx`) e a todos os módulos analíticos. | 1. Exposição de hashes BCrypt ao consultar `GET /api/arbitros`.<br>2. Sistema permite convocar árbitros com licença vencida.<br>3. Autocadastro público aceita criação de administradores sem aprovação. |
| **ATLETA** | Consultar própria ficha (`/me`), inscrever-se em eventos (se adimplente), visualizar chaveamento oficial e rankings. | Acesso ao próprio perfil em `/api/atletas/me`, porém consegue listar **todos** os atletas e CPFs em `GET /api/atletas`. Consegue inscrever qualquer terceiro em torneios. | Interface oculta dados de rivais no painel do atleta, mas requisições no console do navegador revelam o diretório estadual completo. | 1. Violação de privacidade e LGPD em `GET /api/atletas`.<br>2. IDOR na inscrição em torneios (`InscricaoRequestDTO.atletaId`).<br>3. Acesso à aba "Financeiro" tenta chamar `/api/financeiro/anuidades` e gera 403 Forbidden. |
| **ACADEMIA** | Consultar própria ficha cadastral, emitir/consultar anuidade da agremiação, gerenciar atletas filiados à academia. | Consegue cadastrar e listar agremiações. **Bloqueada com HTTP 403** em `/api/financeiro/anuidades`. Ausência completa do endpoint `GET /api/academias/me`. | Falha de 403 Forbidden mascarada via `try/catch` com mock hardcoded de anuidade. Lista de atletas de rivais é filtrada no client-side com heurística de texto. | 1. Erro 403 Forbidden em anuidade.<br>2. Ausência de endpoint próprio `/me`.<br>3. Hack de filtro por string `email.includes('imperatriz')`.<br>4. Recebe dados cadastrais e financeiros de atletas concorrentes. |
| **ARBITRO** | Consultar escalas próprias (`/api/arbitros/me/escalas`), confirmar/recusar presenças e registrar súmula apenas das lutas que apita. | Acesso a `/me/escalas`. Consegue registrar vencedor em **qualquer confronto do sistema** (`/api/confrontos/{id}/vencedor`) e possui autorização para persistir chaves. | Interface focada em convocações. Botão de gerar chaves é suprimido na UI. | 1. Arbitragem e homologação de lutas para as quais não foi escalado.<br>2. Backend autoriza persistência de chaves oficiais por árbitros.<br>3. Permissão para atuar com licença vencida ou status suspenso. |
| **TREINADOR** | Gerenciar cartel e histórico dos atletas de sua própria agremiação e inscrever sua equipe em torneios. | Consegue alterar cartel de **qualquer atleta da federação** (`/api/atletas/{id}/cartel`). Consegue ler balanço e faturamento em `/api/dashboard/resumo`. | Filtra atletas da sua academia no cliente usando substring `email.includes('imperatriz')`. Painel financeiro analítico é oculto na UI. | 1. Falha de isolamento multi-tenant: alteração de cartel de agremiações rivais.<br>2. Acesso a dados financeiros e estratégicos confidenciais da federação.<br>3. Autorização indevida para gerar e persistir chaves oficiais de eventos. |

---

### 2.2. Diagnóstico Detalhado das Vulnerabilidades e Inconsistências de RBAC

#### 2.2.1. Vazamento de Dados Pessoais (PII / LGPD) em `GET /api/atletas`
* **Arquivos e Linhas**:
  * `backend/src/main/java/com/fmttema/api/controllers/AtletaController.java`: Linhas 132–135
  * `backend/src/main/java/com/fmttema/api/security/SecurityConfig.java`: Linha 65
  * `backend/src/main/java/com/fmttema/api/dto/AtletaResponseDTO.java`: Linhas 9–27
* **Trechos de Código Exatos**:
  ```java
  // AtletaController.java:132-135
  @GetMapping
  public ResponseEntity<List<AtletaResponseDTO>> listarTodos() {
      return ResponseEntity.ok(atletaService.listarTodos());
  }
  ```
  ```java
  // SecurityConfig.java:65
  .anyRequest().authenticated()
  ```
  ```java
  // AtletaResponseDTO.java:9-27
  public record AtletaResponseDTO(
          Long id,
          String nome,
          String apelido,
          String cpf,
          Double peso,
          String categoria,
          LocalDate dataNascimento,
          String graduacao,
          String kruang,
          Integer vitorias,
          Integer derrotas,
          Integer empates,
          String email,
          StatusUsuario status,
          StatusPagamento statusPagamento,
          Long academiaId,
          String academiaNome
  )
  ```
* **Diagnóstico e Impacto**:  
  O método `listarTodos()` não possui a anotação `@PreAuthorize("hasRole('ADMIN')")`. Na cadeia de filtros do Spring Security, o endpoint não tem correspondência específica e cai na regra de fallback `.anyRequest().authenticated()`. Como resultado, qualquer usuário autenticado com perfil `ATLETA`, `ACADEMIA`, `ARBITRO` ou `TREINADOR` pode executar uma requisição HTTP direta e baixar a lista completa de todos os atletas do estado do Maranhão contendo **CPF, data de nascimento, endereço de e-mail e status financeiro de adimplência**. Isso configura uma violação direta do princípio de menor privilégio e dos artigos 6º (finalidade e necessidade) e 46 (segurança) da Lei Geral de Proteção de Dados (LGPD — Lei Federal nº 13.709/2018).

---

#### 2.2.2. Integridade do Perfil ACADEMIA: Erro 403 Forbidden e Ausência de `GET /api/academias/me`
* **Arquivos e Linhas**:
  * `backend/src/main/java/com/fmttema/api/controllers/FinanceiroController.java`: Linhas 24–27 e 68–71
  * `backend/src/main/java/com/fmttema/api/controllers/AcademiaController.java`: Linhas 43–84
  * `backend/src/main/java/com/fmttema/api/security/SecurityConfig.java`: Linha 62
  * `frontend/src/components/PainelFinanceiroAnuidades.jsx`: Linhas 72–94 e 146–152
* **Trechos de Código Exatos**:
  ```java
  // FinanceiroController.java:24-27, 68-71
  @RestController
  @RequestMapping("/api/financeiro")
  @PreAuthorize("hasRole('ADMIN')")
  public class FinanceiroController {
  ...
      @GetMapping("/anuidades")
      public ResponseEntity<List<AnuidadeDTO>> listarAnuidades() {
          return ResponseEntity.ok(financeiroService.listarTodasAnuidades());
      }
  ```
  ```javascript
  // PainelFinanceiroAnuidades.jsx:72-94
  try {
    const response = await api.get('/api/financeiro/anuidades');
    setAnuidades(response.data || []);
  } catch (errAnuidades) {
    if (isAcademia) {
      // Fallback caso o backend restrinja /api/financeiro/anuidades apenas ao Admin
      setAnuidades([
        {
          id: 1,
          nome: user?.email?.includes('imperatriz')
            ? 'Arena Tocantins Muaythai'
            : 'Centro de Treinamento FMTTEMA',
          tipo: 'ACADEMIA',
          documento: '12.345.678/0001-01',
          email: user?.email || 'academia@fmttema.com',
          statusPagamento: 'PAGO',
          comprovante: 'https://comprovantes.fmttema.com/2026/anuidade_ct_fmttema_pix.pdf'
        }
      ]);
    } else {
      throw errAnuidades;
    }
  }
  ```
  ```javascript
  // PainelFinanceiroAnuidades.jsx:146-152
  if (isAcademia) {
    return item.tipo === 'ACADEMIA' && (
      anuidades.length === 1 ||
      (item.email && user?.email && item.email.toLowerCase() === user.email.toLowerCase()) ||
      (item.nome && item.nome.toLowerCase().includes('centro de treinamento'))
    );
  }
  ```
* **Diagnóstico e Impacto**:  
  O módulo de finanças da federação está hermeticamente blindado para `hasRole('ADMIN')` tanto na anotação de classe do Spring quanto na regra `.requestMatchers("/api/financeiro/**").hasRole("ADMIN")` do `SecurityConfig.java`. Quando o usuário do perfil `ACADEMIA` acessa o painel financeiro para conferir sua anuidade, o backend responde com `HTTP 403 Forbidden`. Em vez de solucionar o problema de arquitetura (criando um endpoint `GET /api/academias/me/anuidade`), o desenvolvedor capturou o erro de rede no frontend e forçou a renderização de um registro falso com documento `12.345.678/0001-01` e status `PAGO`. Além disso, em `AcademiaController.java` não existem métodos para auto-consulta (`/me`) ou listagem dos atletas vinculados, deixando a academia orfã de serviços oficiais no backend.

---

#### 2.2.3. Filtros Artificiais por String e Quebra de Isolamento Multi-Tenant
* **Arquivos e Linhas**:
  * `frontend/src/components/PainelInscricoesTorneio.jsx`: Linhas 79–96
  * `frontend/src/components/PerfilCartelAtleta.jsx`: Linhas 85–105
  * `frontend/src/components/ArvoreTorneio.jsx`: Linhas 51–53
* **Trechos de Código Exatos**:
  ```javascript
  // PainelInscricoesTorneio.jsx:84-93
  // Treinador vê apenas atletas da sua agremiação
  const academiaFiltro = user?.email?.includes('imperatriz')
    ? 'Arena Tocantins Muaythai'
    : 'Centro de Treinamento FMTTEMA';

  const atletasMinhaEquipe = todos.filter(a =>
    (a.academiaNome && a.academiaNome.toLowerCase().includes(academiaFiltro.toLowerCase())) ||
    (a.email === user?.email)
  );
  setListaAtletas(atletasMinhaEquipe);
  ```
  ```javascript
  // PerfilCartelAtleta.jsx:94-104
  // Treinador e Academia enxergam EXCLUSIVAMENTE os atletas vinculados à sua própria agremiação
  const academiaFiltro = user?.email?.includes('imperatriz')
    ? 'Arena Tocantins Muaythai'
    : 'Centro de Treinamento FMTTEMA';

  const atletasMinhaAcademia = todosAtletas.filter(a =>
    (a.academiaNome && a.academiaNome.toLowerCase().includes(academiaFiltro.toLowerCase())) ||
    (a.email === user?.email)
  );
  setListaAtletas(atletasMinhaAcademia);
  ```
  ```javascript
  // ArvoreTorneio.jsx:51-53
  if (lista.length > 0) {
    const eventoEmAndamento = lista.find(e => e.nome?.toLowerCase().includes('maranhense'));
    const idInicial = eventoIdInicial || eventoEmAndamento?.id || lista[0].id;
  ```
* **Diagnóstico e Impacto**:  
  O backend transfere indiscriminadamente os registros de todos os atletas do estado para o navegador de treinadores e donos de academia. O frontend aplica uma lógica ingênua de separação: se o e-mail do usuário contiver a string `'imperatriz'`, ele visualiza os atletas da agremiação "Arena Tocantins Muaythai"; caso contrário, o frontend assume arbitrariamente que o usuário é do "Centro de Treinamento FMTTEMA". Esta técnica não oferece nenhuma segurança (qualquer treinador pode abrir o painel de rede do navegador e ver a lista bruta com todos os atletas concorrentes) e quebra imediatamente caso um usuário de Imperatriz mude de e-mail ou uma nova academia seja filiada.

---

#### 2.2.4. Vazamento Crítico de Credenciais e Hashes BCrypt em `GET /api/arbitros`
* **Arquivos e Linhas**:
  * `backend/src/main/java/com/fmttema/api/controllers/ArbitroController.java`: Linhas 163–170
  * `backend/src/main/java/com/fmttema/api/models/Usuario.java`: Linha 35
* **Trechos de Código Exatos**:
  ```java
  // ArbitroController.java:163-170
  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> listarArbitros() {
      List<Usuario> arbitros = usuarioRepository.findAll().stream()
              .filter(u -> u.getPerfil() == PerfilAcesso.ARBITRO)
              .toList();
      return ResponseEntity.ok(arbitros);
  }
  ```
  ```java
  // Usuario.java:34-36
  @Column(nullable = false, length = 255)
  private String senha;
  ```
* **Diagnóstico e Impacto**:  
  O endpoint `listarArbitros()` retorna a lista de entidades JPA `Usuario` diretamente no corpo da resposta HTTP. A entidade `Usuario.java` não possui `@JsonIgnore` nem `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)` sobre o atributo `senha`. Embora a classe `UsuarioResponseDTO` tenha sido declarada no pacote `dto`, ela foi ignorada pelo desenvolvedor neste endpoint. Dessa forma, a serialização Jackson converte o objeto completo em JSON, expondo o hash BCrypt (`$2a$10$...`) de todos os árbitros federados na rede. Caso um invasor obtenha credenciais de admin ou explore um token comprometido, pode extrair a base de hashes para quebra offline (ataques de dicionário e Rainbow Tables).

---

#### 2.2.5. Convocação de Árbitros Inaptos e Falha de Autorização em Súmulas Oficiais
* **Arquivos e Linhas**:
  * `backend/src/main/java/com/fmttema/api/services/EscalaArbitroService.java`: Linhas 75–99
  * `backend/src/main/java/com/fmttema/api/config/DataSeederConfig.java`: Linhas 264–274 e 289–298
  * `backend/src/main/java/com/fmttema/api/services/ConfrontoService.java`: Linhas 151–172
  * `backend/src/main/java/com/fmttema/api/controllers/ConfrontoController.java`: Linha 37
* **Trechos de Código Exatos**:
  ```java
  // EscalaArbitroService.java:75-99
  @Transactional
  public EscalaArbitroResponseDTO convocarArbitro(EscalaArbitroRequestDTO dto) {
      Usuario arbitro = usuarioRepository.findById(dto.arbitroId())
              .orElseThrow(() -> new EntityNotFoundException("Árbitro não encontrado com ID: " + dto.arbitroId()));

      if (arbitro.getPerfil() != PerfilAcesso.ARBITRO && arbitro.getPerfil() != PerfilAcesso.ADMIN) {
          throw new IllegalArgumentException("O usuário selecionado não possui perfil de Árbitro.");
      }

      Evento evento = eventoRepository.findById(dto.eventoId())
              .orElseThrow(() -> new EntityNotFoundException("Evento não encontrado com ID: " + dto.eventoId()));

      if (escalaArbitroRepository.existsByArbitroIdAndEventoId(dto.arbitroId(), dto.eventoId())) {
          throw new IllegalStateException("Este árbitro já está escalado para este evento.");
      }
      ...
  ```
  ```java
  // ConfrontoController.java:36-37
  @PatchMapping("/{id}/vencedor")
  @PreAuthorize("hasAnyRole('ADMIN', 'ARBITRO')")
  public ResponseEntity<?> registrarVencedor(...)
  ```
* **Diagnóstico e Impacto**:  
  1. O método `convocarArbitro` verifica apenas se o usuário possui perfil de árbitro e se já foi cadastrado para o evento. Ele **nunca** verifica se `arbitro.getDataValidadeLicenca()` está expirada nem se `arbitro.getStatus() == StatusUsuario.ATIVO`. No `DataSeederConfig.java`, existem contas de árbitros com licença vencida há meses e status `SUSPENSA` (ex: `arbitro.estadual.vencido@fmttema.com`). Um administrador desavisado pode convocar um árbitro suspenso ou não credenciado, acarretando nulidade esportiva e riscos jurídicos a lutas federadas.
  2. Em `ConfrontoController.java:37`, qualquer usuário com perfil `ARBITRO` pode homologar o resultado de qualquer combate, mesmo sem ter sido escalado para a respectiva luta ou evento na tabela relacional `escalas_arbitros`.

---

#### 2.2.6. Escalada de Privilégios no Autocadastro e Manipulação de Estado no Cliente
* **Arquivos e Linhas**:
  * `backend/src/main/java/com/fmttema/api/controllers/AuthController.java`: Linhas 63–81
  * `backend/src/main/java/com/fmttema/api/models/Usuario.java`: Linha 197
  * `frontend/src/components/PrivateRoute.jsx`: Linhas 4–23
  * `frontend/src/context/AuthContext.jsx`: Linhas 8–11 e 31–33
* **Trechos de Código Exatos**:
  ```java
  // AuthController.java:63-81
  @PostMapping({"/register", "/registrar"})
  public ResponseEntity<?> register(@RequestBody @Valid RegisterRequestDTO dto) {
      if (usuarioRepository.existsByEmail(dto.email())) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(...));
      }

      String senhaCriptografada = passwordEncoder.encode(dto.senha());
      Usuario novoUsuario = new Usuario(dto.email(), senhaCriptografada, dto.perfil());
      usuarioRepository.save(novoUsuario);
  ```
  ```java
  // Usuario.java:196-198
  @Override
  public boolean isEnabled() {
      return true;
  }
  ```
  ```javascript
  // PrivateRoute.jsx:4-23
  export default function PrivateRoute() {
    const { isAuthenticated, loading } = useAuth();
    if (loading) { return (...); }
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <Outlet />;
  }
  ```
* **Diagnóstico e Impacto**:  
  O endpoint público `POST /auth/register` aceita o parâmetro `dto.perfil()` sem sanitização, permitindo que qualquer pessoa crie uma conta com perfil `ADMIN` ou `ARBITRO`. Em conjunto, a entidade `Usuario.java:197` retorna sempre `isEnabled() == true`, desconsiderando o enum `StatusUsuario.PENDENTE_APROVACAO`. Logo, o novo administrador recém-cadastrado via API pode efetuar login imediatamente sem aprovação da diretoria. Além disso, `PrivateRoute.jsx` valida unicamente a presença do token, e o perfil do usuário é mantido em texto plano no `localStorage.getItem('fmttema_user')`, permitindo que um usuário comum altere o JSON local no console para desbloquear telas e menus de administração no React.

---

#### 2.2.7. Discrepâncias de Permissão entre Backend e Frontend
* **Arquivos e Linhas**:
  * `backend/src/main/java/com/fmttema/api/controllers/DashboardController.java`: Linha 13
  * `backend/src/main/java/com/fmttema/api/security/SecurityConfig.java`: Linha 50 e Linha 63
  * `frontend/src/pages/Dashboard.jsx`: Linha 349
  * `backend/src/main/java/com/fmttema/api/controllers/EventoController.java`: Linha 168
  * `frontend/src/components/ArvoreTorneio.jsx`: Linha 213
* **Trechos de Código Exatos**:
  ```java
  // DashboardController.java:12-14
  @RestController
  @RequestMapping("/api/dashboard")
  @PreAuthorize("hasAnyRole('ADMIN', 'TREINADOR')")
  public class DashboardController {
  ```
  ```javascript
  // Dashboard.jsx:349
  {perfil === 'ADMIN' && (
    <PainelDashboardAnalitico />
  )}
  ```
  ```java
  // EventoController.java:167-168
  @PostMapping("/{id}/chaves/persistir")
  @PreAuthorize("hasAnyRole('ADMIN', 'TREINADOR', 'ARBITRO')")
  public ResponseEntity<?> persistirChavesOficiais(...)
  ```
  ```javascript
  // ArvoreTorneio.jsx:213
  {isAdmin && (
    <button onClick={handleSalvarChavesOficiais} ...>
      Persistir Chaves Oficiais
    </button>
  )}
  ```
* **Diagnóstico e Impacto**:  
  1. Em `/api/dashboard/resumo`, o backend concede acesso a `TREINADOR`. Esse endpoint retorna faturamento total, saldo financeiro em caixa e indicadores analíticos globais da federação. A UI esconde o painel do treinador com a diretiva `{perfil === 'ADMIN' && (...)}`, mas a API entrega dados financeiros confidenciais a qualquer treinador que faça um `curl` com seu token JWT.
  2. Em `/api/eventos/{id}/chaves/persistir`, o backend autoriza `TREINADOR` e `ARBITRO` a gravarem chaves oficiais e gerarem confrontos eliminatórios no banco de dados, enquanto no frontend a ação é restrita a administradores. Um treinador com conhecimento técnico poderia alterar as chaves de um campeonato oficial diretamente pela API.

---

## 3. Seção Pilar 2: Frontend, UX e Integração

### 3.1. Dados Mockados e Fallbacks Artificiais

#### 3.1.1. Injeção de Dados Falsos de Anuidade e Comprovantes
* **Arquivo**: `frontend/src/components/PainelFinanceiroAnuidades.jsx` (Linha 65 e Linhas 76–94)
* **Código Identificado**:
  ```javascript
  // Linha 65
  comprovante: atl.comprovantePagamento || 'https://comprovantes.fmttema.com/2026/pix_anuidade_atleta.pdf'

  // Linhas 76-94
  if (isAcademia) {
    setAnuidades([
      {
        id: 1,
        nome: user?.email?.includes('imperatriz')
          ? 'Arena Tocantins Muaythai'
          : 'Centro de Treinamento FMTTEMA',
        tipo: 'ACADEMIA',
        documento: '12.345.678/0001-01',
        email: user?.email || 'academia@fmttema.com',
        statusPagamento: 'PAGO',
        comprovante: 'https://comprovantes.fmttema.com/2026/anuidade_ct_fmttema_pix.pdf'
      }
    ]);
  }
  ```
* **Diagnóstico**: Quando a academia sofre o bloqueio 403 Forbidden do backend, ela visualiza um comprovante e uma anuidade fictícia com status "PAGO", dando ao gestor da academia a falsa impressão de que a agremiação está regularizada na federação.

#### 3.1.2. Tabela de Preços e Nomes de Arquivo Hardcoded no Modal de Baixa
* **Arquivo**: `frontend/src/components/ModalBaixaAnuidade.jsx` (Linha 7 e Linhas 18–19)
* **Código Identificado**:
  ```javascript
  // Linha 7
  const [valor, setValor] = useState(beneficiario?.tipo === 'ACADEMIA' ? 300.0 : 150.0);

  // Linhas 18-19
  const nomeSimulado = `comprovantes/${beneficiario.tipo.toLowerCase()}_${beneficiario.id}_${Date.now()}_${file.name}`;
  setComprovante(nomeSimulado);
  ```
* **Diagnóstico**: Os valores de taxa associativa (R$ 300,00 para academias e R$ 150,00 para atletas) estão gravados no código JSX, sem consulta à tabela de parâmetros financeiros da federação. O caminho do anexo é uma string forjada localmente.

#### 3.1.3. Chaveamento Volátil em Memória como Fallback Silencioso
* **Arquivo**: `frontend/src/components/ArvoreTorneio.jsx` (Linhas 131–137)
* **Código Identificado**:
  ```javascript
  // Fallback para geração simples em memória se persistir falhar
  try {
    const resFallback = await api.post(`/api/eventos/${eventoSelecionadoId}/chaves`);
    setChaveamento(resFallback.data);
    setSucessoMsg('Chaves de torneio geradas.');
  ```
* **Diagnóstico**: Caso ocorra uma falha de persistência no banco de dados ao salvar a árvore oficial do campeonato, o sistema silenciosamente invoca a geração em memória e apresenta a mensagem de sucesso. O usuário acredita que o chaveamento foi consolidado, mas os dados se perdem ao atualizar a página.

#### 3.1.4. Categorias de Peso e Parâmetros Estáticos no Cadastro Público
* **Arquivo**: `frontend/src/pages/CadastroPublico.jsx` (Linhas 25–35 e Linhas 73–86)
* **Diagnóstico**: O formulário utiliza uma constante estática `CATEGORIAS_PESO` no arquivo do cliente com valores padrão (`categoria: 'Peso-Leve'`, `graduacao: 'Branco'`, `cidade: 'São Luís - MA'`), sem sincronização dinâmica com as categorias ativas cadastradas na API.

#### 3.1.5. Fallbacks Textuais em Inscrições
* **Arquivo**: `frontend/src/components/PainelInscricoesTorneio.jsx` (Linhas 666, 671, 682)
* **Código Identificado**:
  * `ins.categoriaPesoNome || 'Categoria Padrão'`
  * `ins.status || 'CONFIRMADA'`
  * Fallback da data para o texto estático `'Recentemente'`.

---

### 3.2. Avaliação da UX Preventiva em Inscrições de Torneios

#### 3.2.1. Habilitação Indevida e Falha Reativa de Submissão
* **Arquivos e Linhas**:
  * `frontend/src/components/PainelInscricoesTorneio.jsx`: Linhas 382–482, Linha 508 e Linha 552
  * `backend/src/main/java/com/fmttema/api/services/InscricaoService.java`: Linhas 84–86
* **Trechos de Código Exatos**:
  ```javascript
  // PainelInscricoesTorneio.jsx:508
  <span className="font-heading font-extrabold text-slate-800">
    {atletaAtual.peso ? `${atletaAtual.peso} kg` : 'Não informado'}
  </span>

  // PainelInscricoesTorneio.jsx:552
  <button
    type="submit"
    disabled={enviando || jaInscrito || !anuidadeRegularizada || isFinalizado}
  ...
  ```
  ```java
  // InscricaoService.java:84-86
  if (atleta.getPeso() == null || atleta.getPeso() <= 0) {
      throw new IllegalArgumentException("O atleta precisa ter o peso corporal devidamente cadastrado no perfil.");
  }
  ```
* **Diagnóstico de UX**:
  1. A interface de inscrição solicita apenas a seleção do Torneio e do Atleta. Se o atleta selecionado não possuir peso homologado (`atleta.peso == null`), a interface renderiza o aviso `"Não informado"`, mas **mantém o botão de envio ativo e clicável**.
  2. O formulário não valida a presença de peso antes de enviar a requisição.
  3. Ao clicar em "Confirmar Inscrição", a requisição é despachada para a API, que rebate com erro HTTP 400 (`IllegalArgumentException`). O usuário é surpreendido por uma notificação vermelha abrupta no topo da tela, sem qualquer indicação de como corrigir o peso ou atalho para edição cadastral.

#### 3.2.2. Incoerência de Peso e Categoria no Cadastro Inicial
* **Arquivo**: `frontend/src/pages/CadastroPublico.jsx` (Linhas 382–398)
* **Diagnóstico**: O atleta pode preencher simultaneamente um peso corporal de `88.0 kg` e selecionar no `<select>` a opção de `Peso-Mosca (Até 51.0 kg)`. O formulário submete a combinação sem validar se o peso digitado se enquadra na faixa da categoria escolhida.

---

### 3.3. Diálogos Nativos do Navegador (`alert` e `window.confirm`)
A utilização de diálogos nativos bloqueia a thread de execução do JavaScript, destoa visualmente do design institucional da federação e prejudica a responsividade em dispositivos móveis.

* **Ocorrências Mapeadas**:
  1. **`frontend/src/components/GestaoEscalasArbitros.jsx` (Linha 80)**:
     ```javascript
     const handleConvocar = async (e) => {
       e.preventDefault();
       if (!formArbitroId || !eventoSelecionado) {
         alert('Selecione um árbitro e um evento.');
         return;
       }
     ```
     *Impacto*: Alerta modal síncrono do sistema operacional disparado na convocação de árbitros em vez de feedback visual na UI.
  2. **`frontend/src/components/PainelEscalaArbitro.jsx` (Linha 62)**:
     ```javascript
     const recusarPresenca = async (escalaId) => {
       if (!window.confirm('Tem certeza de que deseja informar impossibilidade de comparecimento neste evento?')) {
         return;
       }
     ```
     *Impacto*: Diálogo cinza nativo do navegador para recusa formal de escalação oficial de arbitragem.

---

### 3.4. Auditoria de Empty States (Telas e Componentes Vazios)

Diversos componentes apresentam comportamentos inadequados quando as listas retornam vazias, resultando em renderizações nulas que confundem o operador:

| Arquivo e Linha | Contexto do Componente | Comportamento Observado | Impacto na Experiência do Usuário (UX) |
| :--- | :--- | :--- | :--- |
| `frontend/src/components/PerfilCartelAtleta.jsx:163–165` | Nenhum atleta encontrado / lista vazia | `if (!atleta) return null;` | A tela fica completamente em branco, sem nenhuma mensagem indicativa de que não há atletas cadastrados ou vinculados. |
| `frontend/src/components/PerfilCartelAtleta.jsx:390` | Lista de atletas da academia vazia ou unitária | `{!isAtleta && listaAtletas.length > 1 && ...}` | Se a academia tiver apenas 1 ou nenhum atleta, a seção do plantel desaparece sem dar opção de novo cadastro. |
| `frontend/src/components/VitrineParceiros.jsx:133–135` | Ausência de patrocinadores cadastrados | `if (parceiros.length === 0) return null;` | A vitrine de parceiros some silenciosamente da Home e da página de Ranking sem um banner informativo de captação de apoiadores. |
| `frontend/src/components/PainelDashboardAnalitico.jsx:121` | Retorno vazio ou nulo da API de dashboard | `if (!resumo) return null;` | O bloco analítico desaparece sem alertar sobre falha na coleta das métricas financeiras. |

*Contraste Positivo*: Cabe ressaltar que telas como `GestaoEscalasArbitros.jsx:192`, `PainelEscalaArbitro.jsx:157`, `ArvoreTorneio.jsx:262` e `TabelaRankingEstadual.jsx:336` possuem excelentes empty states ilustrados com bordas tracejadas e ícones institucionais, demonstrando que a falha reside na inconsistência de adoção desses padrões nos componentes listados na tabela acima.

---

### 3.5. Fluxo de Upload de Comprovantes no Módulo Financeiro

#### 3.5.1. Descarte do Arquivo Binário e Simulação de Nome de Arquivo
* **Arquivo**: `frontend/src/components/ModalBaixaAnuidade.jsx` (Linhas 14–21 e Linhas 34–39)
* **Código Identificado**:
  ```javascript
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Cria um link local ou usa o nome do arquivo com timestamp para simulação realista
      const nomeSimulado = `comprovantes/${beneficiario.tipo.toLowerCase()}_${beneficiario.id}_${Date.now()}_${file.name}`;
      setComprovante(nomeSimulado);
    }
  };
  ```
* **Diagnóstico**: O componente possui um seletor `<input type="file">`, porém o objeto binário `File` selecionado pelo operador é sumariamente descartado. O script apenas gera uma string simulada e a envia como texto JSON na propriedade `comprovante` via `PATCH /api/financeiro/anuidades/{id}/pagar`. O backend não recebe o arquivo e não o armazena em disco nem em nuvem.

#### 3.5.2. Ausência de Endpoint Multipart no Controlador Financeiro
* **Arquivo**: `backend/src/main/java/com/fmttema/api/controllers/FinanceiroController.java`
* **Diagnóstico**: Diferente de `PatrocinadorController.java` (que injeta `FileUploadService` e faz o upload multipart de logomarcas para `uploads/patrocinadores/`), o `FinanceiroController.java` não possui nenhum endpoint capaz de receber `MultipartFile`.

#### 3.5.3. Visualização Quebrada de Comprovantes Registrados
* **Arquivo**: `frontend/src/components/PainelFinanceiroAnuidades.jsx` (Linhas 464–479)
* **Código Identificado**:
  ```jsx
  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono break-all text-slate-700 mb-4">
    {comprovanteVisualizar.url}
  </div>
  {comprovanteVisualizar.url.startsWith('http') && (
    <a href={comprovanteVisualizar.url} target="_blank" rel="noopener noreferrer" ...>
      Abrir Link Externo
    </a>
  )}
  ```
* **Diagnóstico**: Quando a anuidade possui um comprovante originado do modal local (`comprovantes/...`), a expressão `comprovanteVisualizar.url.startsWith('http')` é avaliada como falsa. O modal exibe apenas a string do nome simulado em uma caixa cinza, impossibilitando download, visualização do PDF/recibo ou conferência pela auditoria contábil.

#### 3.5.4. Inexistência de Auto-Envio por Atletas e Academias
* **Arquivo**: `frontend/src/components/PainelFinanceiroAnuidades.jsx` (Linha 408 e Linhas 311–312)
* **Diagnóstico**: O botão de regularização/anexação de comprovante é condicionado a `{isAdmin && (...)}`. Atletas e Academias são impedidos de fazer o upload do seu comprovante PIX pela própria conta, sendo orientados por um texto estático a procurar fisicamente a tesouraria da federação (`"procure a administração para anexar seu comprovante PIX/Transferência"`).

---

## 4. Seção Pilar 3: Backend e Regras de Negócio

### 4.1. Tratamento Centralizado de Erros e Exceções

#### 4.1.1. Ausência Absoluta de `@RestControllerAdvice` e `GlobalExceptionHandler`
* **Evidência no Repositório**:
  * Uma varredura global em `backend/src/main/java/` confirma a ausência total de anotações `@ControllerAdvice` ou `@RestControllerAdvice`.
  * O pacote `com.fmttema.api.exceptions` possui **apenas uma única exceção customizada**: `PagamentoPendenteException.java`.
* **Diagnóstico**: O Spring Boot não possui nenhum manipulador centralizado de exceções. Falhas nativas da camada web (ex: `MethodArgumentNotValidException` quando falha a validação de DTOs, `HttpMessageNotReadableException` em JSON malformado ou `AccessDeniedException` do Spring Security) disparam telas de erro padrão da Spring Whitelabel com códigos genéricos e vazamento interno de pacotes técnicos.

#### 4.1.2. Proliferação de Blocos `try/catch` Manuais e Divergência de Esquemas de Resposta
Sem um manipulador global, os controladores espalham dezenas de blocos `try/catch` redundantes com retornos arbitrários via `Map.of(...)`:
1. `ArbitroController.java` (Linhas 72–85, 102–115, 125–138, 148–156): Mapeia `EntityNotFoundException` para 404 e `IllegalArgumentException` para 403, repetindo o bloco em múltiplos métodos.
2. `EventoController.java` (Linhas 54–63, 92–113, 137–146, 170–184): No método `inscreverAtleta`, trata quatro exceções com blocos `catch` sucessivos.
3. `FinanceiroController.java` (Linhas 48–61) e `UsuarioController.java` (Linhas 45–53): Replicam a mesma lógica de tratamento ad-hoc.
4. **Anomalia em `ConfrontoController.java` (Linhas 65–70)**:
   ```java
   @GetMapping("/evento/{eventoId}")
   public ResponseEntity<List<ConfrontoResponseDTO>> listarConfrontosPorEvento(@PathVariable Long eventoId) {
       try {
           return ResponseEntity.ok(confrontoService.listarConfrontosPorEvento(eventoId));
       } catch (EntityNotFoundException e) {
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body(List.of());
       }
   }
   ```
   *Diagnóstico*: Caso o evento não exista, o método retorna o status HTTP 404 acompanhado de um **array JSON vazio `[]`** (linha 68), em vez de um objeto estruturado de erro com mensagem legível, quebrando o padrão REST da aplicação.

---

### 4.2. Uso de DTOs vs. Exposição de Entidades JPA e Arquitetura em Camadas

#### 4.2.1. Manipulação de Tipos Primitivos, Entidades e Mapas Brutos
1. **Retorno de Entidade JPA em `ArbitroController.java:163–170`**: Conforme detalhado no Pilar 1, o método retorna `List<Usuario>` diretamente do banco, serializando campos sensíveis (como hashes de senhas).
2. **Entrada de Dados Não Tipada em `AtletaController.java:169–175`**:
   ```java
   @PatchMapping("/{id}/pagamento")
   @PreAuthorize("hasRole('ADMIN')")
   public ResponseEntity<?> atualizarStatusPagamento(
           @PathVariable Long id,
           @RequestBody Map<String, String> body
   )
   ```
   O endpoint consome um mapa genérico `Map<String, String>`, contornando completamente o mecanismo de Bean Validation do Spring.
3. **Respostas em Mapas Anônimos**:
   - `AuthController.java:76–80`: Retorna `Map.of("mensagem", ..., "email", ..., "perfil", ...)` em vez de um DTO tipado `RegisterResponseDTO`.
   - `PatrocinadorController.java:104`: Retorna `Map<String, String>` na rota de upload de imagem.

#### 4.2.2. Violações Graves da Camada Service (Controladores Acessando Repositórios Diretamente)
1. **`AcademiaController.java` (Linhas 29–41 e Linhas 45–74)**:
   O controlador injeta diretamente `AcademiaRepository` e `UsuarioRepository`. As regras de negócio (validação de e-mail duplicado, criptografia de senha e persistência em cascata) são executadas no corpo do controlador. **Não existe classe `AcademiaService` no backend**.
2. **`AtletaController.java` (Linhas 59–113)**:
   O método `cadastrarAtleta` ignora o `AtletaService` existente, injetando e manipulando diretamente `UsuarioRepository`, `AtletaRepository` e `AcademiaRepository`.

---

### 4.3. Validação de Integridade de Dados e Transacionalidade

#### 4.3.1. Ausência de `@Valid` no Endpoint de Inscrições
* **Arquivo**: `backend/src/main/java/com/fmttema/api/controllers/EventoController.java` (Linhas 86–91)
* **Código Identificado**:
  ```java
  @PostMapping("/{id}/inscrever")
  public ResponseEntity<?> inscreverAtleta(
          @PathVariable Long id,
          @RequestBody(required = false) InscricaoRequestDTO dto,
          Authentication authentication
  )
  ```
* **Diagnóstico**: O parâmetro `dto` não possui a anotação `@Valid`. Além disso, o DTO `InscricaoRequestDTO.java` é um record vazio de validações (`Long atletaId` sem `@Positive` ou `@NotNull`).

#### 4.3.2. Ausência de Validações Críticas em DTOs de Entrada
1. **`AtletaRequestDTO.java` (Linhas 18–39)**:
   - `LocalDate dataNascimento` não possui `@NotNull` nem `@Past`. O sistema aceita datas nulas ou futuras.
   - `String cpf` possui apenas `@NotBlank`. Não há validação de formato de CPF nem cálculo de dígitos verificadores (`@CPF`).
   - `String categoria` é uma string livre, sem validação contra o catálogo de categorias de peso.
2. **`AcademiaRequestDTO.java` (Linhas 11–15)**:
   - Campos `responsavel`, `telefone` e `cidade` não possuem nenhuma anotação de validação (`@NotBlank`, `@Size`).
   - O campo `cnpj` **não existe no DTO**, impedindo que qualquer academia informe seu CNPJ no momento do cadastro, muito embora a entidade `Academia.java:35` preveja `@Column(name = "cnpj", unique = true)`.
3. **`BaixaAnuidadeRequestDTO.java` (Linhas 6–11)**:
   - `Double valor` não possui `@NotNull` nem `@Positive`. O sistema aceita baixas manuais com valor negativo ou zerado.
   - `String tipoBeneficiario` não utiliza enumeração segura.

#### 4.3.3. Ausência de `@Transactional` Gerando Usuários Órfãos
* **Arquivo**: `backend/src/main/java/com/fmttema/api/controllers/AtletaController.java` (Linhas 59–113)
* **Código Identificado**:
  ```java
  // Linha 96
  Usuario usuarioSalvo = usuarioRepository.save(usuario);
  ...
  // Linha 110
  Atleta atletaSalvo = atletaRepository.save(atleta);
  ```
* **Diagnóstico e Impacto**: O método `cadastrarAtleta` não é anotado com `@Transactional`. Caso ocorra uma exceção durante a persistência da entidade `Atleta` (linha 110), o `Usuario` salvo previamente na linha 96 não sofre rollback. O sistema gera um registro de usuário "órfão" no banco de dados. Se o atleta tentar corrigir as informações e submeter o formulário novamente, a requisição falhará com erro de e-mail duplicado, bloqueando permanentemente o acesso do atleta.

---

### 4.4. Integridade das Regras de Negócio Federativas

#### 4.4.1. Convocação de Árbitros com Licença Vencida ou Status Suspenso
* **Arquivo**: `backend/src/main/java/com/fmttema/api/services/EscalaArbitroService.java` (Linhas 75–99)
* **Diagnóstico**: O serviço não verifica se a data de validade da licença arbitral (`dataValidadeLicenca`) expirou em relação à data do torneio e ignora o `StatusUsuario`. Árbitros suspensos pelo tribunal esportivo podem ser convocados livremente.

#### 4.4.2. Inscrição em Torneios sem Verificação de Regularidade da Academia Filiada
* **Arquivo**: `backend/src/main/java/com/fmttema/api/services/InscricaoService.java` (Linhas 71–76)
* **Diagnóstico**: O método valida unicamente o status de anuidade do atleta individual (`atleta.getStatusPagamento() == StatusPagamento.PAGO`). Se a academia à qual o atleta pertence estiver inadimplente com a federação ou com cadastro suspenso, a inscrição ainda assim é aceita. Pelas diretrizes das federações oficiais de Muaythai, atletas filiados a agremiações irregulares não podem competir representando a bandeira da agremiação.

#### 4.4.3. Vulnerabilidade de IDOR em Inscrição de Torneios
* **Arquivo**: `backend/src/main/java/com/fmttema/api/services/InscricaoService.java` (Linhas 58–69)
* **Código Identificado**:
  ```java
  Atleta atleta;
  if (dto != null && dto.atletaId() != null) {
      atleta = atletaRepository.findById(dto.atletaId())
              .or(() -> atletaRepository.findByUsuarioId(dto.atletaId()))
              .orElseThrow(() -> new EntityNotFoundException(...));
  } else if (emailUsuarioAutenticado != null && !emailUsuarioAutenticado.isBlank()) {
      atleta = atletaRepository.findByUsuarioEmail(emailUsuarioAutenticado)
  ...
  ```
* **Diagnóstico**: Qualquer usuário autenticado (mesmo um atleta comum ou árbitro) pode passar qualquer `atletaId` no payload JSON e inscrever outros atletas sem consentimento e sem validação de vínculo com a agremiação correspondente (Insecure Direct Object Reference - IDOR).

#### 4.4.4. Ciclo de Vida Financeiro Binário e Ausência de Auditoria de Pagamento
* **Arquivos**: `StatusPagamento.java`, `FluxoCaixa.java` (Linhas 59–64) e `FinanceiroService.java` (Linhas 86–94)
* **Diagnóstico**: O enum `StatusPagamento` é estritamente binário (`PAGO` ou `PENDENTE`). Não existe estado intermediário de `EM_ANALISE` ou `COMPROVANTE_ENVIADO`. Adicionalmente, quando a baixa manual é realizada, a transação em `FluxoCaixa` assume cegamente a string `"PIX"` como método de liquidação, inviabilizando conciliação bancária de pagamentos realizados em espécie, boleto ou cartão.

---

## 5. Seção de Backlog para o Trello

Para guiar a equipe de engenharia e os auditores de qualidade, foram estruturados **19 cartões de backlog** prontos para importação no Trello ou Jira. Cada cartão detalha o título, o perfil/módulo afetado, a severidade, as evidências com linhas exatas e a arquitetura da solução recomendada.

---

### [CARD-01] Eliminação de Vazamento de Hashes BCrypt em `GET /api/arbitros`
* **Módulo / Perfil**: ARBITRO / ADMIN (Segurança e Criptografia)
* **Severidade**: Crítica (P0)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/controllers/ArbitroController.java`: Linhas 163–170
  * `backend/src/main/java/com/fmttema/api/models/Usuario.java`: Linha 35
  * `backend/src/main/java/com/fmttema/api/dto/UsuarioResponseDTO.java`
* **Solução Técnica Recomendada**:
  1. Anotar o campo `private String senha;` na classe `Usuario.java` com `@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)`.
  2. Refatorar o método `listarArbitros()` para mapear o fluxo de `Usuario` para `UsuarioResponseDTO` através de `.map(UsuarioResponseDTO::new).toList()`, assegurando que a entidade JPA jamais trafegue serializada na resposta HTTP.

---

### [CARD-02] Fechamento de Autocadastro de ADMIN e Validação de Status no Login
* **Módulo / Perfil**: ADMIN / AUTENTICAÇÃO (Controle de Acesso)
* **Severidade**: Crítica (P0)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/controllers/AuthController.java`: Linhas 63–81
  * `backend/src/main/java/com/fmttema/api/models/Usuario.java`: Linhas 180–198
  * `backend/src/main/java/com/fmttema/api/security/SecurityFilter.java`: Linhas 36–52
* **Solução Técnica Recomendada**:
  1. No endpoint `AuthController.register`, validar se `dto.perfil()` é `ADMIN` ou `ARBITRO`. Rejeitar a requisição com HTTP 403 caso o usuário tente autocadastrar perfis institucionais privativos.
  2. Em `Usuario.isEnabled()`, substituir o retorno estático `true` por `this.status == StatusUsuario.ATIVO`.
  3. No `SecurityFilter.java`, verificar se o usuário autenticado possui status ativo antes de atribuir o contexto no `SecurityContextHolder`.

---

### [CARD-03] Proteção de Dados (PII / LGPD) e Restrição em `GET /api/atletas`
* **Módulo / Perfil**: ATLETA / TREINADOR / ACADEMIA (Privacidade e LGPD)
* **Severidade**: Crítica (P0)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/controllers/AtletaController.java`: Linhas 132–135
  * `backend/src/main/java/com/fmttema/api/security/SecurityConfig.java`: Linha 65
  * `backend/src/main/java/com/fmttema/api/dto/AtletaResponseDTO.java`: Linhas 9–27
* **Solução Técnica Recomendada**:
  1. Incluir a anotação `@PreAuthorize("hasRole('ADMIN')")` no método `AtletaController.listarTodos()`.
  2. Criar um DTO público resumido (`AtletaPublicoDTO`) contendo apenas apelido, agremiação, graduação e cartel esportivo (vitórias/derrotas/empates), omitindo CPF, e-mail pessoal, data de nascimento e status de pagamento.

---

### [CARD-04] Transacionalidade e Eliminação de Usuários Órfãos no Cadastro de Atletas
* **Módulo / Perfil**: ATLETA (Integridade Transacional JPA)
* **Severidade**: Crítica (P0)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/controllers/AtletaController.java`: Linhas 59–113
  * `backend/src/main/java/com/fmttema/api/services/AtletaService.java`
* **Solução Técnica Recomendada**:
  1. Mover toda a lógica de criação de usuário e vinculação de atleta do `AtletaController` para o `AtletaService`.
  2. Anotar o método com `@Transactional(rollbackFor = Exception.class)`, garantindo que se o salvamento de `Atleta` falhar, o `Usuario` salvo seja imediatamente desfeito pelo Hibernate.

---

### [CARD-05] Criação de `GET /api/academias/me` e Resolução de Erro 403 em Anuidades
* **Módulo / Perfil**: ACADEMIA (Arquitetura REST e Financeiro)
* **Severidade**: Alta (P1)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/controllers/AcademiaController.java`: Linhas 43–84
  * `backend/src/main/java/com/fmttema/api/controllers/FinanceiroController.java`: Linhas 24–27 e Linhas 68–71
  * `frontend/src/components/PainelFinanceiroAnuidades.jsx`: Linhas 72–94
* **Solução Técnica Recomendada**:
  1. Criar o endpoint `GET /api/academias/me` retornando os dados cadastrais da agremiação do usuário logado através do token JWT.
  2. Criar o endpoint `GET /api/financeiro/anuidades/me` com `@PreAuthorize("hasAnyRole('ADMIN', 'ACADEMIA')")` para consulta da taxa anual da própria academia.
  3. Remover os dados mockados no bloco `catch` de `PainelFinanceiroAnuidades.jsx`.

---

### [CARD-06] Eliminação de Filtros Artificiais por Substring e Implementação Multi-Tenant
* **Módulo / Perfil**: TREINADOR / ACADEMIA (Frontend e Isolamento de Dados)
* **Severidade**: Alta (P1)
* **Evidência Técnica**:
  * `frontend/src/components/PainelInscricoesTorneio.jsx`: Linhas 84–93
  * `frontend/src/components/PerfilCartelAtleta.jsx`: Linhas 94–104
  * `frontend/src/components/PainelFinanceiroAnuidades.jsx`: Linhas 146–152
* **Solução Técnica Recomendada**:
  1. Remover completamente o teste de substring `email.includes('imperatriz')` e `nome.includes('centro de treinamento')` do código React.
  2. Implementar endpoint no backend `GET /api/atletas/minha-equipe`, que recupera a academia vinculada ao usuário autenticado e executa `atletaRepository.findAllByAcademiaId(academiaId)`.

---

### [CARD-07] Implementação de Tratamento Global de Exceções (`@RestControllerAdvice`)
* **Módulo / Perfil**: BACKEND / GERAL (Robustez Arquitetural)
* **Severidade**: Alta (P1)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/exceptions/` (Ausência de manipulador)
  * `backend/src/main/java/com/fmttema/api/controllers/ConfrontoController.java`: Linhas 65–70
* **Solução Técnica Recomendada**:
  1. Criar a classe `com.fmttema.api.exceptions.GlobalExceptionHandler` anotada com `@RestControllerAdvice`.
  2. Implementar métodos `@ExceptionHandler` para:
     - `EntityNotFoundException` (HTTP 404 com DTO padronizado `ErroRespostaDTO`).
     - `IllegalArgumentException` e `IllegalStateException` (HTTP 400).
     - `MethodArgumentNotValidException` (HTTP 400 com lista de campos inválidos).
     - `AccessDeniedException` (HTTP 403).
     - `Exception` genérica (HTTP 500 sem vazamento de stacktrace).
  3. Eliminar a anomalia de `ConfrontoController.java:68`, substituindo o retorno de `List.of()` em caso de erro pelo disparo da exceção tratada centralizadamente.

---

### [CARD-08] Implementação de Upload Binário de Comprovantes no Financeiro
* **Módulo / Perfil**: FINANCEIRO / ATLETA / ACADEMIA (Gestão de Arquivos)
* **Severidade**: Alta (P1)
* **Evidência Técnica**:
  * `frontend/src/components/ModalBaixaAnuidade.jsx`: Linhas 14–21
  * `backend/src/main/java/com/fmttema/api/controllers/FinanceiroController.java`: Linhas 40–44
  * `frontend/src/components/PainelFinanceiroAnuidades.jsx`: Linhas 464–479
* **Solução Técnica Recomendada**:
  1. Adicionar endpoint `POST /api/financeiro/anuidades/{id}/comprovante` aceitando `MultipartFile file`.
  2. Utilizar o `FileUploadService` para gravar o recibo no diretório `uploads/comprovantes/` e salvar a URL no registro financeiro.
  3. Atualizar o `ModalBaixaAnuidade.jsx` para despachar `FormData` real com barra de progresso.
  4. Habilitar pré-visualização de imagem/PDF no modal de comprovantes do `PainelFinanceiroAnuidades.jsx`.

---

### [CARD-09] Correção de Vulnerabilidade IDOR em Inscrição de Atletas
* **Módulo / Perfil**: ATLETA / TREINADOR (Autorização de Recursos)
* **Severidade**: Alta (P1)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/services/InscricaoService.java`: Linhas 58–69
  * `backend/src/main/java/com/fmttema/api/dto/InscricaoRequestDTO.java`
* **Solução Técnica Recomendada**:
  1. Em `InscricaoService.inscreverAtleta`, caso o operador possua perfil `ATLETA`, forçar a inscrição exclusivamente do próprio atleta autenticado.
  2. Caso o operador possua perfil `TREINADOR` ou `ACADEMIA`, validar se o `atleta.getAcademia().getId()` corresponde estritamente à academia do operador autenticado. Rejeitar qualquer tentativa de terceiros com `AccessDeniedException`.

---

### [CARD-10] Segregação Estrita de Funções na Homologação de Lutas Oficiais
* **Módulo / Perfil**: ARBITRO (Integridade Esportiva)
* **Severidade**: Alta (P1)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/controllers/ConfrontoController.java`: Linha 37
  * `backend/src/main/java/com/fmttema/api/services/ConfrontoService.java`: Linhas 151–172
* **Solução Técnica Recomendada**:
  1. No método `ConfrontoService.registrarVencedor`, validar se o árbitro autenticado está formalmente escalado (`escalaArbitroRepository.existsByArbitroIdAndEventoId`) com presença confirmada para o evento da luta.
  2. Bloquear o preenchimento de súmula caso o árbitro não pertença à escala da competição.

---

### [CARD-11] Alinhamento de Permissões: Métricas de Dashboard e Chaves Oficiais
* **Módulo / Perfil**: ADMIN / TREINADOR / ARBITRO (Discrepâncias de RBAC)
* **Severidade**: Alta (P1)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/controllers/DashboardController.java`: Linha 13
  * `backend/src/main/java/com/fmttema/api/security/SecurityConfig.java`: Linha 50 e Linha 63
  * `backend/src/main/java/com/fmttema/api/controllers/EventoController.java`: Linha 168
* **Solução Técnica Recomendada**:
  1. Em `DashboardController.java:13` e `SecurityConfig.java:63`, alterar a regra de `/api/dashboard/**` para `@PreAuthorize("hasRole('ADMIN')")`, segregando métricas financeiras de faturamento e saldo da federação.
  2. Em `EventoController.java:168` e `SecurityConfig.java:50`, restringir a persistência de chaves oficiais (`/chaves/persistir`) exclusivamente a `hasRole('ADMIN')`, impedindo interferência arbitrária de árbitros ou treinadores na formação dos confrontos.

---

### [CARD-12] Validação de Licença Vigente e Status Ativo na Convocação de Árbitros
* **Módulo / Perfil**: ARBITRO / ADMIN (Regras de Negócio)
* **Severidade**: Média (P2)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/services/EscalaArbitroService.java`: Linhas 75–99
  * `backend/src/main/java/com/fmttema/api/config/DataSeederConfig.java`: Linhas 264–323
* **Solução Técnica Recomendada**:
  1. Incluir em `EscalaArbitroService.convocarArbitro`:
     ```java
     if (arbitro.getDataValidadeLicenca() == null || arbitro.getDataValidadeLicenca().isBefore(evento.getData())) {
         throw new IllegalStateException("O árbitro selecionado possui licença vencida para a data do torneio.");
     }
     if (arbitro.getStatus() != StatusUsuario.ATIVO) {
         throw new IllegalStateException("Apenas árbitros com credenciamento ATIVO podem ser convocados.");
     }
     ```
  2. No componente `GestaoEscalasArbitros.jsx`, desabilitar a seleção de árbitros inaptos no dropdown com indicador visual vermelho de licença expirada.

---

### [CARD-13] Verificação da Regularidade da Academia na Inscrição em Torneios
* **Módulo / Perfil**: ACADEMIA / ATLETA (Regras de Negócio Federativas)
* **Severidade**: Média (P2)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/services/InscricaoService.java`: Linhas 71–76
* **Solução Técnica Recomendada**:
  1. Adicionar em `InscricaoService.inscreverAtleta` a verificação da entidade `Academia` associada:
     ```java
     Academia academia = atleta.getAcademia();
     if (academia != null && academia.getStatusPagamento() != StatusPagamento.PAGO) {
         throw new PagamentoPendenteException("Inscrição negada: A agremiação " + academia.getNome() + " possui pendências na anuidade institucional.");
     }
     ```

---

### [CARD-14] UX Preventiva com Validação de Peso e Categoria em Inscrições
* **Módulo / Perfil**: ATLETA / TREINADOR (Experiência do Usuário)
* **Severidade**: Média (P2)
* **Evidência Técnica**:
  * `frontend/src/components/PainelInscricoesTorneio.jsx`: Linhas 508 e 552
  * `backend/src/main/java/com/fmttema/api/services/InscricaoService.java`: Linhas 84–86
  * `frontend/src/pages/CadastroPublico.jsx`: Linhas 382–398
* **Solução Técnica Recomendada**:
  1. No `PainelInscricoesTorneio.jsx`, calcular preventivamente a categoria compatível com o peso registrado do atleta antes da submissão.
  2. Se o atleta estiver sem peso cadastrado (`!atletaAtual.peso || atletaAtual.peso <= 0`), desabilitar preventivamente o botão de submissão e exibir alerta amarelo com botão `"Atualizar Peso no Perfil"`.
  3. No `CadastroPublico.jsx`, sincronizar o campo de peso com as faixas limites do `<select>` de categorias, alertando sobre incoerências em tempo real.

---

### [CARD-15] Criação da Camada `AcademiaService` e Refatoração de Controladores
* **Módulo / Perfil**: ACADEMIA / ATLETA (Arquitetura de Software)
* **Severidade**: Média (P2)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/controllers/AcademiaController.java`: Linhas 29–74
  * `backend/src/main/java/com/fmttema/api/controllers/AtletaController.java`: Linhas 59–113
* **Solução Técnica Recomendada**:
  1. Criar a classe de serviço `AcademiaService.java` com métodos `cadastrar`, `listar`, `buscarPorId` e `buscarPorEmailUsuario`.
  2. Desacoplar `AcademiaController` e `AtletaController` do acesso direto a repositórios JPA, centralizando regras de negócio e criptografia de senhas exclusivamente na camada de serviço.

---

### [CARD-16] Fortalecimento de Validações de Integridade (Bean Validation) em DTOs
* **Módulo / Perfil**: BACKEND / DTOs (Integridade de Dados)
* **Severidade**: Média (P2)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/dto/AtletaRequestDTO.java`: Linhas 18–39
  * `backend/src/main/java/com/fmttema/api/dto/AcademiaRequestDTO.java`: Linhas 11–15
  * `backend/src/main/java/com/fmttema/api/dto/BaixaAnuidadeRequestDTO.java`: Linhas 6–11
  * `backend/src/main/java/com/fmttema/api/controllers/EventoController.java`: Linhas 86–91
* **Solução Técnica Recomendada**:
  1. Adicionar `@Valid` em `EventoController.inscreverAtleta`.
  2. Adicionar `@CPF` e `@Past` em `AtletaRequestDTO`.
  3. Incluir o campo `cnpj` com anotação `@CNPJ` em `AcademiaRequestDTO` e persistir no banco.
  4. Adicionar anotações `@NotNull` e `@Positive` no campo `Double valor` de `BaixaAnuidadeRequestDTO`.

---

### [CARD-17] Padronização de Empty States Ilustrados no Frontend
* **Módulo / Perfil**: FRONTEND / UX (Qualidade de Interface)
* **Severidade**: Média (P2)
* **Evidência Técnica**:
  * `frontend/src/components/PerfilCartelAtleta.jsx`: Linhas 163–165 e Linha 390
  * `frontend/src/components/VitrineParceiros.jsx`: Linhas 133–135
  * `frontend/src/components/PainelDashboardAnalitico.jsx`: Linha 121
* **Solução Técnica Recomendada**:
  1. Substituir os retornos silenciosos `return null;` por blocos ilustrados contendo ícones temáticos (`Users`, `Award`, `ShieldAlert`), textos de orientação amigáveis e botões de chamada para ação (CTA).
  2. No componente `VitrineParceiros`, quando não houver patrocinadores ativos, renderizar um banner institucional: `"Sua marca fortalecendo o Muaythai maranhense. Seja um patrocinador oficial FMTTEMA"`.

---

### [CARD-18] Expansão do Ciclo de Vida Financeiro e Meios de Pagamento
* **Módulo / Perfil**: FINANCEIRO (Modelagem de Domínio)
* **Severidade**: Média (P2)
* **Evidência Técnica**:
  * `backend/src/main/java/com/fmttema/api/models/StatusPagamento.java`
  * `backend/src/main/java/com/fmttema/api/models/FluxoCaixa.java`: Linhas 59–64
  * `backend/src/main/java/com/fmttema/api/services/FinanceiroService.java`: Linhas 86–94
* **Solução Técnica Recomendada**:
  1. Expandir o enum `StatusPagamento` para: `PENDENTE`, `EM_ANALISE`, `PAGO`, `RECUSADO`, `ISENTO`.
  2. Substituir a string pura `metodoPagamento` na entidade `FluxoCaixa` por enum tipado (`MetodoPagamento: PIX, BOLETO, CARTAO_CREDITO, TRANSFERENCIA, DINHEIRO`).
  3. Permitir que o gestor selecione o meio de pagamento efetivo ao realizar a baixa manual.

---

### [CARD-19] Substituição de Diálogos Nativos por Modais Institucionais FMTTEMA
* **Módulo / Perfil**: ARBITRO / UX (Interface de Usuário)
* **Severidade**: Baixa (P3)
* **Evidência Técnica**:
  * `frontend/src/components/GestaoEscalasArbitros.jsx`: Linha 80 (`alert`)
  * `frontend/src/components/PainelEscalaArbitro.jsx`: Linha 62 (`window.confirm`)
* **Solução Técnica Recomendada**:
  1. Em `GestaoEscalasArbitros.jsx:80`, remover o `alert()` nativo e exibir validação de erro inline no formulário.
  2. Em `PainelEscalaArbitro.jsx:62`, substituir `window.confirm()` por um modal de confirmação institucional FMTTEMA estilizado com TailwindCSS, padronizado com o design system da federação.

---

## 6. Procedimentos de Verificação e Evidências Adicionais

Para assegurar a reprodutibilidade dos achados apresentados neste relatório por auditores externos, recomenda-se a execução dos comandos PowerShell e chamadas cURL abaixo:

1. **Confirmação do Vazamento de Hashes de Árbitros**:
   ```powershell
   Get-Content backend\src\main\java\com\fmttema\api\controllers\ArbitroController.java | Select-String -Context 2,6 "listarArbitros"
   Get-Content backend\src\main\java\com\fmttema\api\models\Usuario.java | Select-String -Context 1,2 "private String senha"
   ```
2. **Confirmação dos Mocks e Hacks por Substring no Frontend**:
   ```powershell
   Select-String -Path "frontend\src\**\*.jsx" -Pattern "imperatriz"
   Select-String -Path "frontend\src\**\*.jsx" -Pattern "centro de treinamento"
   ```
3. **Confirmação de Ausência de Manipuladores Globais de Exceção**:
   ```powershell
   Get-ChildItem -Path backend\src\main\java -Recurse -Filter *.java | Select-String "ControllerAdvice"
   ```
4. **Confirmação do Bloqueio 403 Forbidden em Anuidades para Perfil Academia**:
   ```bash
   curl -s -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d '{"email":"academia@fmttema.com","senha":"123456"}'
   curl -i -X GET http://localhost:8080/api/financeiro/anuidades -H "Authorization: Bearer <TOKEN_ACADEMIA>"
   # Retorno observado: HTTP/1.1 403 Forbidden
   ```

---
*Relatório de Auditoria Técnica FMTTEMA homologado e emitido pelo Agente Especialista de Qualidade e Arquitetura.*
