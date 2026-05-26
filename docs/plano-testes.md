# Plano de Testes - Tornearia App


## Objetivos
- Garantir a funcionalidade das rotas da API conforme os requisitos do sistema.
- Verificar a integração entre as camadas frontend e backend.
- Assegurar que os fluxos principais (CRUD de clientes, pedidos e serviços) funcionam corretamente.
- Validar a interface do usuário e experiência do usuário (UX).
- Garantir que a API responde corretamente a cenários válidos e inválidos.


## Escopo
Os testes cobrirão os seguintes módulos:
- **Clientes**: CRUD completo
- **Pedidos**: CRUD completo
- **Serviços**: CRUD completo

Serão realizados testes nos seguintes níveis:
1. **Testes Manuais** (Usando **Insomnia**)
2. **Testes Automatizados** (Usando **Playwright**)


## Estratégia de Testes

| Tipo de Teste | Ferramenta | Descrição |
|--------------|-----------|------------|
| **Testes de API** | Insomnia e Playwright | Validação das rotas CRUD de clientes, pedidos e serviços |
| **Testes de Interface** | Manuais | Validação da interface e usabilidade |


## Ferramentas Utilizadas
- [Insomnia](https://insomnia.rest/) → Testes manuais da API
- [Playwright](https://playwright.dev/) → Testes automatizados
- SQLite → Banco de dados do sistema
- Electron → Framework do app desktop


## Matriz de Priorização de Testes

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


## Documentação usada para Testes
Os casos de teste foram definidos com base nos seguintes documentos:
- **Requisitos do Sistema**

## Critérios de Aceitação dos Testes
Os testes serão considerados **aprovados** se:
- Todas as rotas CRUD funcionarem corretamente via Insomnia.
- Fluxos principais (clientes, pedidos e serviços) estiverem funcionando via Playwright.
- Nenhum erro crítico for encontrado nos testes automatizados.


## Cronograma de Execução
| Atividade | Responsável | Ferramenta | Prazo |
|-----------|------------|------------|--------|
| Configurar ambiente de testes | Dev/QA | - | 1 dia |
| Testes de API (Insomnia) | QA | Insomnia | 1 dia |
| Tests automatizados API | QA | Playwright | 2 dias |