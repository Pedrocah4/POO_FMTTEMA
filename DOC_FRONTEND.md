# 🎨 FMTTEMA - Guia Arquitetural da Interface (Frontend)

> Manual técnico e didático da Single Page Application (SPA) da **Federação de Muaythai Tradicional do Estado do Maranhão (FMTTEMA)**. Elaborado para estudo, alinhamento técnico da equipe e suporte para a apresentação da disciplina de **Programação Orientada a Objetos (POO)** na **UNDB**.

---

## 🏛️ 1. Visão Geral da Arquitetura

O Frontend da FMTTEMA é uma aplicação web reativa desenvolvida com **React 19** e empacotada com o **Vite 8**. Toda a interface adota uma arquitetura orientada a componentes modulares, consumo de API REST assíncrona via **Axios**, controle global de sessão através da **Context API**, roteamento dinâmico com **React Router Dom 7** e estilização baseada em tokens de utilitários com **Tailwind CSS 3.4**.

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

---

## 📂 2. Árvore de Diretórios Completa do Frontend

```
frontend/
├── index.html                               # Ponto de entrada HTML único da SPA
├── package.json                             # Dependências e scripts do projeto (vite, react, tailwind)
├── vite.config.js                           # Configurações do compilador Vite e plugins
├── tailwind.config.js                       # Design system e paleta oficial do Maranhão
├── postcss.config.js                        # Processador CSS para injeção do Tailwind
└── src/
    ├── main.jsx                             # Renderização raiz do React no elemento DOM #root
    ├── App.jsx                              # Definição das rotas e encapsulamento com AuthProvider
    ├── App.css                              # Estilos globais e animações customizadas
    ├── index.css                            # Diretivas Tailwind (@tailwind base, components, utilities)
    │
    ├── assets/                              # Recursos visuais estáticos
    │   ├── fmttema-logo.jpg                 # Brasão oficial da federação
    │   ├── hero.png                         # Imagem de destaque do banner institucional
    │   ├── react.svg
    │   └── vite.svg
    │
    ├── context/                             # Estado Global de Autenticação
    │   └── AuthContext.jsx                  # Context API com login, logout e persistência do usuário
    │
    ├── services/                            # Camada de Comunicação com APIs
    │   └── api.js                           # Instância Axios com Interceptors de Token e tratamento 401
    │
    ├── components/                          # Componentes reutilizáveis e painéis modulares
    │   ├── ArvoreTorneio.jsx                # Visualizador visual da chave eliminatória e avanços
    │   ├── CalendarioEventosPublico.jsx     # Cards de competições ativas na vitrine aberta
    │   ├── DashboardCard.jsx                # Card de métricas/KPI reutilizável
    │   ├── FmttemaLogo.jsx                  # Componente unificado da logo institucional
    │   ├── GestaoEscalasArbitros.jsx        # Painel do Admin para convocar árbitros
    │   ├── MainLayout.jsx                   # Layout estrutural pós-login (Sidebar retrátil + conteúdo)
    │   ├── ModalBaixaAnuidade.jsx           # Modal do Admin com upload binário e confirmação de baixa
    │   ├── ModalEditarCartel.jsx            # Modal de atualização de vitórias, derrotas e Kruang
    │   ├── ModalEnvioComprovante.jsx        # Modal do Atleta/Academia para anexar recibo (PDF/imagem)
    │   ├── ModalSumulaLuta.jsx              # Modal do Árbitro para lançar vencedor na súmula
    │   ├── Navbar.jsx                       # Cabeçalho público com links institucionais
    │   ├── PainelComercialParceiros.jsx     # Painel de gestão e upload de patrocinadores
    │   ├── PainelDashboardAnalitico.jsx     # Gráficos Recharts e resumo analítico executivo
    │   ├── PainelEscalaArbitro.jsx          # Painel exclusivo do Árbitro (Minhas Convocações)
    │   ├── PainelFinanceiroAnuidades.jsx    # Tabela financeira geral e isolada por agremiação/atleta
    │   ├── PainelInscricoesTorneio.jsx      # Inscrição com checagem preventiva de categorias e peso
    │   ├── PerfilCartelAtleta.jsx           # Ficha técnica do lutador e histórico de combates
    │   ├── PrivateRoute.jsx                 # Guarda de rotas protegidas por autenticação e RBAC
    │   ├── Sidebar.jsx                      # Menu lateral inteligente e responsivo com filtro de perfis
    │   ├── TabelaPendencias.jsx             # Fila de homologação cadastral (Atletas/Academias/Árbitros)
    │   ├── TabelaRankingEstadual.jsx        # Tabelas dinâmicas de ranking (Volume e Eficiência)
    │   └── VitrineParceiros.jsx             # Grid de logomarcas dos patrocinadores oficiais
    │
    └── pages/                               # Páginas completas acessadas pelas rotas
        ├── CadastroPublico.jsx              # Tela de auto-cadastro com tabs (Atleta ou Academia)
        ├── ChavesTorneio.jsx                # Tela de visualização pública das chaves do campeonato
        ├── Dashboard.jsx                    # Orquestrador dos painéis pós-login baseado na Sidebar
        ├── Home.jsx                         # Landing page institucional pública
        ├── Login.jsx                        # Tela de autenticação com validação e feedback visual
        └── RankingPublico.jsx               # Tela aberta de consulta de ranking estadual
```

