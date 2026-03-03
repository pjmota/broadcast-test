# 🚀 Projeto Broadcast (SaaS)

Sistema de envio de mensagens em massa (Broadcast) com arquitetura SaaS, desenvolvido com React, Firebase e Cloud Functions.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

1.  **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
2.  **Java JDK** (versão 11 ou superior) - Necessário para rodar os emuladores do Firebase. [Download](https://www.oracle.com/java/technologies/downloads/)
3.  **Git** - [Download](https://git-scm.com/)

---

## 🛠️ Instalação e Configuração

Siga os passos abaixo para configurar o ambiente do zero.

### 1. Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd projeto-broadcast
```

### 2. Instalar Dependências Globais

Instale a CLI do Firebase globalmente:

```bash
npm install -g firebase-tools
```

Faça login no Firebase (se ainda não estiver logado):

```bash
firebase login
```

### 3. Instalar Dependências do Projeto

Você precisa instalar as dependências da raiz, do backend (functions) e do frontend (web). Execute os comandos abaixo na raiz do projeto:

```bash
# 1. Instalar dependências da raiz
npm install

# 2. Instalar dependências do Backend (Cloud Functions)
cd functions
npm install
cd ..

# 3. Instalar dependências do Frontend (Web)
cd web
npm install
cd ..
```

---

## ▶️ Como Rodar o Projeto (Ambiente de Desenvolvimento)

Para facilitar o desenvolvimento, criamos um script que inicializa todo o ambiente de backend localmente (Emuladores + Agendador).

### Passo 1: Iniciar o Backend (Emuladores + Agendador)

Na raiz do projeto, execute o script de inicialização pelo PowerShell:

```powershell
./start-dev.ps1
```

> **O que esse script faz?**
> 1. Compila o código TypeScript das Cloud Functions.
> 2. Inicia os Emuladores do Firebase (Firestore, Auth, Functions, PubSub) na porta 4000.
> 3. Abre uma nova janela com o **Agendador Local**, que simula o envio automático de mensagens a cada 10 segundos.

⚠️ **Mantenha essas janelas abertas enquanto estiver desenvolvendo.**

### Passo 2: Iniciar o Frontend

Abra um **novo terminal**, navegue até a pasta `web` e inicie a interface:

```bash
cd web
npm run dev:emulators
```

O frontend estará disponível em: `http://localhost:5173`

---

## 🐛 Solução de Problemas Comuns

### Mensagens Agendadas não são enviadas
Se o agendador automático falhar (por exemplo, devido a diferenças de fuso horário no emulador), você pode **forçar o envio manualmente** acessando este link no navegador:

👉 [http://127.0.0.1:5001/broadcast-saas-dev/us-central1/manualCheck](http://127.0.0.1:5001/broadcast-saas-dev/us-central1/manualCheck)

Isso fará com que o backend verifique e processe imediatamente todas as mensagens pendentes.

### Porta em uso
Se encontrar erros de "Port already in use", certifique-se de parar todos os processos de node/firebase anteriores ou reinicie o computador.

---

## 📂 Estrutura do Projeto

*   **/web**: Frontend React + Vite + TypeScript
*   **/functions**: Backend Cloud Functions (Node.js)
*   **/scripts**: Scripts auxiliares (como o agendador local)
*   **firebase.json**: Configuração dos emuladores e serviços
