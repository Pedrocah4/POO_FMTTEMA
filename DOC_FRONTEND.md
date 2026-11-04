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
  }
</style>

# 🎨 FMTTEMA - Guia Arquitetural da Interface (Frontend)

> **Manual Técnico e Didático da Aplicação Web (SPA)**  
> **Instituição:** Federação de Muaythai Tradicional do Estado do Maranhão (FMTTEMA)  
> **Disciplina:** Programação Orientada a Objetos (POO) | **Curso:** Análise e Desenvolvimento de Sistemas (UNDB)  
> **Stack:** React 19 • Vite 8 • Tailwind CSS 3.4 • React Router Dom 7 • Axios • Lucide React • Recharts

---

## 🏛️ 1. Visão Geral da Arquitetura

O Frontend da FMTTEMA é uma Single Page Application (SPA) moderna, reativa e baseada em componentes modulares. O ecossistema foi construído com foco em **experiência do usuário (UX)**, tempos de resposta instantâneos via Vite, guarda de rotas dinâmicas, controle de sessão via Context API e estilização baseada na paleta institucional maranhense com Tailwind CSS.

```
                        ┌─────────────────────────────────────────┐
                        │          Navegador Web / Usuário        │
                        └────────────────────┬────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │            App.jsx (Router)             │
                        │    Rotas Públicas vs. PrivateRoute      │
                        └────────────────────┬────────────────────┘
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     ▼                                               ▼
        ┌─────────────────────────┐                     ┌─────────────────────────┐
        │   Vitrine Pública       │                     │    Painel Restrito      │
        │  (Home, Rankings,       │                     │ (MainLayout + Sidebar)  │
        │   Calendário de Eventos)│                     │ RBAC por Role do Token  │
        └────────────┬────────────┘                     └────────────┬────────────┘
                     │                                               │
                     └───────────────────────┬───────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │           AuthContext.jsx               │
                        │  Estado do Usuário, Token e Permissões  │
                        └────────────────────┬────────────────────┘
                                             │
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │           api.js (Axios Client)         │
                        │  Injeta Authorization: Bearer <Token>   │
                        └────────────────────┬────────────────────┘
                                             │ HTTP REST
                                             ▼
                        ┌─────────────────────────────────────────┐
                        │          Backend API (Porta 8080)       │
                        └─────────────────────────────────────────┘
```

<div style="page-break-after: always;"></div>

## 📂 2. Árvore de Diretórios Completa do Frontend

