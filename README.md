# Documentação do Sistema: Agendamento e Gestão de Eventos Esportivos

Aplicação web para centralizar o agendamento e a divulgação de eventos esportivos e festas das atléticas universitárias de Cascavel, Paraná. Trabalho de Conclusão de Curso do Tecnologia em Análise e Desenvolvimento de Sistemas, IFPR Campus Cascavel.

- **Autor:** Gabriel Albuquerque da Silva
- **Orientador:** Prof. Dr. Ricardo da Rosa
- **Repositório:** github.com/Gadsz/agendamento-eventos (privado)
- **Tecnologias:** React, Vite, Firebase Authentication e Cloud Firestore

> Esta documentação descreve a versão com autoria dos eventos, horário e local, filtros por tipo e atlética e confirmação de presença.

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Requisitos](#2-requisitos)
3. [Arquitetura (modelo C4)](#3-arquitetura-modelo-c4)
4. [Modelo de dados](#4-modelo-de-dados)
5. [Controle de acesso e regras de segurança](#5-controle-de-acesso-e-regras-de-segurança)
6. [Fluxos principais](#6-fluxos-principais)
7. [Decisões de arquitetura](#7-decisões-de-arquitetura)
8. [Estrutura do código](#8-estrutura-do-código)
9. [Como executar o projeto](#9-como-executar-o-projeto)
10. [Roteiro de testes](#10-roteiro-de-testes)
11. [Limitações e trabalhos futuros](#11-limitações-e-trabalhos-futuros)
12. [Como manter esta documentação](#12-como-manter-esta-documentação)

---

## 1. Visão geral

**Problema.** Cada atlética divulga seus eventos apenas no próprio perfil de rede social ou grupo de mensagens. Um estudante que quer acompanhar eventos de mais de uma atlética precisa seguir cada uma individualmente, e não existe um canal que reúna tudo.

**Solução.** Uma plataforma web centralizada em que:

- a **atlética** cadastra, edita e exclui os seus eventos e acompanha as presenças confirmadas;
- o **estudante** consulta, em um único lugar, os próximos eventos, filtra por data, tipo e atlética e confirma presença.

**Perfis de usuário.** Estudante e atlética, escolhidos no cadastro e armazenados no banco de dados.

## 2. Requisitos

| Código | Requisito funcional |
|---|---|
| RF01 | Criar conta e entrar com e-mail e senha, escolhendo o perfil de estudante ou de atlética. |
| RF02 | A atlética cadastra eventos, informando nome, data, tipo (esportivo ou festa), descrição e, opcionalmente, horário e local. |
| RF03 | A atlética edita e exclui os eventos que ela mesma cadastrou. |
| RF04 | O estudante visualiza os próximos eventos em ordem cronológica, com a atlética organizadora. |
| RF05 | O estudante filtra os eventos por data, tipo e atlética organizadora. |
| RF06 | O estudante confirma e cancela a sua presença em um evento. |
| RF07 | A atlética consulta a quantidade e a identificação dos estudantes que confirmaram presença nos seus eventos. |

| Código | Requisito não funcional |
|---|---|
| RNF01 | Acesso por navegador web, sem instalação. |
| RNF02 | Listas de eventos atualizadas em tempo real, sem recarregar a página. |
| RNF03 | Controle de acesso por perfil aplicado também no servidor (regras do Firestore). |
| RNF04 | Autenticação delegada ao Firebase Authentication; a aplicação não armazena senhas. |
| RNF05 | Interface adaptável ao tamanho da tela (computador e celular). |

## 3. Arquitetura (modelo C4)

O [modelo C4](https://c4model.com) descreve a arquitetura de software em níveis de zoom sucessivos: **Contexto**, **Contêineres**, **Componentes** e **Código**. Neste projeto os três primeiros níveis estão em diagramas. O quarto nível é opcional e está resumido em tabela na [seção 8](#8-estrutura-do-código).

### 3.1 Nível 1: Contexto

Mostra o sistema como uma caixa única, as pessoas que o usam e os sistemas externos de que depende.

![Diagrama de contexto](diagramas/c1-contexto.png)

| Elemento | Tipo | Descrição |
|---|---|---|
| Estudante | Pessoa | Consulta os próximos eventos, filtra e confirma presença. |
| Atlética | Pessoa | Cadastra, edita e exclui os seus eventos e consulta as presenças confirmadas. |
| Plataforma de Agendamento e Gestão de Eventos | Sistema | Aplicação web que centraliza os eventos das atléticas de Cascavel. |
| Firebase (Google) | Sistema externo | Fornece autenticação de usuários e banco de dados na nuvem. |

### 3.2 Nível 2: Contêineres

Mostra as partes executáveis e os serviços de armazenamento que compõem o sistema. Aqui, "contêiner" é uma unidade que roda ou guarda dados, e não um contêiner Docker.

![Diagrama de contêineres](diagramas/c2-conteineres.png)

| Contêiner | Tecnologia | Responsabilidade |
|---|---|---|
| Aplicação Web (SPA) | React + Vite, JavaScript | Telas de login, gerenciamento de eventos e agenda; executa no navegador do usuário. |
| Firebase Authentication | Serviço gerenciado | Cadastro e login por e-mail e senha; mantém a sessão. |
| Cloud Firestore | NoSQL orientado a documentos | Guarda as coleções `usuarios`, `eventos` e `confirmacoes` e aplica as regras de segurança. |

Não há servidor próprio (back-end): a aplicação conversa diretamente com os serviços do Firebase por meio do SDK, e a segurança é garantida pelas regras do Firestore.

### 3.3 Nível 3: Componentes

Detalha o interior da aplicação web.

![Diagrama de componentes](diagramas/c3-componentes.png)

| Componente | Responsabilidade |
|---|---|
| `App.jsx` | Observa a sessão (`onAuthStateChanged`) e o perfil do usuário (`onSnapshot` em `usuarios/{uid}`) e decide qual tela exibir. |
| `Login.jsx` | Cadastro e login por e-mail e senha; grava o perfil escolhido em `usuarios`; traduz os erros do Firebase para português. |
| `Eventos.jsx` | Tela da atlética: cadastra, edita e exclui eventos (com horário e local); lista somente os eventos da própria atlética e as presenças confirmadas em cada um. |
| `VisualizarEventos.jsx` | Tela do estudante: lista os próximos eventos em ordem de data e horário, com filtros por data, tipo e atlética, e permite confirmar ou cancelar presença. |
| `firebase.js` | Inicializa o SDK do Firebase e exporta `auth` e `db`. |

## 4. Modelo de dados

O Firestore é um banco orientado a documentos. Há três coleções.

**Coleção `usuarios`** (identificador do documento = UID da conta no Firebase Authentication)

| Campo | Tipo | Descrição |
|---|---|---|
| `email` | texto | E-mail da conta. |
| `tipo` | texto | `estudante` ou `atletica` (sem acento, exatamente como gravado). |

**Coleção `eventos`** (identificador gerado automaticamente)

| Campo | Tipo | Descrição |
|---|---|---|
| `nome` | texto | Nome do evento. |
| `data` | texto `AAAA-MM-DD` | Data do evento; o formato permite ordenar e filtrar por comparação de texto. |
| `horario` | texto `HH:MM` | Horário do evento (opcional). |
| `local` | texto | Local do evento (opcional). |
| `tipo` | texto | `esportivo` ou `festa`. |
| `descricao` | texto | Descrição livre. |
| `atleticaId` | texto | UID da atlética que criou o evento (autoria). |
| `atleticaEmail` | texto | E-mail da atlética, exibido aos estudantes como organizadora. |

**Coleção `confirmacoes`** (identificador do documento = `eventoId_uid`, o que garante no máximo uma confirmação por estudante e evento)

| Campo | Tipo | Descrição |
|---|---|---|
| `eventoId` | texto | Identificador do evento confirmado. |
| `usuarioId` | texto | UID do estudante que confirmou. |
| `usuarioEmail` | texto | E-mail do estudante, exibido à atlética. |
| `atleticaId` | texto | UID da atlética organizadora (cópia do `atleticaId` do evento, usada nas regras e na consulta da atlética). |
| `criadoEm` | data/hora | Momento da confirmação (`serverTimestamp`). |

## 5. Controle de acesso e regras de segurança

O acesso é controlado em duas camadas: a interface exibe apenas a tela do perfil, e as regras do Firestore recusam no servidor qualquer operação não permitida, mesmo que alguém tente gravar por fora da interface.

| Operação | Sem login | Estudante | Atlética |
|---|---|---|---|
| Ler o próprio perfil | Não | Sim | Sim |
| Criar o próprio perfil (`tipo` válido) | Não | Sim | Sim |
| Alterar ou excluir perfil | Não | Não | Não |
| Ler eventos | Não | Sim | Sim |
| Criar evento | Não | Não | Sim, com o próprio `atleticaId` |
| Editar ou excluir evento | Não | Não | Somente os próprios eventos |
| Criar confirmação de presença | Não | Sim, em nome próprio e com o `atleticaId` real do evento | Não |
| Ler confirmações | Não | Somente as próprias | Somente as dos seus eventos |
| Cancelar (excluir) confirmação | Não | Somente as próprias | Somente as dos seus eventos |
| Alterar confirmação | Não | Não | Não |

Regras publicadas no Cloud Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function ehAtletica() {
      let ref = /databases/$(database)/documents/usuarios/$(request.auth.uid);
      return request.auth != null && exists(ref) && get(ref).data.tipo == 'atletica';
    }
    function ehEstudante() {
      let ref = /databases/$(database)/documents/usuarios/$(request.auth.uid);
      return request.auth != null && exists(ref) && get(ref).data.tipo == 'estudante';
    }

    match /usuarios/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow create: if request.auth != null && request.auth.uid == uid
        && request.resource.data.tipo in ['estudante', 'atletica'];
      allow update, delete: if false;
    }

    match /eventos/{id} {
      allow read: if request.auth != null;
      allow create: if ehAtletica()
        && request.resource.data.atleticaId == request.auth.uid;
      allow update: if ehAtletica()
        && resource.data.atleticaId == request.auth.uid
        && request.resource.data.atleticaId == request.auth.uid;
      allow delete: if ehAtletica()
        && resource.data.atleticaId == request.auth.uid;
    }

    // Confirmação de presença: um documento por estudante e evento (id = eventoId_uid).
    match /confirmacoes/{id} {
      allow read: if request.auth != null
        && (resource.data.usuarioId == request.auth.uid
            || resource.data.atleticaId == request.auth.uid);
      allow create: if ehEstudante()
        && request.resource.data.usuarioId == request.auth.uid
        && id == request.resource.data.eventoId + '_' + request.auth.uid
        && get(/databases/$(database)/documents/eventos/$(request.resource.data.eventoId)).data.atleticaId
           == request.resource.data.atleticaId;
      allow update: if false;
      allow delete: if request.auth != null
        && (resource.data.usuarioId == request.auth.uid
            || resource.data.atleticaId == request.auth.uid);
    }
  }
}
```

## 6. Fluxos principais

**Cadastro e login.** O usuário informa e-mail e senha e escolhe o perfil. O Firebase Authentication cria a conta, e a aplicação grava o documento `usuarios/{uid}` com o perfil. O `App.jsx` detecta a sessão, lê o perfil e exibe a tela correspondente.

**Cadastro de evento pela atlética** (diagrama de sequência):

![Fluxo de cadastro de evento](diagramas/fluxo-cadastro-evento.png)

**Consulta pelo estudante.** A tela abre uma escuta em tempo real da coleção `eventos`, ordenada por `data`. A lista exibe apenas eventos de hoje em diante (a data de hoje é calculada no fuso local), ordenados por data e horário, e os filtros de data, tipo e atlética restringem a lista no navegador.

**Confirmação de presença.** Ao clicar em "Eu vou", o estudante grava o documento `confirmacoes/{eventoId}_{uid}`, com a atlética organizadora copiada do evento. A tela do estudante escuta apenas as suas confirmações (`where usuarioId == uid`) e a da atlética escuta as recebidas (`where atleticaId == uid`), ambas em tempo real. Ao excluir um evento, a atlética remove também as confirmações dele.

## 7. Decisões de arquitetura

| Decisão | Motivo |
|---|---|
| Aplicação **web**, e não aplicativo móvel | Simplifica o desenvolvimento no prazo disponível e funciona em computador e celular pelo navegador. |
| **React + Vite** | Interface em componentes reutilizáveis; o Vite reduz a configuração inicial do projeto. |
| **Firebase** (Authentication + Firestore) como BaaS | Dispensa construir e manter um servidor próprio e uma API; entrega autenticação pronta. |
| Perfil guardado no Firestore e verificado pelas **regras** | A segurança não depende só da interface; o servidor recusa operações indevidas. |
| **Autoria** do evento (`atleticaId`) | Impede que uma atlética edite ou exclua o evento de outra e permite exibir a organizadora. |
| Confirmações em **coleção própria** (`confirmacoes`) | O estudante não é dono do evento e não poderia alterá-lo pelas regras; um documento por confirmação, com identificador composto, evita duplicatas e permite regras específicas. |
| Desenvolvimento **incremental** em 6 incrementos | Trabalho individual e prazo curto: cada etapa entrega uma versão testável. |
| Sem prototipação no Figma | Decisão de projeto, dado o prazo curto; o desenvolvimento seguiu direto para o código. |

Incrementos: (1) autenticação e perfil, (2) cadastro, edição e exclusão de eventos, (3) agenda do estudante e controle de acesso, (4) filtro por data e ajustes de interface, (5) horário e local nos eventos e filtros por tipo e atlética, (6) confirmação de presença.

## 8. Estrutura do código

Código dentro de `src/` (nível 4 do C4, resumido):

| Arquivo | Funções principais |
|---|---|
| `App.jsx` | Efeito que assina `onAuthStateChanged` e `onSnapshot` do perfil; renderização por perfil (`atletica` ou `estudante`); botão Sair. |
| `Login.jsx` | `handleCadastro`, `handleLogin`, `traduzirErro`. |
| `Eventos.jsx` | `handleSalvar` (cria ou edita), `handleEditar`, `handleExcluir` (remove também as confirmações do evento), `limparFormulario`; consultas com `where("atleticaId", "==", uid)` em `eventos` e `confirmacoes`. |
| `VisualizarEventos.jsx` | `hojeISO`, `formatarData`, `alternarPresenca`, `limparFiltros`; consulta com `orderBy("data")`; escuta das próprias confirmações; filtros de futuros, data, tipo e atlética. |
| `firebase.js` | Configuração do projeto Firebase; exporta `auth` e `db`. |

Os demais arquivos (`main.jsx`, `index.html`, `package.json`, `vite.config.js`) são gerados pelo Vite.

## 9. Como executar o projeto

Pré-requisitos: Node.js (versão LTS) e Git.

```bash
git clone https://github.com/Gadsz/agendamento-eventos.git
cd agendamento-eventos
npm install
npm run dev
```

O terminal mostra o endereço local (normalmente `http://localhost:5173`).

**Configuração do Firebase.** O arquivo `src/firebase.js` precisa conter as chaves do projeto `agendamento-eventos-cascavel` (console do Firebase → Configurações do projeto → Seus apps). A estrutura esperada é:

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = { /* chaves do projeto Firebase */ };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

Se o projeto Firebase for recriado, é preciso ativar o provedor **E-mail/senha** em Authentication, criar o banco Firestore e publicar as regras da [seção 5](#5-controle-de-acesso-e-regras-de-segurança).

## 10. Roteiro de testes

Teste manual com duas contas de atlética (A e B) e uma de estudante (E). Preencha a coluna "Resultado" ao executar.

| Nº | Cenário | Resultado esperado | Resultado |
|---|---|---|---|
| T01 | Criar conta de estudante e de atlética | Conta criada; cada perfil vê a sua tela | |
| T02 | Login com senha errada | Mensagem "E-mail ou senha incorretos." | |
| T03 | Atlética A cadastra evento | Evento aparece em "Meus Eventos" | |
| T04 | Atlética A edita e exclui o próprio evento | Alteração salva; exclusão pede confirmação | |
| T05 | Atlética B abre "Meus Eventos" | Não vê os eventos da A | |
| T06 | Atlética B tenta apagar evento da A por fora da interface | `permission-denied` | |
| T07 | Estudante E abre a agenda | Vê os eventos futuros de A e B, com "Organizado por" | |
| T08 | Estudante filtra por uma data | Lista apenas eventos daquele dia; "Limpar" restaura | |
| T09 | Estudante tenta gravar evento por fora da interface | `permission-denied` | |
| T10 | Evento com data passada | Não aparece na agenda do estudante | |
| T11 | Atlética A cadastra evento com horário e local | Horário e local aparecem no cartão da atlética e na agenda do estudante | |
| T12 | Estudante E clica em "Eu vou" e depois cancela | Botão muda para "Presença confirmada" e volta ao normal | |
| T13 | Atlética A abre "Meus eventos" após a confirmação de E | Vê "1 presença confirmada" e o e-mail de E | |
| T14 | Atlética B abre "Meus eventos" | Não vê as confirmações dos eventos da A | |
| T15 | Estudante filtra por tipo e por atlética | Lista apenas os eventos correspondentes; "Limpar filtros" restaura | |
| T16 | Estudante tenta confirmar presença em nome de outro usuário por fora da interface | `permission-denied` | |
| T17 | Atlética A exclui evento com confirmações | Evento e confirmações removidos | |

## 11. Limitações e trabalhos futuros

- **Perfil autodeclarado:** qualquer pessoa pode se cadastrar como atlética. O ideal é que um administrador aprove os perfis de atlética.
- **Identificação da atlética por e-mail:** não há campo de nome da atlética; incluí-lo melhoraria a exibição.
- **Filtro de eventos futuros no cliente:** a aplicação lê todos os eventos e filtra no navegador. Para volumes maiores, filtrar na consulta e paginar.
- **Datas e horários em texto:** simples e ordenáveis, mas sem tratamento de fuso ou de eventos que atravessam a meia-noite.
- **Confirmação de presença sem limite de vagas:** não há capacidade máxima nem lista de espera.
- **Sem notificações** de novos eventos.
- **Levantamento de requisitos por observação** dos canais de divulgação, sem entrevistas com as atléticas.
- **Hospedagem:** a documentação cobre a execução local; a publicação (por exemplo, Firebase Hosting) não faz parte do escopo atual.

## 12. Como manter esta documentação

- Os diagramas C4 estão em `diagramas/` como **SVG** (editável em draw.io ou Inkscape) e **PNG** (usado neste documento). O diagrama de sequência tem o código-fonte em Mermaid (`fluxo-cadastro-evento.mmd`), que pode ser editado e renderizado em mermaid.live.
- Ao mudar a arquitetura (novo serviço, novo componente), atualize o diagrama do nível correspondente e a tabela que o acompanha.
- Mantenha as regras da seção 5 iguais às publicadas no console do Firebase.

## Referências

- BROWN, Simon. *The C4 Model: Visualizing Software Architecture*. O'Reilly Media, 2026. Documentação complementar: https://c4model.com
- Documentação do Firebase (Authentication e Cloud Firestore): https://firebase.google.com/docs
- React: https://react.dev · Vite: https://vite.dev
