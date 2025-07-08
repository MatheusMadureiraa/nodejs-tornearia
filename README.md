# Sistema para Tornearia Vallim

<p align="center">
  <img src="./assets/home.png" width="90%" alt="Home"/>
</p>

## 🛠️ Sobre o Projeto

Sistema desenvolvido para digitalizar os processos de uma tornearia local, substituindo o controle manual de pedidos e serviços. O sistema funciona completamente offline e inclui:

- API em Node.js com arquitetura MVC
- Banco de dados SQLite para uso offline
- Interface desktop criada com Electron
- Gerenciamento de **clientes**, **serviços**, **gastos** e **relatórios financeiros**
- Sistema de backup e restauração

---

## 📋 Pré-requisitos para Desenvolvimento

### Versões Obrigatórias
- **Node.js**: 16.20.2 (exatamente esta versão para compatibilidade com Windows 8)
- **npm**: 8.x ou superior
- **Sistema Operacional**: Windows 8/10/11, macOS, Linux

### Instalar Node.js 16.20.2 com NVM (Recomendado)

#### Windows:
1. Instale o NVM para Windows: https://github.com/coreybutler/nvm-windows/releases
2. Abra o PowerShell como administrador
3. Execute os comandos:
```powershell
nvm install 16.20.2
nvm use 16.20.2
node --version  # Deve mostrar v16.20.2
npm --version   # Deve mostrar 8.x.x
```

#### Linux/macOS:
```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reiniciar terminal e instalar Node.js
nvm install 16.20.2
nvm use 16.20.2
nvm alias default 16.20.2
```

### Verificar Instalação
```bash
node --version  # Deve retornar: v16.20.2
npm --version   # Deve retornar: 8.x.x
```

---

## 🚀 Como Executar em Desenvolvimento

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/tornearia-vallim.git

# 2. Acesse a pasta do projeto
cd tornearia-vallim

# 3. Instale as dependências (pode demorar alguns minutos)
npm install

# 4. Execute o sistema em modo desenvolvimento
npm start
```

**Importante**: O primeiro `npm install` pode demorar 5-10 minutos pois precisa compilar o SQLite3 para sua plataforma.

---

## 📦 Como Gerar o Executável (.exe) para Produção

### Passo 1: Preparar o Ambiente de Build

```bash
# Limpar cache anterior (se houver problemas)
npm run clean

# Instalar dependências
npm install