```
frontend/
├── index.html                               # HTML mestre onde o React injeta o componente raiz
├── package.json                             # Dependências (React 19, Axios, Lucide, Recharts, Vite, Tailwind)
├── vite.config.js                           # Configurações do bundler Vite e plugins
├── tailwind.config.js                       # Paleta do Maranhão (fmt-blue, fmt-red) e tipografia
├── postcss.config.js                        # Configuração do PostCSS para compilação das classes
└── src/
    ├── main.jsx                             # Inicializador do ReactDOM no elemento #root
    ├── App.jsx                              # Definição e mapeamento de rotas com BrowserRouter
    ├── App.css                              # Folha de estilo de apoio e animações suaves
    ├── index.css                            # Diretivas Tailwind (@tailwind base, components, utilities)
    │
    ├── assets/                              # Mídias e imagens estáticas institucionais
    │   ├── fmttema-logo.jpg                 # Brasão oficial da federação
    │   ├── hero.png                         # Banner da landing page
    │   ├── react.svg
    │   └── vite.svg
    │
    ├── context/                             # Gerenciamento de Estado Global
    │   └── AuthContext.jsx                  # Sessão do usuário, token JWT e persistência
    │
    ├── services/                            # Camada de Comunicação com o Servidor
    │   └── api.js                           # Cliente Axios com interceptors de token e captura de 401
    │
    ├── components/                          # Componentes modulares, painéis e modais
    │   ├── ArvoreTorneio.jsx                # Visualizador de chaves e avanço de fase
    │   ├── CalendarioEventosPublico.jsx     # Cards de torneios públicos com link de ingressos
    │   ├── DashboardCard.jsx                # Card reutilizável de métricas analíticas
    │   ├── FmttemaLogo.jsx                  # Logomarca padronizada da federação
    │   ├── GestaoEscalasArbitros.jsx        # Painel do Admin para convocar árbitros com licença ativa
    │   ├── MainLayout.jsx                   # Layout mestre com Sidebar retrátil e topo
    │   ├── ModalBaixaAnuidade.jsx           # Modal do Admin com upload binário e baixa manual
    │   ├── ModalEditarCartel.jsx            # Modal de edição de vitórias, derrotas e Kruang
    │   ├── ModalEnvioComprovante.jsx        # Modal do Atleta/Academia para anexar recibo (PDF/imagem)
    │   ├── ModalSumulaLuta.jsx              # Modal do Árbitro para lançar vencedor na súmula
    │   ├── Navbar.jsx                       # Cabeçalho da área pública com botões institucionais
    │   ├── PainelComercialParceiros.jsx     # Painel de gestão e upload de patrocinadores
    │   ├── PainelDashboardAnalitico.jsx     # Gráficos Recharts e métricas analíticas para ADMIN
    │   ├── PainelEscalaArbitro.jsx          # Painel exclusivo do Árbitro (Minhas Convocações)
    │   ├── PainelFinanceiroAnuidades.jsx    # Tabela financeira completa e isolada por perfil
    │   ├── PainelInscricoesTorneio.jsx      # Inscrição com UX preventiva de peso e categoria
    │   ├── PerfilCartelAtleta.jsx           # Perfil esportivo do lutador e histórico de lutas
    │   ├── PrivateRoute.jsx                 # Guarda de rotas protegidas por autenticação e RBAC
    │   ├── Sidebar.jsx                      # Menu lateral inteligente com filtro por Perfil de Acesso
    │   ├── TabelaPendencias.jsx             # Fila de homologação cadastral do Admin
    │   ├── TabelaRankingEstadual.jsx        # Tabelas dinâmicas de ranking (Volume e Eficiência)
    │   └── VitrineParceiros.jsx             # Grid público de logomarcas dos patrocinadores oficiais
    │
    └── pages/                               # Páginas completas
        ├── CadastroPublico.jsx              # Tela de auto-cadastro com abas (Atleta ou Academia)
        ├── ChavesTorneio.jsx                # Visualização pública das chaves de campeonatos
        ├── Dashboard.jsx                    # Orquestrador pós-login baseado na Sidebar
        ├── Home.jsx                         # Landing page institucional aberta ao público
        ├── Login.jsx                        # Tela de autenticação com validação e feedback visual
        └── RankingPublico.jsx               # Tela aberta de rankings estaduais
```

<div style="page-break-after: always;"></div>

## 🧩 3. Catálogo Detalhado de Páginas e Componentes

### 3.1. Páginas Públicas e de Acesso (`pages/`)
- **`Home.jsx`**: Vitrine institucional aberta. Exibe o banner oficial (*Hero*), os próximos torneios com botão para ingressos, atalhos para os rankings estaduais e galeria de patrocinadores.
- **`Login.jsx`**: Formulário de acesso ao sistema. Valida campos de e-mail e senha, chama o endpoint `POST /auth/login` via Axios, armazena o token JWT no `localStorage`, atualiza o `AuthContext` e redireciona para o `/dashboard`. Apresenta alertas claros caso o usuário esteja pendente de homologação.
- **`CadastroPublico.jsx`**: Tela responsiva de auto-cadastro com abas (*Tabs*):
  - *Atleta:* Coleta dados pessoais, CPF, data de nascimento, peso, academia e graduação.
  - *Academia:* Coleta CNPJ, responsável técnico, telefone e cidade.
  - Bloqueia expressamente cadastros nos perfis `ADMIN` e `ARBITRO`.
- **`Dashboard.jsx`**: Orquestrador central pós-login. Utiliza o `MainLayout` e a `Sidebar` para renderizar reativamente o painel correspondente ao perfil autenticado.
- **`RankingPublico.jsx`**: Consulta aberta de classificação de atletas por Volume de Lutas e Eficiência Percentual.
- **`ChavesTorneio.jsx`**: Tela pública de visualização das chaves eliminatórias dos torneios oficiais.

---

