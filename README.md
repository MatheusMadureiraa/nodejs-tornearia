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

## 📋 Pré-requisitos

### Versões Recomendadas
- **Node.js**: 16.x ou superior (recomendado: 18.x)
- **npm**: 8.x ou superior
- **Sistema Operacional**: Windows 8/10/11, macOS, Linux

### Verificar Versões Instaladas
```bash
node --version
npm --version
```

### Instalar Node.js (se necessário)
1. Baixe o Node.js em: https://nodejs.org/
2. Instale a versão LTS (Long Term Support)
3. Reinicie o terminal após a instalação

---

## 🚀 Como Executar em Desenvolvimento

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/tornearia-vallim.git

# 2. Acesse a pasta do projeto
cd tornearia-vallim

# 3. Instale as dependências
npm install

# 4. Execute o sistema em modo desenvolvimento
npm start
```

O aplicativo será aberto automaticamente em modo desktop.

---

## 📦 Como Gerar o Executável (.exe)

### Passo 1: Preparar o Ambiente
```bash
# Certifique-se de que todas as dependências estão instaladas
npm install

# Instale as dependências específicas do Electron
npm run postinstall
```

### Passo 2: Criar os Ícones (Obrigatório)
Crie a pasta `build` na raiz do projeto e adicione os ícones:

```
build/
├── icon.ico    (para Windows - 256x256px)
├── icon.png    (para Linux - 512x512px)
└── icon.icns   (para macOS - 512x512px)
```

**Importante**: Sem os ícones, o build pode falhar. Use o logo da empresa convertido para estes formatos.

### Passo 3: Gerar o Executável

#### Para Windows (recomendado para seu cliente):
```bash
npm run build-win
```

#### Para todas as plataformas:
```bash
npm run build
```

#### Para plataformas específicas:
```bash
npm run build-mac    # macOS
npm run build-linux  # Linux
```

### Passo 4: Localizar o Arquivo Gerado
Após o build, os arquivos estarão em:
```
dist/
├── Vallim Tornearia Setup.exe  (Instalador para Windows)
├── win-unpacked/               (Versão portátil)
└── latest.yml                  (Metadados)
```

---

## 💾 Instalação para o Cliente Final

### Windows 8/10/11:
1. Baixe o arquivo `Vallim Tornearia Setup.exe`
2. Execute o instalador como administrador
3. Siga o assistente de instalação
4. O aplicativo será instalado e criará atalhos na área de trabalho e menu iniciar

### Primeira Execução:
- O sistema criará automaticamente o banco de dados na pasta do usuário
- Todos os dados ficam armazenados localmente
- Não é necessária conexão com internet

---

## 🔧 Solução de Problemas

### Problema: "O aplicativo não abre após a instalação"
**Soluções:**
1. Execute como administrador
2. Verifique se o Windows Defender não está bloqueando
3. Instale o Visual C++ Redistributable: https://aka.ms/vs/17/release/vc_redist.x64.exe

### Problema: "Erro ao gerar o .exe"
**Soluções:**
1. Verifique se os ícones estão na pasta `build/`
2. Execute: `npm cache clean --force`
3. Delete `node_modules` e execute `npm install` novamente
4. Certifique-se de ter espaço suficiente em disco (mínimo 2GB)

### Problema: "Backend não inicia"
**Soluções:**
1. Verifique se a porta 3500 não está em uso
2. Execute o aplicativo como administrador
3. Verifique os logs no console (F12 em desenvolvimento)

### Problema: "Banco de dados não encontrado"
**Soluções:**
1. O banco é criado automaticamente na primeira execução
2. Localização: `C:\Users\[USUÁRIO]\AppData\Roaming\tornearia-vallim\`
3. Para resetar: delete a pasta acima e execute novamente

---

## 📁 Estrutura de Arquivos em Produção

```
Vallim Tornearia/
├── resources/
│   ├── app/
│   │   ├── backend/          # API e lógica de negócio
│   │   ├── frontend/         # Interface do usuário
│   │   └── main.js          # Processo principal do Electron
│   └── app.asar             # Arquivos compactados
├── Vallim Tornearia.exe     # Executável principal
└── locales/                 # Arquivos de localização
```

### Dados do Usuário:
```
C:\Users\[USUÁRIO]\AppData\Roaming\tornearia-vallim\
├── tornearia.db            # Banco de dados SQLite
├── backups/                # Backups automáticos
└── logs/                   # Logs do sistema
```

---

## 🔄 Sistema de Backup

### Backup Automático:
- Clique no botão "Backup" na barra lateral
- Arquivo será salvo como `backup-tornearia-YYYY-MM-DD.zip`
- Inclui banco de dados e configurações

### Restaurar Backup:
- Clique no botão "Restaurar" na barra lateral
- Selecione o arquivo `.zip` do backup
- O sistema reiniciará automaticamente após a restauração

---

## 🎯 Funcionalidades Principais

### ✅ Gerenciamento de Clientes
- Cadastro, edição e exclusão
- Busca e filtros
- Histórico de serviços

### ✅ Controle de Serviços
- Cadastro com preços e status
- Controle de pagamentos
- Anexo de imagens (planejado)

### ✅ Gestão de Gastos
- Registro de materiais e fornecedores
- Controle de quantidades e valores
- Histórico completo

### ✅ Relatórios Financeiros
- Dashboard com gráficos
- Análise de faturamento e lucro
- Exportação para PDF
- Top clientes por faturamento

---

## 🔒 Segurança e Privacidade

- **100% Offline**: Nenhum dado é enviado para internet
- **Dados Locais**: Tudo fica armazenado no computador do usuário
- **Backup Manual**: Controle total sobre quando e onde fazer backup
- **Sem Telemetria**: O sistema não coleta dados de uso

---

## 📞 Suporte Técnico

### Para Desenvolvedores:
- Logs de desenvolvimento: Console do navegador (F12)
- Logs de produção: `%APPDATA%\tornearia-vallim\logs\`

### Para Usuários Finais:
- Manual do usuário incluído no sistema
- Suporte via desenvolvedor

---

## 🏗️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite3
- **Desktop**: Electron
- **Gráficos**: Chart.js
- **Relatórios**: jsPDF

---

## 📝 Notas de Versão

### v1.0.0
- ✅ Sistema completo de CRUD para clientes, serviços e gastos
- ✅ Dashboard financeiro com gráficos
- ✅ Sistema de backup e restauração
- ✅ Exportação de relatórios em PDF
- ✅ Interface responsiva e intuitiva
- ✅ Compatibilidade com Windows 8/10/11

---

## 🤝 Contribuição

Este projeto foi desenvolvido especificamente para a Vallim Tornearia. Para sugestões ou melhorias, entre em contato com o desenvolvedor.

---

## 📄 Licença

MIT License - Veja o arquivo LICENSE para detalhes.

---

**Desenvolvido por**: Matheus Madureira  
**Versão**: 1.0.0  
**Data**: 2025