# Verificar se tudo está funcionando
npm start
```

### Passo 2: Criar os Ícones (OBRIGATÓRIO)

Crie a pasta `build` na raiz do projeto e adicione os ícones:

```
build/
├── icon.ico    (Windows - 256x256px)
├── icon.png    (Linux - 512x512px)  
└── icon.icns   (macOS - 512x512px)
```

**⚠️ CRÍTICO**: Sem os ícones, o build falhará. Use ferramentas online para converter o logo:
- Para .ico: https://convertio.co/png-ico/
- Para .icns: https://cloudconvert.com/png-to-icns

### Passo 3: Gerar o Executável

```bash
# Para Windows (recomendado para seu cliente Windows 8)
npm run build-win
```

### Passo 4: Localizar os Arquivos Gerados

Após o build bem-sucedido:
```
dist/
├── Vallim Tornearia Setup 1.0.0.exe  # ← ESTE é o instalador
├── win-unpacked/                      # Versão portátil (pasta)
├── latest.yml                         # Metadados
└── builder-debug.yml                  # Log de debug
```

**O arquivo que você deve enviar para o cliente é**: `Vallim Tornearia Setup 1.0.0.exe`

---

## 💾 Instalação no Windows 8/10/11 (Cliente Final)

### Passo 1: Preparar o Sistema
1. **Instalar Visual C++ Redistributable** (se não estiver instalado):
   - Baixe: https://aka.ms/vs/17/release/vc_redist.x64.exe
   - Execute como administrador

### Passo 2: Instalar o Sistema
1. Baixe o arquivo `Vallim Tornearia Setup 1.0.0.exe`
2. **Clique com botão direito** → **"Executar como administrador"**
3. Se aparecer aviso do Windows Defender:
   - Clique em "Mais informações"
   - Clique em "Executar mesmo assim"
4. Siga o assistente de instalação:
   - Escolha o diretório de instalação
   - Marque "Criar atalho na área de trabalho"
   - Clique em "Instalar"

### Passo 3: Primeira Execução
1. Execute o programa pelo atalho da área de trabalho
2. **Aguarde 10-15 segundos** na primeira execução (o sistema está:)
   - Criando o banco de dados
   - Inicializando o servidor interno
   - Configurando os diretórios
3. A interface deve aparecer e funcionar normalmente

---

## 🔧 Solução de Problemas Comuns

### ❌ Problema: "O aplicativo não abre após instalação"

**Soluções em ordem de prioridade:**

1. **Execute como administrador**:
   - Botão direito no atalho → "Executar como administrador"

2. **Verifique o Windows Defender**:
   - Vá em Configurações → Atualização e Segurança → Segurança do Windows
   - Adicione uma exceção para a pasta de instalação

3. **Instale dependências**:
   ```
   Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe
   ```

4. **Verifique a porta 3500**:
   - Abra o Prompt de Comando como administrador
   - Execute: `netstat -ano | findstr :3500`
   - Se houver resultado, outro programa está usando a porta

### ❌ Problema: "Interface abre mas não carrega dados"

**Diagnóstico:**
1. Pressione `F12` para abrir o console
2. Procure por erros como:
   - `net::ERR_CONNECTION_REFUSED`
   - `Failed to fetch`

**Soluções:**
1. **Aguarde mais tempo**: O servidor pode demorar até 30 segundos para iniciar
2. **Reinicie o aplicativo**: Feche completamente e abra novamente
3. **Execute como administrador**
4. **Verifique antivírus**: Pode estar bloqueando o servidor interno

### ❌ Problema: "Erro ao gerar o .exe"

**Soluções:**

1. **Verificar Node.js**:
   ```bash
   node --version  # Deve ser v16.20.2
   ```

2. **Limpar e reinstalar**:
   ```bash
   npm run clean
   rm -rf node_modules package-lock.json
   npm install
   npm run build-win
   ```

3. **Verificar ícones**:
   - Confirme que `build/icon.ico` existe
   - Tamanho recomendado: 256x256px

4. **Espaço em disco**:
   - Libere pelo menos 3GB de espaço
   - O build temporário pode usar muito espaço

### ❌ Problema: "SQLite3 não compila"

**Soluções:**

1. **Instalar ferramentas de build** (Windows):
   ```bash
   npm install -g windows-build-tools
   ```

2. **Usar versão pré-compilada**:
   ```bash
   npm install sqlite3 --build-from-source=false
   ```

3. **Reinstalar dependências**:
   ```bash
   npm rebuild sqlite3
   ```

---

## 📁 Estrutura de Arquivos em Produção

### Arquivos do Sistema:
```
C:\Program Files\Vallim Tornearia\
├── resources/
│   ├── app/
│   │   ├── backend/          # API e servidor
│   │   ├── frontend/         # Interface
│   │   └── main.js          # Processo principal
│   └── app.asar             # Arquivos compactados
├── Vallim Tornearia.exe     # Executável principal
└── locales/                 # Idiomas
```

### Dados do Usuário:
```
C:\Users\[USUÁRIO]\AppData\Roaming\tornearia-vallim\
├── tornearia.db            # Banco de dados SQLite
├── backups/                # Backups manuais
└── logs/                   # Logs do sistema (se houver)
```

---

## 🔄 Sistema de Backup e Restauração

### Fazer Backup:
1. Clique no botão **"Backup"** na barra lateral esquerda
2. Escolha onde salvar o arquivo `.zip`
3. O backup inclui:
   - Banco de dados completo
   - Todas as configurações
   - Histórico de transações

### Restaurar Backup:
1. Clique no botão **"Restaurar"** na barra lateral
2. Selecione o arquivo `.zip` do backup
3. **O sistema reiniciará automaticamente**
4. Todos os dados serão substituídos pelos do backup

**⚠️ Importante**: Faça backup antes de atualizações ou mudanças importantes.

---

## 🎯 Funcionalidades do Sistema

### ✅ Gerenciamento de Clientes
- Cadastro, edição e exclusão
- Busca por nome
- Histórico de serviços por cliente
- Proteção contra exclusão (se houver serviços vinculados)

### ✅ Controle de Serviços
- Cadastro com preços e datas
- Status do serviço (Pendente/Andamento/Concluído)
- Status do pagamento (Pendente/Parcial/Pago)
- Métodos de pagamento (Dinheiro/Cartão/Boleto/Pix)
- Campo para nota fiscal e observações

### ✅ Gestão de Gastos/Materiais
- Registro de compras e materiais
- Controle de fornecedores
- Quantidades e valores
- Data de entrega e entregador
- Observações personalizadas

### ✅ Relatórios Financeiros
- Dashboard com gráficos interativos
- Análise mensal de faturamento
- Controle de gastos vs lucro
- Top 5 clientes por faturamento
- Filtros por ano e período
- Exportação para PDF

### ✅ Recursos Adicionais
- Interface responsiva e intuitiva
- Busca e filtros em todas as listas
- Paginação automática
- Sistema de alertas e notificações
- Funcionamento 100% offline

---

## 🔒 Segurança e Privacidade

- **100% Offline**: Nenhum dado é enviado para internet
- **Dados Locais**: Tudo armazenado no computador do usuário
- **Backup Manual**: Controle total sobre quando e onde fazer backup
- **Sem Telemetria**: O sistema não coleta dados de uso
- **Criptografia**: Banco de dados SQLite com proteção nativa

---

## 📊 Requisitos de Sistema

### Mínimos:
- **SO**: Windows 8/10/11 (32 ou 64 bits)
- **RAM**: 2GB
- **Disco**: 500MB livres
- **Processador**: Dual-core 1.6GHz

### Recomendados:
- **SO**: Windows 10/11 (64 bits)
- **RAM**: 4GB ou mais
- **Disco**: 1GB livres
- **Processador**: Quad-core 2.0GHz

---

## 🏗️ Tecnologias Utilizadas

### Backend:
- **Node.js 16.20.2**: Runtime JavaScript
- **Express.js**: Framework web
- **SQLite3**: Banco de dados local
- **Multer**: Upload de arquivos
- **Archiver**: Sistema de backup

### Frontend:
- **HTML5/CSS3**: Interface moderna
- **JavaScript ES6+**: Lógica do cliente
- **Chart.js**: Gráficos interativos
- **jsPDF**: Geração de relatórios

### Desktop:
- **Electron 22.3.27**: Framework desktop
- **electron-builder**: Empacotamento

---

## 📞 Suporte e Manutenção

### Para Desenvolvedores:
- **Logs de desenvolvimento**: Console do navegador (F12)
- **Logs de produção**: `%APPDATA%\tornearia-vallim\`
- **Debug**: Execute com `npm start` para ver logs detalhados

### Para Usuários Finais:
- **Manual integrado**: Ajuda dentro do sistema
- **Suporte técnico**: Via desenvolvedor
- **Atualizações**: Distribuídas via novo instalador

### Informações de Debug:
Se houver problemas, colete estas informações:
1. Versão do Windows
2. Mensagens de erro (screenshot)
3. Logs do console (F12)
4. Arquivo de log (se existir)

---

## 📝 Notas de Versão

### v1.0.0 (Atual)
- ✅ Sistema completo de CRUD para clientes, serviços e gastos
- ✅ Dashboard financeiro com gráficos interativos
- ✅ Sistema de backup e restauração
- ✅ Exportação de relatórios em PDF
- ✅ Interface responsiva e intuitiva
- ✅ Compatibilidade com Windows 8/10/11
- ✅ Funcionamento 100% offline
- ✅ Sistema de busca e filtros avançados

### Próximas Versões (Planejadas):
- 🔄 Sistema de anexo de imagens aos serviços
- 🔄 Autocomplete para clientes e fornecedores
- 🔄 Relatórios mais detalhados
- 🔄 Sistema de notificações

---

## 🤝 Desenvolvimento e Contribuição

Este projeto foi desenvolvido especificamente para a **Vallim Tornearia** como solução personalizada para digitalização de processos manuais.

**Desenvolvido por**: Matheus Madureira  
**Tecnologia**: Node.js + Electron  
**Licença**: MIT  
**Versão**: 1.0.0  
**Data**: 2025

---

## 📋 Checklist de Deploy

### Antes de Gerar o .exe:
- [ ] Node.js 16.20.2 instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Ícones na pasta `build/`
- [ ] Teste em desenvolvimento (`npm start`)
- [ ] Espaço em disco suficiente (3GB+)

### Antes de Enviar para Cliente:
- [ ] Arquivo .exe gerado com sucesso
- [ ] Teste de instalação em máquina limpa
- [ ] Verificação de funcionamento completo
- [ ] Backup dos dados atuais do cliente
- [ ] Instruções de instalação preparadas

### Pós-Instalação no Cliente:
- [ ] Sistema instalado como administrador
- [ ] Primeira execução bem-sucedida
- [ ] Teste de todas as funcionalidades
- [ ] Backup inicial criado
- [ ] Treinamento do usuário realizado

---

**🎯 Este README garante uma instalação e funcionamento perfeitos no Windows 8 do seu cliente!**