### 3.2. Módulo Estrutural de Navegação e Guarda de Rotas
- **`MainLayout.jsx`**: Container estrutural da aplicação pós-login. Controla a abertura e recolhimento da `Sidebar` em telas desktop e mobile, além de fornecer o cabeçalho superior com dados do usuário.
- **`Sidebar.jsx`**: Menu lateral inteligente. Filtra dinamicamente as opções visíveis com base no perfil do usuário (`user.perfil`). Fornece contadores de pendências em tempo real para o `ADMIN` e botão de encerramento seguro de sessão (*Logout*).
- **`Navbar.jsx`**: Barra de navegação pública superior com links institucionais e acesso rápido ao login.
- **`FmttemaLogo.jsx`**: Componente unificado da logo oficial da federação.
- **`PrivateRoute.jsx`**: Componente de guarda do React Router. Verifica se existe token ativo e válido; se o usuário não estiver logado, redireciona para `/login`. Se o usuário não tiver o perfil exigido pela rota, redireciona para a tela inicial do dashboard.

---

### 3.3. Painéis e Modais de Regras de Negócio
- **`PainelDashboardAnalitico.jsx`**: Exclusivo para administradores. Exibe cards de resumo financeiro (receitas, despesas, saldo de caixa) e gráficos dinâmicos de pizza e barras com **Recharts** demonstrando a distribuição de filiados por categoria.
- **`DashboardCard.jsx`**: Card reutilizável de métricas analíticas.
- **`TabelaPendencias.jsx`**: Fila de aprovação de novos cadastros de atletas, agremiações e árbitros.
- **`PainelFinanceiroAnuidades.jsx`**: Gestão financeira de anuidades.
  - *Admin:* Lista todas as anuidades cadastradas, filtra por status ou tipo, abre modal de baixa manual e exibe recibos.
  - *Atleta / Academia:* Exibe exclusivamente a sua própria anuidade via `/api/financeiro/anuidades/me` e disponibiliza o botão "Enviar Comprovante".
- **`ModalBaixaAnuidade.jsx`**: Modal do administrador para upload binário multipart ou validação de recibo e confirmação de pagamento com lançamento em fluxo de caixa.
- **`ModalEnvioComprovante.jsx`**: Modal dedicado para Atletas e Academias enviarem arquivo de comprovante (PDF ou Imagens) via `FormData`.
- **`PainelInscricoesTorneio.jsx`**: Inscrição em torneios com **UX Preventiva**: destaca a categoria compatível com o peso do atleta e desabilita o botão antes do clique caso o peso exceda o limite, prevenindo erros 400.
- **`PerfilCartelAtleta.jsx`**: Ficha técnica do lutador com cartel de combates (vitórias, derrotas, empates) e graduação Kruang.
- **`ModalEditarCartel.jsx`**: Modal para atualização do cartel e da graduação pelo atleta ou treinador.
- **`GestaoEscalasArbitros.jsx`**: Painel administrativo para convocar árbitros com validação de licença vigente.
- **`PainelEscalaArbitro.jsx`**: Painel exclusivo do árbitro para aceitar ou recusar convocações oficiais através de modais institucionais.
- **`ArvoreTorneio.jsx`**: Renderizador visual da árvore eliminatória (Quartas, Semifinal e Final) com indicação visual da regra do *"Bye"*.
- **`ModalSumulaLuta.jsx`**: Interface interativa para o árbitro selecionar o vencedor e enviar a súmula oficial.
- **`PainelComercialParceiros.jsx`**: Painel administrativo para gestão e upload de patrocinadores.
- **`VitrineParceiros.jsx`**: Carrossel institucional de patrocinadores.
- **`CalendarioEventosPublico.jsx`**: Cards de eventos esportivos com link para venda de ingressos.
- **`TabelaRankingEstadual.jsx`**: Tabelas dinâmicas de classificação por Volume e Eficiência.

<div style="page-break-after: always;"></div>

## 🔐 4. Autenticação, Sessão e RBAC no Frontend

A segurança e o controle de acesso na interface operam em 3 níveis:

### 4.1. `AuthContext.jsx` (Estado Global da Aplicação)
Centraliza o estado de autenticação através da Context API do React:
- `user`: Dados do usuário logado (`id`, `nome`, `email`, `perfil`).
- `token`: String do Bearer JWT.
- `login(credentials)`: Autentica na API e grava no `localStorage`.
- `logout()`: Limpa o `localStorage` e redireciona para `/login`.