---

## 🧩 3. Catálogo Detalhado de Páginas e Componentes

### 3.1. Páginas (`src/pages/`)

- **`Home.jsx`**: Porta de entrada pública do portal da FMTTEMA. Apresenta o banner institucional (*Hero Section*), destaques dos próximos campeonatos oficiais do calendário, atalhos rápidos para o ranking estadual, formulário de filiação e vitrine de patrocinadores.
- **`Login.jsx`**: Formulário de acesso ao sistema. Valida campos de e-mail e senha, chama o endpoint `POST /auth/login` via Axios, armazena o token JWT no `localStorage`, sincroniza o estado global no `AuthContext` e redireciona o usuário para o `/dashboard`. Exibe mensagens de erro claras caso a conta esteja com status `PENDENTE` ou credenciais inválidas.
- **`CadastroPublico.jsx`**: Tela responsiva de auto-cadastro com seletor visual em abas (*Tabs*):
  - *Aba Atleta:* Coleta dados pessoais, CPF, data de nascimento, peso, agremiação e graduação.
  - *Aba Academia:* Coleta CNPJ, responsável técnico, telefone e cidade.
  - Bloqueia expressamente cadastros nos papéis `ADMIN` e `ARBITRO` (que exigem designação interna da federação).
- **`Dashboard.jsx`**: Página principal do ambiente autenticado. Envolve os componentes dentro do `MainLayout` e, através do estado selecionado na `Sidebar`, alterna reativamente a renderização dos painéis correspondentes ao perfil logado (`ADMIN`, `ATLETA`, `ACADEMIA`, `ARBITRO`, `TREINADOR`).
- **`RankingPublico.jsx`**: Página aberta de consulta de atletas federados classificados por Volume e Eficiência, consumindo o endpoint público `/api/publico/ranking`.
- **`ChavesTorneio.jsx`**: Página de consulta de chaveamento de campeonatos para visualização do público e atletas.

---

### 3.2. Módulo de Layout e Navegação

- **`MainLayout.jsx`**: Esqueleto visual do painel logado. Gerencia a abertura e recolhimento da `Sidebar` em telas desktop e mobile, cabeçalho com identificação do usuário e área principal de renderização.
- **`Sidebar.jsx`**: Componente central de navegação interna.
  - **Filtro RBAC Automático:** Analisa o papel do usuário (`user.perfil`) e renderiza apenas os menus aos quais ele tem direito legal de acesso.
  - Possui suporte a recolhimento lateral, contadores visuais de pendências para o `ADMIN` e botão de encerramento seguro de sessão (*Logout*).
- **`Navbar.jsx`**: Barra de navegação superior da área pública com links rápidos e botão de login.
- **`FmttemaLogo.jsx`**: Componente reutilizável que padroniza o tamanho e bordas da logomarca oficial da federação.
- **`PrivateRoute.jsx`**: Componente de alta ordem (*HOC / Guard*) do React Router. Verifica se existe token ativo e válido; se o usuário não estiver logado, redireciona para `/login`. Se o usuário não tiver o perfil exigido pela rota, redireciona para a tela inicial do dashboard.

---

### 3.3. Painéis e Modais de Regras de Negócio

- **`PainelDashboardAnalitico.jsx`**: Exclusivo para administradores. Exibe cards de resumo financeiro (faturamento em anuidades, despesas, saldo de caixa) e gráficos dinâmicos de pizza e barras com **Recharts** demonstrando a distribuição de filiados por categoria.
- **`DashboardCard.jsx`**: Cartão estilizado com ícone Lucide, valor numérico de destaque e indicador de variação percentual.
- **`TabelaPendencias.jsx`**: Fila de trabalho do administrador para avaliar e aprovar/recusar solicitações de filiação de novos atletas, agremiações e árbitros.
- **`PainelFinanceiroAnuidades.jsx`**: Painel completo de cobrança e adimplência.
  - Para o **ADMIN:** Lista todas as anuidades cadastradas no Maranhão, filtra por status (`PENDENTE`/`PAGO`) ou tipo (`ATLETA`/`ACADEMIA`), abre modal de baixa manual e exibe recibos.
  - Para o **ATLETA / ACADEMIA:** Exibe exclusivamente a sua própria anuidade via `/api/financeiro/anuidades/me` e disponibiliza o botão "Enviar Comprovante".
- **`ModalBaixaAnuidade.jsx`**: Modal institucional do administrador para registrar a baixa manual de pagamento. Suporta seleção de arquivos binários multipart (enviados para `/api/financeiro/upload-comprovante`) ou colagem de links externos.
- **`ModalEnvioComprovante.jsx`**: Modal acessível pelo Atleta ou Academia para envio direto de comprovante de pagamento via `POST /api/financeiro/anuidades/{id}/comprovante`. Permite arrastar e soltar PDFs ou imagens com feedback de carregamento.
- **`PainelInscricoesTorneio.jsx`**: Módulo de inscrição em torneios.
  - **UX Preventiva:** Ao selecionar o campeonato, renderiza badges com todas as categorias ativas e calcula automaticamente a compatibilidade do peso do atleta. Se o atleta exceder o limite da categoria, desabilita o botão de inscrição antes do envio, evitando erros 400.
  - Valida se o atleta está com anuidade regularizada (`PAGO`).
