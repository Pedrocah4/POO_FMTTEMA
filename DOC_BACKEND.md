<style>
  @media print {
    @page {
      margin: 18mm 16mm 18mm 16mm;
      size: A4 portrait;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #0f172a;
    }
    h1 {
      color: #002868;
      border-bottom: 2.5px solid #002868;
      padding-bottom: 4px;
      margin-top: 0;
      page-break-after: avoid;
    }
    h2 {
      color: #002868;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin-top: 18pt;
      page-break-after: avoid;
    }
    h3 {
      color: #1e293b;
      margin-top: 14pt;
      page-break-after: avoid;
    }
    table {
      width: 100% !important;
      border-collapse: collapse;
      margin: 10pt 0;
      page-break-inside: avoid;
      font-size: 8.5pt;
    }
    th {
      background-color: #f1f5f9 !important;
      color: #002868 !important;
      font-weight: 700;
      border: 1px solid #94a3b8;
      padding: 6px 8px;
      text-align: left;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    pre {
      background-color: #f8fafc !important;
      border: 1px solid #cbd5e1;
      border-left: 3.5px solid #002868;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 8pt;
      line-height: 1.4;
      page-break-inside: avoid;
      white-space: pre-wrap;
      word-break: break-all;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    code {
      font-family: "Consolas", "Courier New", monospace;
      font-size: 8.5pt;
    }
    blockquote {
      border-left: 3.5px solid #002868;
      background-color: #f1f5f9 !important;
      padding: 6pt 10pt;
      margin: 8pt 0;
      page-break-inside: avoid;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .card-formula {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 4px solid #D91C22;
      padding: 8px 12px;
      margin: 8px 0;
      border-radius: 4px;
      page-break-inside: avoid;
    }
  }
</style>

# 📘 FMTTEMA - Guia Arquitetural do Servidor (Backend)

> **Manual Técnico e Didático da API RESTful**  
> **Instituição:** Federação de Muaythai Tradicional do Estado do Maranhão (FMTTEMA)  
> **Disciplina:** Programação Orientada a Objetos (POO) | **Curso:** Análise e Desenvolvimento de Sistemas (UNDB)  
> **Stack:** Java 21 LTS • Spring Boot 3.4 • Spring Security (JWT HMAC-256) • Spring Data JPA • PostgreSQL 15+

---

## 🏛️ 1. Visão Geral da Arquitetura

O Backend da plataforma FMTTEMA foi projetado sobre o padrão **Layered Architecture (Arquitetura em Camadas)**, priorizando alto desacoplamento, transações atômicas com garantia **ACID**, segurança stateless baseada em tokens JWT e isolamento rigoroso de perfis (**RBAC - Role-Based Access Control**).

```
                      ┌─────────────────────────────────────────┐
                      │        Cliente Frontend / SPA           │
                      └────────────────────┬────────────────────┘
                                           │ HTTP REST (JSON / Multipart)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    SecurityFilter (JWT HMAC-256)        │
                      └────────────────────┬────────────────────┘
                                           │ Request Autenticada
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    Controllers REST (@PreAuthorize)     │
                      └────────────────────┬────────────────────┘
                                           │ DTOs (Records Java 21)
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    Services (@Transactional ACID)       │
                      └────────────────────┬────────────────────┘
                                           │ Entidades JPA / Models
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    Repositories (Spring Data JPA)       │
                      └────────────────────┬────────────────────┘
                                           │ Queries SQL / Views
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    Banco de Dados PostgreSQL 15+        │
                      └─────────────────────────────────────────┘
```

<div style="page-break-after: always;"></div>

## 📂 2. Árvore de Diretórios Completa do Backend

A estrutura de pacotes do projeto segue estritamente as convenções corporativas do Spring Boot:

```
backend/
├── pom.xml                                  # Dependências Maven (Spring Web, Security, JPA, Validation, Auth0 JWT)
├── mvnw / mvnw.cmd                          # Maven Wrapper para execução padronizada sem dependência de instalação
├── src/
│   ├── main/
│   │   ├── java/com/fmttema/api/
│   │   │   ├── BackendApplication.java      # Bootstrap da aplicação (@SpringBootApplication)
│   │   │   │
│   │   │   ├── config/                      # Infraestrutura, inicialização e CORS
│   │   │   │   ├── DataInitializer.java     # Seeder idempotente de dados de teste, admin e views SQL
│   │   │   │   ├── DataSeederConfig.java    # Configurações auxiliares de carga inicial
│   │   │   │   └── WebConfig.java           # Configuração de CORS e recursos estáticos (/uploads/**)
│   │   │   │
│   │   │   ├── controllers/                 # Camada REST com rotas e controle de acesso (@PreAuthorize)
│   │   │   │   ├── AcademiaController.java  # Rotas de agremiações (GET /me, listagem, cadastro)
│   │   │   │   ├── ArbitroController.java   # Rotas de árbitros (DTO limpo sem senha, minhas escalas)
│   │   │   │   ├── AtletaController.java    # Rotas de atletas (/me, /minha-equipe, cadastro atômico)
│   │   │   │   ├── AuthController.java      # Login JWT e auto-cadastro restrito
│   │   │   │   ├── ConfrontoController.java # Consulta de confrontos e lançamento de súmulas
│   │   │   │   ├── DashboardController.java # Métricas executivas restritas estritamente a ADMIN
│   │   │   │   ├── EventoController.java    # Gestão de torneios, chaves e persistência
│   │   │   │   ├── EventoPublicoController.java # Vitrine aberta de torneios (/api/publico/eventos)
│   │   │   │   ├── FinanceiroController.java# Baixa de anuidade, extrato de caixa e upload de comprovantes
│   │   │   │   ├── PatrocinadorController.java # CRUD comercial e upload de logos
│   │   │   │   ├── RankingPublicoController.java # Consulta aberta das views SQL de ranking
│   │   │   │   └── UsuarioController.java   # Moderação e aprovação de contas de usuários
│   │   │   │
│   │   │   ├── dto/                         # Data Transfer Objects (Java 21 Records Imutáveis)
│   │   │   │   ├── AcademiaRequestDTO.java  ├── AcademiaResponseDTO.java
│   │   │   │   ├── AnuidadeDTO.java         ├── ArbitroResponseDTO.java
│   │   │   │   ├── AtletaChaveDTO.java      ├── AtletaRankingDTO.java
│   │   │   │   ├── AtletaRequestDTO.java    ├── AtletaResponseDTO.java
│   │   │   │   ├── AtualizarCartelDTO.java  ├── AtualizarStatusUsuarioDTO.java
│   │   │   │   ├── BaixaAnuidadeRequestDTO.java ├── BaixaAnuidadeResponseDTO.java
│   │   │   │   ├── CategoriaPesoResponseDTO.java ├── ChaveamentoResponseDTO.java
│   │   │   │   ├── ChaveCategoriaDTO.java   ├── ConfrontoResponseDTO.java
│   │   │   │   ├── DashboardResumoDTO.java  ├── ErroRespostaDTO.java (RFC 7807)
│   │   │   │   ├── EscalaArbitroRequestDTO.java ├── EscalaArbitroResponseDTO.java
│   │   │   │   ├── EventoPublicoResponseDTO.java ├── EventoRequestDTO.java
│   │   │   │   ├── EventoResponseDTO.java   ├── FluxoCaixaResponseDTO.java
│   │   │   │   ├── InscricaoRequestDTO.java ├── InscricaoResponseDTO.java
│   │   │   │   ├── ItemAgregacaoDTO.java    ├── LoginRequestDTO.java
│   │   │   │   ├── LoginResponseDTO.java    ├── LutaChaveDTO.java
│   │   │   │   ├── PatrocinadorRequestDTO.java ├── PatrocinadorResponseDTO.java
│   │   │   │   ├── RankingPublicoResponseDTO.java ├── RegisterRequestDTO.java
│   │   │   │   ├── RegistrarVencedorDTO.java └── UsuarioResponseDTO.java
│   │   │   │
│   │   │   ├── exceptions/                  # Tratamento global de erros da API
│   │   │   │   ├── GlobalExceptionHandler.java # @RestControllerAdvice para 400, 403, 404, 500
│   │   │   │   └── PagamentoPendenteException.java # Bloqueio negocial de atletas inadimplentes
│   │   │   │
│   │   │   ├── models/                      # Entidades de Domínio JPA mapeadas para o PostgreSQL
│   │   │   │   ├── Academia.java            ├── Atleta.java
│   │   │   │   ├── CategoriaPeso.java       ├── Confronto.java
│   │   │   │   ├── EscalaArbitro.java       ├── Evento.java
│   │   │   │   ├── FluxoCaixa.java          ├── Inscricao.java
│   │   │   │   ├── Patrocinador.java        └── Usuario.java (implements UserDetails)
│   │   │   │   # Enums de Controle:
│   │   │   │   ├── PerfilAcesso.java (ADMIN, ATLETA, ACADEMIA, ARBITRO, TREINADOR)
│   │   │   │   ├── StatusEvento.java (AGENDADO, EM_ANDAMENTO, FINALIZADO, CANCELADO)
│   │   │   │   ├── StatusInscricao.java (CONFIRMADA, CANCELADA)
│   │   │   │   ├── StatusPagamento.java (PENDENTE, PAGO)
│   │   │   │   ├── StatusPresencaArbitro.java (PENDENTE, CONFIRMADO, RECUSADO)
│   │   │   │   ├── StatusUsuario.java (ATIVO, PENDENTE, SUSPENSO)
│   │   │   │   └── TipoTransacao.java (ENTRADA, SAIDA)
│   │   │   │
│   │   │   ├── repositories/                # Camada de Persistência (Spring Data JPA)
│   │   │   │   ├── AcademiaRepository.java  ├── AtletaRepository.java
│   │   │   │   ├── CategoriaPesoRepository.java ├── ConfrontoRepository.java
│   │   │   │   ├── EscalaArbitroRepository.java ├── EventoRepository.java
│   │   │   │   ├── FluxoCaixaRepository.java├── InscricaoRepository.java
│   │   │   │   ├── PatrocinadorRepository.java └── UsuarioRepository.java
│   │   │   │
│   │   │   ├── security/                    # Motor de Segurança Stateless e JWT
│   │   │   │   ├── AutenticacaoService.java # Integração com UserDetailsService do Spring
│   │   │   │   ├── SecurityConfig.java      # Configuração de filtros, rotas e handlers JSON
│   │   │   │   ├── SecurityFilter.java      # Interceptador OncePerRequestFilter do Bearer Token
│   │   │   │   └── TokenService.java        # Geração e decodificação criptográfica HMAC-256
│   │   │   │
│   │   │   └── services/                    # Regras de Negócio e Transações (@Transactional)
│   │   │       ├── AtletaService.java       ├── ConfrontoService.java
│   │   │       ├── DashboardService.java    ├── EscalaArbitroService.java
│   │   │       ├── EventoService.java       ├── FileUploadService.java
│   │   │       ├── FinanceiroService.java   ├── GeradorChavesService.java
│   │   │       ├── InscricaoService.java    ├── PatrocinadorService.java
│   │   │       ├── RankingService.java      └── UsuarioService.java
│   │   │
│   │   └── resources/
│   │       └── application.properties       # Conexão com banco, segredo JWT e dados padrão
```

<div style="page-break-after: always;"></div>

## 🧩 3. Catálogo Exaustivo de Classes e Componentes

### 3.1. Infraestrutura e Configurações (`config/`)
- **`BackendApplication.java`**: Ponto de entrada anotado com `@SpringBootApplication`. Inicia o Spring IoC Container, o servidor web Tomcat embutido e o escaneamento de anotações.
- **`DataInitializer.java`**: Implementa `CommandLineRunner`. É executado automaticamente na subida da aplicação de forma idempotente:
  - Cria o usuário `ADMIN` padrão (`admin@fmttema.com` / `admin123`) se inexistente.
  - Inicializa as 9 categorias oficiais de peso do Muaythai (Peso-Mosca até Peso-Super-Pesado).
  - Popula 10 atletas realistas com cartel completo, histórico e graduação Kruang.
  - Cria eventos estaduais ativos, árbitros e patrocinadores oficiais.
  - Executa comandos DDL para criar as **Views SQL** de alta performance (`vw_ranking_volume` e `vw_ranking_eficiencia`).
- **`WebConfig.java`**: Implementa `WebMvcConfigurer`. Configura CORS para permitir chamadas do frontend Vite e mapeia a rota física `/uploads/**` para servir comprovantes e imagens estáticas diretamente no navegador.

---

### 3.2. Camada de Domínio (`models/` e Enums)
Representa as tabelas do banco de dados mapeadas com Hibernate/JPA:
- **`Usuario.java`**: Raiz de autenticação. Implementa `UserDetails`. Possui `@JsonProperty(access = WRITE_ONLY)` no campo de senha para blindar contra vazamento de hashes BCrypt. O método `isEnabled()` verifica se `status == StatusUsuario.ATIVO`.
- **`Atleta.java`**: Cadastro federativo do atleta. Armazena CPF, data de nascimento, peso, graduação de Kruang, histórico esportivo (vitórias, derrotas, empates), status da anuidade e relacionamento com `Usuario` (1:1) e `Academia` (N:1).
- **`Academia.java`**: Agremiação esportiva filiada. Armazena CNPJ, responsável técnico, telefone, cidade e lista de alunos vinculados (`@OneToMany`).
- **`CategoriaPeso.java`**: Limites oficiais de peso para balizamento de torneios.
- **`Evento.java`**: Torneio estadual. Possui data, local, status, link de ingressos e categorias contempladas (`@ManyToMany`).
- **`Inscricao.java`**: Associação entre Atleta, Torneio e Categoria, com validação de pagamento prévio.
- **`Confronto.java`**: Luta individual da árvore. Referencia Corner Vermelho, Corner Azul, vencedor, fase e árbitro responsável.
- **`EscalaArbitro.java`**: Convocação formal de árbitros com status de presença (`PENDENTE`, `CONFIRMADO`, `RECUSADO`).
- **`FluxoCaixa.java`**: Livro contábil de receitas geradas pelas baixas manuais de anuidades.
- **`Patrocinador.java`**: Parceiros comerciais exibidos na vitrine institucional.

---

### 3.3. Camada de DTOs (`dto/`)
Implementados com **Java 21 `record`** para garantir **imutabilidade**, serialização limpa e proteção contra ataques de **Mass Assignment**:
- **`ArbitroResponseDTO`**: Expõe id, nome, e-mail e status do árbitro **sem expor a senha criptografada**.
- **`BaixaAnuidadeRequestDTO`**: Valida valor, tipo de beneficiário e comprovante obrigatório.
- **`ErroRespostaDTO`**: Estrutura padronizada de erro RFC 7807 (timestamp, status, erro, mensagem, path e mapa de validações).
- **`ChaveamentoResponseDTO` & `LutaChaveDTO`**: Estruturas hierárquicas que alimentam a árvore visual do torneio no React.

---

### 3.4. Camada de Negócio (`services/`)
- **`GeradorChavesService.java`**: Contém o algoritmo proprietário de chaveamento eliminatório com cálculo da **Regra do *"Bye"***.
- **`InscricaoService.java`**: Valida anuidade paga (`StatusPagamento.PAGO`), compatibilidade de peso e proteção anti-IDOR.
- **`FinanceiroService.java`**: Executa a baixa manual com `@Transactional`, gravando simultaneamente no `FluxoCaixa` e atualizando o status para `PAGO`.
- **`FileUploadService.java`**: Grava arquivos multipart reais (PDF, PNG, JPG, WEBP) nas pastas `uploads/comprovantes` e `uploads/patrocinadores`, sanitizando nomes com UUID.
- **`EscalaArbitroService.java`**: Valida licença vigente do árbitro (`dataValidadeLicenca >= evento.getData()`) e status `ATIVO`.
- **`ConfrontoService.java`**: Lança o vencedor na súmula interativa, avança o atleta na árvore e valida se o árbitro está formalmente escalado.
- **`RankingService.java`**: Executa consultas nativas nas views SQL `vw_ranking_volume` e `vw_ranking_eficiencia`.

---

### 3.5. Segurança e Tratamento de Exceções (`security/` e `exceptions/`)
- **`TokenService.java`**: Emite e valida JWTs com algoritmo HMAC-256 e expiração de 8 horas.
- **`SecurityFilter.java`**: Extrai o Bearer token a cada requisição e valida a assinatura antes de liberar a requisição.
- **`SecurityConfig.java`**: Configura sessões stateless, desabilita CSRF, define regras de rotas e manipuladores de erro JSON para 401 e 403.
- **`GlobalExceptionHandler.java`**: `@RestControllerAdvice` que captura `EntityNotFoundException` (404), `AccessDeniedException` (403), `MethodArgumentNotValidException` (400 com mapa de campos) e exceções genéricas (500).

<div style="page-break-after: always;"></div>

## 🏛️ 4. Pilares de POO Aplicados no Backend

| Pilar de POO | Aplicação Prática no Código da FMTTEMA |
| :--- | :--- |
| **Encapsulamento** | Todos os atributos das entidades são `private`. O acesso ocorre exclusivamente por métodos seletores (getters/setters). No `Usuario.java`, o atributo `senha` possui anotação `@JsonProperty(access = WRITE_ONLY)`, garantindo que nunca seja exposto em respostas JSON. Nos DTOs (`record`), os campos são imutáveis por padrão. |
| **Abstração** | A interface `JpaRepository` abstrai a complexidade do banco relacional PostgreSQL e dialetos SQL. Os controladores conversam com contratos de serviços sem se preocuparem com persistência ou escrita em disco. |
| **Herança** | `SecurityFilter` herda de `OncePerRequestFilter`. `PagamentoPendenteException` herda de `RuntimeException`. As entidades implementam interfaces padrão do framework. |
| **Polimorfismo** | A classe `Usuario` implementa a interface `UserDetails` do Spring Security, sobrescrevendo os métodos `getAuthorities()`, `getPassword()`, `getUsername()` e `isEnabled()`, integrando o modelo de negócio ao motor nativo de autenticação. |
| **Inversão de Controle & Injeção de Dependências** | Nenhuma classe instancia suas dependências com `new`. Os Services e Repositories são injetados automaticamente via construtor gerenciado pelo Spring IoC Container, facilitando manutenção e testes. |

---

## 🔄 5. Fluxo de Vida Completo de uma Requisição

Exemplo prático: **Árbitro homologando o vencedor de uma luta (`PATCH /api/confrontos/10/vencedor`)**:

```
[1. Cliente React] 
       │  PATCH /api/confrontos/10/vencedor
       │  Headers: Authorization: Bearer <Token_JWT>
       │  Payload: { "vencedorId": 4, "tipoDecisao": "PONTOS" }
       ▼
[2. SecurityFilter]
       │  1. Extrai o Bearer token
       │  2. Valida a assinatura HMAC-256 e tempo de expiração
       │  3. Busca o usuário e valida se status == ATIVO
       │  4. Autentica a requisição no SecurityContextHolder
       ▼
[3. ConfrontoController]
       │  1. Valida permissão @PreAuthorize("hasAnyRole('ADMIN', 'ARBITRO')")
       │  2. Valida o payload (@Valid RegistrarVencedorDTO)
       │  3. Invoca confrontoService.registrarVencedor(10, dto, userEmail)
       ▼
[4. ConfrontoService (@Transactional)]
       │  1. Busca o confronto pelo ID 10
       │  2. Valida se o árbitro está formalmente escalado no evento correspondente
       │  3. Registra o vencedor e tipo de decisão na súmula
       │  4. Localiza o confronto pai na chave e avança o vencedor automaticamente
       ▼
[5. ConfrontoRepository (JPA / Hibernate)]
       │  Gera e executa os comandos SQL UPDATE
       ▼
[6. PostgreSQL 15+]
       │  Aplica as alterações e confirma o COMMIT da transação ACID
       ▼
[7. Retorno ao Cliente]
       Retorna HTTP 200 OK com o ConfrontoResponseDTO atualizado.
```

<div style="page-break-after: always;"></div>

## ⚙️ 6. Regras de Negócio Críticas Documentadas

### 6.1. Algoritmo de Chaveamento e a Regra do *"Bye"* (`GeradorChavesService`)
Quando o número de atletas inscritos ($N$) não é uma potência exata de 2 (2, 4, 8, 16, 32), o algoritmo calcula automaticamente o número de "Byes" (passagens diretas):

<div class="card-formula">
  <strong>Fórmulas de Cálculo:</strong><br/>
  • <strong>Potência Superior</strong> = 2 ^ ⌈log₂(N)⌉<br/>
  • <strong>Quantidade de Byes</strong> = Potência Superior - N
</div>

*Exemplo:* Para 6 inscritos, a potência superior é 8. O número de Byes será $8 - 6 = 2$. Dois atletas sorteados avançam direto para as Semifinais sem lutar, garantindo que a Final ocorra perfeitamente entre 2 competidores.

### 6.2. Proteção Anti-IDOR em Inscrições (`InscricaoService`)
Para impedir que um atleta inscreva concorrentes arbitrariamente:
```java
if (usuario.getPerfil() == PerfilAcesso.ATLETA) {
    if (!atleta.getUsuario().getEmail().equalsIgnoreCase(userEmail)) {
        throw new AccessDeniedException("Você só pode inscrever a si próprio.");
    }
}
```

### 6.3. Baixa Financeira Atômica (`FinanceiroService`)
A confirmação de anuidade utiliza `@Transactional(rollbackFor = Exception.class)`. Caso a gravação no `FluxoCaixa` falhe, a alteração de status do atleta é revertida imediatamente no banco, garantindo integridade contábil.

---

## ❓ 7. Perguntas e Respostas Rápidas (FAQ da Banca de POO)

### P1: Por que utilizamos DTOs em vez de retornar as entidades JPA diretamente nos Controllers?
> **Resposta:** Por três razões fundamentais: **Segurança** (evita Mass Assignment, impedindo que usuários alterem campos restritos), **Privacidade/LGPD** (evita expor senhas, hashes BCrypt ou CPFs para quem não deve ver) e **Desacoplamento** (mudanças no banco não quebram o contrato com o frontend).

### P2: Como o Spring Security autentica o usuário em cada requisição?
> **Resposta:** O cliente envia o token JWT no cabeçalho `Authorization: Bearer <token>`. O `SecurityFilter` intercepta a requisição, valida a assinatura HMAC-256 e popula o `SecurityContextHolder` com o usuário e suas roles, permitindo que anotações como `@PreAuthorize("hasRole('ADMIN')")` bloqueiem acessos indevidos.

### P3: O que acontece se o cadastro de um atleta falhar após a criação do usuário?
> **Resposta:** Como o método em `AtletaService` é anotado com `@Transactional(rollbackFor = Exception.class)`, qualquer erro intermediário provoca o *Rollback* automático de toda a transação no PostgreSQL. Nenhuma conta órfã é criada.

### P4: Como o sistema impede que um árbitro lance resultado em um torneio onde não foi escalado?
> **Resposta:** Em `ConfrontoService.java`, o sistema verifica se existe um registro na tabela `escalas_arbitros` combinando o ID do árbitro e o ID do evento correspondente à luta. Caso não exista, é disparada uma `AccessDeniedException`.

### P5: Como as Views SQL aumentam a eficiência dos Rankings?
> **Resposta:** As views `vw_ranking_volume` e `vw_ranking_eficiencia` transferem o cálculo matemático de aproveitamento percentual para o motor nativo do PostgreSQL, poupando a CPU da aplicação Java de recalcular dados a cada requisição.