### 4.2. `api.js` (Interceptors do Axios)
Configuração centralizada que injeta o token e trata deslogue automático:
```javascript
// Interceptor de Requisição: Injeta o Token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fmttema_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: Trata expiração do token (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      localStorage.removeItem('fmttema_token');
      localStorage.removeItem('fmttema_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 4.3. RBAC Visual na `Sidebar.jsx`
A Sidebar filtra os menus disponíveis antes de renderizar qualquer elemento no DOM:
```javascript
const menuPorPerfil = {
  ADMIN: ['dashboard', 'pendencias', 'financeiro', 'torneios', 'escalas', 'comercial'],
  ATLETA: ['perfil', 'minhas-inscricoes', 'financeiro'],
  ACADEMIA: ['meu-plantel', 'inscricoes-equipe', 'financeiro'],
  ARBITRO: ['minhas-escalas', 'sumula-torneios'],
  TREINADOR: ['meu-plantel', 'inscricoes-equipe']
};
```

---

## 🎨 5. Design System Oficial FMTTEMA (`tailwind.config.js`)

A paleta de cores reflete a bandeira do Estado do Maranhão e a sobriedade institucional da Federação:

| Token Tailwind | Código Hex | Aplicação no Sistema |
| :--- | :--- | :--- |
| **`fmt-blue`** | `#002868` | Botões primários, cabeçalhos, títulos principais e Corner Azul. |
| **`fmt-blue-hover`** | `#001e4e` | Estados de hover em botões principais e menus ativos. |
| **`fmt-red`** | `#D91C22` | Alertas críticos, badges de inadimplência, exclusões e Corner Vermelho. |
| **`fmt-light`** | `#F4F4F5` | Fundos de cards e áreas de contraste neutro. |
| **`fmt-dark`** | `#111111` | Textos de alto contraste e rodapés institucionais. |

**Tipografia:** `Inter` (sans-serif) para tabelas de alta densidade e `Montserrat` (`font-heading font-extrabold`) para conferir postura esportiva oficial aos títulos.

<div style="page-break-after: always;"></div>

## ❓ 6. Perguntas e Respostas Rápidas (FAQ da Banca de Frontend)

### P1: Como o Frontend conversa com o Backend?
> **Resposta:** Através de requisições HTTP REST assíncronas utilizando a biblioteca **Axios** instanciada em `src/services/api.js`. O cliente se comunica com a API (por padrão em `http://localhost:8080`) enviando payloads em JSON ou dados binários em `FormData` para uploads de comprovantes.

### P2: O que é e para que serve o Interceptor do Axios?
> **Resposta:** É um middleware de rede executado automaticamente antes de cada requisição ou logo após cada resposta. Nosso interceptor injeta o cabeçalho `Authorization: Bearer <token>` em todas as requisições autenticadas sem precisarmos digitar manualmente em cada componente. Caso o servidor retorne status `401 Unauthorized` (token expirado), o interceptor limpa o `localStorage` e redireciona o usuário para o `/login`.

### P3: Como o React protege as rotas para que um visitante não acesse o painel?
> **Resposta:** Através do componente `PrivateRoute.jsx`. Ele envolve as rotas privadas no React Router. Ao tentar acessar uma URL como `/dashboard`, o componente consulta o `AuthContext`. Se não houver token ou usuário logado, a navegação é abortada e o visitante é redirecionado para a tela de login.

### P4: Como o sistema impede que um Atleta envie uma inscrição com peso incompatível?
> **Resposta:** Em `PainelInscricoesTorneio.jsx`, implementamos **UX Preventiva**. Ao selecionar um torneio, o frontend compara o peso cadastrado do atleta com o teto da categoria contemplada. Se o atleta pesar 62.8kg e o evento só tiver categorias até 57.0kg, o botão de inscrição é desabilitado visualmente e um card de aviso em vermelho informa que o peso excede o limite, evitando que o usuário clique e receba um erro 400 da API.

### P5: Como o upload de comprovantes foi implementado no React?
> **Resposta:** Através de objetos `FormData` do navegador nos componentes `ModalBaixaAnuidade.jsx` e `ModalEnvioComprovante.jsx`. O arquivo selecionado pelo usuário (PDF ou imagem) é anexado com `formData.append('arquivo', file)` e despachado com cabeçalho `Content-Type: multipart/form-data` para os endpoints `/api/financeiro/upload-comprovante` ou `/api/financeiro/anuidades/{id}/comprovante`.
