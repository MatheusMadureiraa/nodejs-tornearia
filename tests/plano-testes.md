# Plano de Testes - Tornearia App


## 🎯 Objetivos
- Garantir a funcionalidade das rotas da API conforme os requisitos do sistema.
- Verificar a integração entre as camadas frontend e backend.
- Assegurar que os fluxos principais (CRUD de clientes, pedidos e serviços) funcionam corretamente.
- Validar a interface do usuário e experiência do usuário (UX).
- Garantir que a API responde corretamente a cenários válidos e inválidos.


## 🔍 Escopo
Os testes cobrirão os seguintes módulos:
- **Clientes**: CRUD completo
- **Pedidos**: CRUD completo
- **Serviços**: CRUD completo

Serão realizados testes nos seguintes níveis:
1. **Testes Manuais** (Usando **Insomnia**)
2. **Testes Automatizados** (Usando **Cypress** para E2E)


## 🚀 Estratégia de Testes

| Tipo de Teste | Ferramenta | Descrição |
|--------------|-----------|------------|
| **Testes de API** | Insomnia | Validação das rotas CRUD de clientes, pedidos e serviços |
| **Testes Funcionais** | Cypress | Automação de fluxos principais |
| **Testes de Interface** | Cypress | Validação da interface e usabilidade |
| **Testes de Regressão** | Cypress | Execução automática antes de cada entrega |


## 🛠️ Ferramentas Utilizadas
- [Insomnia](https://insomnia.rest/) → Testes manuais da API
- [Cypress](https://www.cypress.io/) → Testes automatizados
- SQLite → Banco de dados do sistema
- Electron → Framework do app desktop


## 📊 Matriz de Priorização de Testes

| Funcionalidade                  | Rota            | Impacto | Probabilidade de Falha | Prioridade |
|----------------------------------|----------------|--------|-----------------|------------|
| Criar Cliente                    | `/clientes`     | Alto   | Alto            | 🔴 Crítico |
| Listar Clientes                   | `/clientes`     | Alto   | Médio           | 🟡 Médio |
| Editar Cliente                    | `/clientes/:id` | Médio  | Médio           | 🟡 Médio |
| Deletar Cliente                   | `/clientes/:id` | Médio  | Baixo           | 🟢 Baixo |
| Criar Pedido                      | `/pedidos`      | Alto   | Alto            | 🔴 Crítico |
| Listar Pedidos                     | `/pedidos`      | Alto   | Médio           | 🟡 Médio |
| Editar Pedido                      | `/pedidos/:id`  | Médio  | Médio           | 🟡 Médio |
| Deletar Pedido                     | `/pedidos/:id`  | Médio  | Baixo           | 🟢 Baixo |
| Criar Serviço                      | `/servicos`     | Alto   | Alto            | 🔴 Crítico |
| Listar Serviços                    | `/servicos`     | Alto   | Médio           | 🟡 Médio |
| Editar Serviço                     | `/servicos/:id` | Médio  | Médio           | 🟡 Médio |
| Deletar Serviço                    | `/servicos/:id` | Médio  | Baixo           | 🟢 Baixo |
| Fluxo Completo (Cliente + Pedido)   | `/clientes` + `/pedidos` | Alto | Alto | 🔴 Crítico |
| Fluxo Completo (Cliente + Serviço)  | `/clientes` + `/servicos` | Alto | Alto | 🔴 Crítico |

Legenda:
- 🔴 **Crítico** → Teste essencial, precisa ser executado sempre.
- 🟡 **Médio** → Teste importante, mas pode ser rodado em ciclos específicos.
- 🟢 **Baixo** → Teste de menor impacto, pode ser testado com menor frequência.



## 📑 Documentação usada para Testes
Os casos de teste foram definidos com base nos seguintes documentos:
- **Requisitos do Sistema**
- **Critérios de Aceitação (ACs)** para cada funcionalidade


## ✅ Critérios de Aceitação dos Testes
Os testes serão considerados **aprovados** se:
- Todas as rotas CRUD funcionarem corretamente via Insomnia.
- Fluxos principais (clientes, pedidos e serviços) estiverem funcionando via Cypress.
- Nenhum erro crítico for encontrado nos testes automatizados.


## 📆 Cronograma de Execução

| Atividade | Responsável | Ferramenta | Prazo |
|-----------|------------|------------|--------|
| Configurar ambiente de testes | Dev/QA | - | 1 dia |
| Testes de API (Insomnia) | QA | Insomnia | 1 dia |
| Automação de Fluxos E2E | QA | Cypress | 2 dias |
| Testes de Interface | QA | Cypress | 1 dia |
| Ajustes e Reexecução | Dev/QA | Cypress | 1 dia |

Total: **6 dias** - que serão divididos conforme desenvolvimento de novas funcionalidades e interfaces.


## 📝 Conclusão
Este plano define a estratégia de testes do **Tornearia App**, garantindo que todas as funcionalidades essenciais sejam testadas. Com a combinação de **Insomnia** e **Cypress**, conseguiremos validar a API e a interface do usuário de forma eficiente.