- **`PerfilCartelAtleta.jsx`**: Exibe o perfil esportivo oficial do atleta: cartel de lutas (vitórias, derrotas, empates), graduação Kruang e agremiação. Permite ao atleta ou ao seu treinador acionar a edição.
- **`ModalEditarCartel.jsx`**: Modal para atualização do histórico de combates e do Kruang.
- **`GestaoEscalasArbitros.jsx`**: Painel administrativo para criar escalas de arbitragem. Valida na tela se o árbitro possui licença técnica vigente antes de convocá-lo.
- **`PainelEscalaArbitro.jsx`**: Espaço de trabalho do árbitro. Exibe os torneios para os quais foi convocado, permitindo confirmar ou recusar a escala através de modais institucionais FMTTEMA (sem uso de `window.confirm`).
- **`ArvoreTorneio.jsx`**: Renderizador em grade hierárquica das chaves eliminatórias (Quartas de Final, Semifinal e Final). Mostra os atletas em cada corner (Vermelho e Azul), destaca os atletas contemplados pela regra do *"Bye"* e oferece o botão para abrir a súmula da luta.
- **`ModalSumulaLuta.jsx`**: Interface interativa de lançamento de súmula. O árbitro seleciona o lutador vitorioso, preenche observações da decisão (ex: Pontos, Nocaute, Desclassificação) e despacha a homologação para a API.
- **`PainelComercialParceiros.jsx`**: Painel administrativo para cadastro e exclusão de patrocinadores, com upload de logomarcas para a pasta do servidor.
- **`VitrineParceiros.jsx`**: Componente de vitrine que exibe os patrocinadores oficiais no rodapé e nas áreas públicas.
- **`CalendarioEventosPublico.jsx`**: Lista de cards de eventos esportivos com cartazes oficiais, datas, locais e botões para compra de ingressos via Sympla/Bilheteria Digital.
- **`TabelaRankingEstadual.jsx`**: Tabela com paginação e busca, renderizando os dados providos pelas Views SQL de Volume e Eficiência.

---

## 🔐 4. Autenticação, Sessão e RBAC no Frontend

A segurança da interface é estruturada em torno de 3 pilares:

### 4.1. `AuthContext.jsx` (Estado Global de Sessão)
Mantém as seguintes informações acessíveis em qualquer componente da árvore:
- `user`: Objeto contendo `id`, `nome`, `email` e `perfil` (`ADMIN`, `ATLETA`, `ACADEMIA`, `ARBITRO`, `TREINADOR`).
- `token`: String do Bearer JWT.
- `login(credentials)`: Função assíncrona que executa a autenticação e salva no `localStorage`.
- `logout()`: Limpa o `localStorage` e redireciona imediatamente para `/login`.

### 4.2. `api.js` (Interceptors do Axios)
Configuração centralizada que injeta o token em todas as requisições autenticadas:
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
A Sidebar não se limita a esconder botões com CSS; ela filtra os arrays de navegação com base na role do usuário autenticado:
```javascript
const menuPorPerfil = {
  ADMIN: ['dashboard', 'pendencias', 'financeiro', 'torneios', 'escalas', 'comercial'],
  ATLETA: ['perfil', 'minhas-inscricoes', 'financeiro'],
  ACADEMIA: ['meu-plantel', 'inscricoes-equipe', 'financeiro'],
  ARBITRO: ['minhas-escalas', 'sumula-torneios'],
  TREINADOR: ['meu-plantel', 'inscricoes-equipe']
};
```
Isso impede que um atleta visualize itens de menu restritos à diretoria.

---

## 🎨 5. Design System Oficial FMTTEMA (`tailwind.config.js`)

A identidade visual foi construída para refletir as cores da bandeira do Estado do Maranhão e da Federação de Muaythai:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'fmt-blue': {
          DEFAULT: '#002868', // Azul Marinho Institucional Maranhão
          hover: '#001e4e',
          light: '#e8edf6',
        },
        'fmt-red': {
          DEFAULT: '#D91C22', // Vermelho Oficial de Destaque
          hover: '#b51419',
          light: '#fde8e9',
        },
        'fmt-light': '#F4F4F5',
        'fmt-dark': '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      }
    }
  }
}
```

- **Azul FMT (`#002868`)**: Utilizado em botões primários, cabeçalhos, títulos principais e bordas de destaque.
- **Vermelho FMT (`#D91C22`)**: Utilizado em avisos críticos, badges de alerta e destaques competitivos (Corner Vermelho).
- **Tipografia:** `Inter` para clareza e legibilidade em tabelas de dados; `Montserrat` em negrito (`font-heading font-extrabold`) para conferir postura esportiva institucional aos títulos.

---

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
