# Vallim Tornearia

<p align="center">
  <img src="./assets/home.png" width="90%" alt="Vallim Tornearia Home" />
</p>

## Visão Geral

Vallim Tornearia é um sistema de gestão desktop para tornearias locais. Ele oferece uma interface Electron offline, uma API Node.js e banco de dados SQLite para controlar clientes, serviços, pedidos e relatórios financeiros.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Testes Automatizados](#testes-automatizados)
- [Build de Produção](#build-de-produção)
- [Solução de Problemas](#solução-de-problemas)
- [Backup e Restauração](#backup-e-restauração)
- [Suporte](#suporte)

## Funcionalidades

- CRUD completo de clientes, serviços e pedidos
- Banco de dados SQLite local para operação offline
- Interface desktop com Electron
- Painéis financeiros e exportação em PDF
- Backup e restauração de dados
- Proteção contra exclusão de clientes com serviços vinculados
- Controle de status de serviço e pagamento

## Tecnologias

- Backend: **Node.js 16.20.2**, **Express.js**, **SQLite3**
- Frontend: **HTML5**, **CSS3**, **JavaScript ES6+**
- Desktop: **Electron**, **electron-builder**
- Testes: **Playwright** para automação de API, **Insomnia** para validação manual

## Pré-requisitos

- **Node.js**: 16.20.2
- **npm**: 8.x ou superior
- **Sistemas compatíveis**: Windows 8/10/11, macOS, Linux

## Instalação

```bash
git clone https://github.com/MatheusMadureiraa/nodejs-tornearia.git
cd nodejs-tornearia
npm install
```

> O primeiro `npm install` pode demorar, pois o pacote `sqlite3` exige compilação local.

### Configuração recomendada do Node.js

#### Windows

```powershell
nvm install 16.20.2
nvm use 16.20.2
node --version
npm --version
```

#### macOS / Linux

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16.20.2
nvm use 16.20.2
nvm alias default 16.20.2
```

## Desenvolvimento

Inicie o sistema em modo desenvolvimento:

```bash
npm start
```

Execute somente o servidor API:

```bash
npm run server
```

## Testes Automatizados

O projeto utiliza **Playwright** para testar as rotas de API.

### Instalar Playwright

Playwright está configurado em `package.json` e será instalado com `npm install`.

Se for necessário instalar explicitamente para compatibilidade com Node 16:

```bash
npm install -D @playwright/test@1.40.0
```

### Executar testes de API

```bash
npm run test:api
```

### Cobertura dos testes

- `tests/api.spec.js` — testes de integração para as rotas `/clientes`, `/servicos` e `/pedidos`

## Build de Produção

Prepare o ambiente antes de gerar o instalador:

```bash
npm run clean
npm install
npm start
```

Crie a pasta `build/` na raiz do projeto e adicione os ícones necessários:

```text
build/
├── icon.ico    (Windows - 256x256px)
├── icon.png    (Linux - 512x512px)
└── icon.icns   (macOS - 512x512px)
```

Gere o instalador para Windows:

```bash
npm run build-win
```

Arquivos gerados:

```text
dist/
├── Vallim Tornearia Setup 1.0.0.exe
├── win-unpacked/
├── latest.yml
└── builder-debug.yml
```

## Solução de Problemas

### O aplicativo não abre

1. Execute como administrador.
2. Verifique se o antivírus ou o Windows Defender está bloqueando o app.
3. Verifique se a porta `3500` está em uso:

```bash
netstat -ano | findstr :3500
```

### A interface carrega, mas os dados não aparecem

- Abra o console do desenvolvedor (`F12`).
- Procure por erros como `net::ERR_CONNECTION_REFUSED`.
- Aguarde 10–15 segundos para o servidor interno iniciar.

### Erro ao gerar o instalador

- Verifique a versão do Node.js:

```bash
node --version
```

- Limpe e reinstale dependências:

```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build-win
```

- Verifique se `build/icon.ico` existe e está correto.

### SQLite3 não compila

- Instale as ferramentas de build do Windows.
- Reinstale ou reconstrua o pacote:

```bash
npm rebuild sqlite3
```

## Backup e Restauração

### Fazer backup

1. Clique em **Backup** no menu da aplicação.
2. Selecione o local de salvamento.
3. O backup inclui a base de dados e os arquivos de configuração.

### Restaurar backup

1. Clique em **Restaurar**.
2. Selecione o arquivo `.zip` do backup.
3. O sistema será restaurado e reiniciado automaticamente.

> Faça backup antes de atualizar ou alterar dados críticos.

## Suporte

Para desenvolvedores:

- Verifique o console do navegador (`F12`).
- Confira os logs em `%APPDATA%\tornearia-vallim\`.
- Execute `npm start` para visualizar mensagens do servidor.

Para usuários:

- Utilize a ajuda integrada no sistema.
- Siga as instruções de instalação.
- Envie capturas de tela e logs ao relatar problemas.

## Informações do Projeto

- **Autor:** Matheus Madureira
- **Licença:** MIT
- **Versão:** 1.0.0

---

*README atualizado para incluir instruções de instalação do Playwright e informações sobre testes automatizados.*
