# Projeto Broadcast (SaaS)

Sistema de envio de mensagens em massa (Broadcast) com arquitetura SaaS, desenvolvido com React, Firebase e Cloud Functions.

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v18+)
- Java (para rodar os emuladores do Firebase)
- Firebase CLI (`npm install -g firebase-tools`)

### 1. Instalação

```bash
# Instalar dependências do Frontend
cd web
npm install

# Instalar dependências das Cloud Functions
cd ../functions
npm install
```

### 2. Rodando em Desenvolvimento (com Emuladores Locais)

Para testar todas as funcionalidades (incluindo agendamento de mensagens via Cloud Functions) sem depender do ambiente de produção, utilize o modo com emuladores.

**Passo 1: Iniciar os Emuladores do Firebase**
Na raiz do projeto:
```bash
firebase emulators:start --only functions,firestore,auth
```
Isso iniciará:
- Firestore Emulator (porta 8080)
- Functions Emulator (porta 5001)
- Auth Emulator (porta 9099)
- Emulator UI (porta 4000 - acesse http://localhost:4000 para ver os dados)

**Passo 2: Iniciar o Frontend conectado aos Emuladores**
Em outro terminal, na pasta `web`:
```bash
cd web
npm run dev:emulators
```
O frontend irá detectar automaticamente a variável `VITE_USE_EMULATORS=true` e se conectar aos emuladores locais.

### 3. Rodando em Desenvolvimento (Conectado à Produção)

Se quiser rodar o frontend localmente mas conectado aos serviços reais do Firebase na nuvem:

```bash
cd web
npm run dev
```
⚠️ **Nota:** Neste modo, as Cloud Functions de agendamento só funcionarão se você tiver feito o deploy delas para o Firebase (`firebase deploy --only functions`).

## 🛠️ Estrutura do Projeto

- **/web**: Frontend React + Vite + TypeScript
- **/functions**: Backend Cloud Functions
- **firebase.json**: Configuração dos serviços e emuladores

## ✨ Funcionalidades Principais

- **SaaS Multi-tenant**: Isolamento de dados por Usuário e Conexão.
- **Agendamento de Mensagens**: Cloud Function agendada (Scheduler) processa mensagens a cada 1 minuto.
- **Real-time**: Atualizações instantâneas via Firestore onSnapshot.
