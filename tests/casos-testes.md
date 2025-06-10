## ✅ Casos de Teste da API

### 📌 Testes para `/clientes`
| ID   | Caso de Teste | Entrada | Resultado Esperado | Prioridade |
|------|--------------|---------|--------------------|------------|
| CT01 | Criar um cliente válido | `{ "nome": "João" }` | `201 Created` + Cliente cadastrado corretamente | 🔴 Crítico |
| CT02 | Criar cliente sem nome | `{ "nome": "" }` | `400 Bad Request` | 🔴 Crítico |
| CT03 | Criar cliente duplicado | `{ "nome": "João" }` (já existente) | `409 Conflict` | 🟡 Médio |
| CT04 | Listar todos os clientes | - | Retorna lista com todos os clientes cadastrados | 🟡 Médio |
| CT05 | Listar cliente inexistente | `GET /clientes/9999` | `404 Not Found` | 🟡 Médio |
| CT06 | Editar cliente existente | `{ "nome": "João Atualizado" }` | `200 OK` | 🟡 Médio |
| CT07 | Editar cliente inexistente | `{ "nome": "Novo Nome" }` (id inválido) | `404 Not Found` | 🟡 Médio |
| CT08 | Deletar cliente existente | `DELETE /clientes/1` | `200 OK` | 🟢 Baixo |
| CT09 | Deletar cliente inexistente | `DELETE /clientes/9999` | `404 Not Found` | 🟢 Baixo |


### 📌 Testes para `/pedidos`
| ID   | Caso de Teste | Entrada | Resultado Esperado | Prioridade |
|------|--------------|---------|--------------------|------------|
| CT10 | Criar pedido válido | `{ "clienteId": 1, "descricao": "Peça de ferro" }` | `201 Created` + Pedido cadastrado | 🔴 Crítico |
| CT11 | Criar pedido sem nomeMaterial | `{ "descricao": "Peça de ferro" }` | `400 Bad Request` | 🔴 Crítico |
| CT12 | Listar pedido sem nenhum ter sido cadastrado | - | `400 Bad Request` | 🟡 Médio |
| CT13 | Listar todos os pedidos | - | Retorna lista de pedidos cadastrados | 🟡 Médio |
| CT14 | Listar pedido inexistente | `GET /pedidos/9999` | `404 Not Found` | 🟡 Médio |
| CT15 | Editar pedido válido | `{ "descricao": "Nova peça" }` | `200 OK` + Pedido atualizado | 🟡 Médio |
| CT16 | Editar pedido inexistente | `{ "descricao": "Alteração" }` (id inválido) | `404 Not Found` | 🟡 Médio |
| CT17 | Deletar pedido válido | `DELETE /pedidos/1` | `200 OK` | 🟢 Baixo |
| CT18 | Deletar pedido inexistente | `DELETE /pedidos/9999` | `404 Not Found` | 🟢 Baixo |


### 📌 Testes para `/servicos`
| ID   | Caso de Teste | Entrada | Resultado Esperado | Prioridade |
|------|--------------|---------|--------------------|------------|
| CT19 | Criar serviço válido | `{ "nome": "Solda" }` | `201 Created` + Serviço cadastrado | 🔴 Crítico |
| CT20 | Criar serviço sem nome | `{ "nome": "" }` | `400 Bad Request` | 🔴 Crítico |
| CT21 | Criar serviço duplicado | `{ "nome": "Solda" }` (já existente) | `409 Conflict` | 🟡 Médio |
| CT22 | Listar todos os serviços | - | Retorna lista com serviços cadastrados | 🟡 Médio |
| CT23 | Listar serviço inexistente | `GET /servicos/9999` | `404 Not Found` | 🟡 Médio |
| CT24 | Editar serviço válido | `{ "nome": "Pintura" }` | `200 OK` | 🟡 Médio |
| CT25 | Editar serviço inexistente | `{ "nome": "Outra Alteração" }` (id inválido) | `404 Not Found` | 🟡 Médio |
| CT26 | Deletar serviço válido | `DELETE /servicos/1` | `200 OK` | 🟢 Baixo |
| CT27 | Deletar serviço inexistente | `DELETE /servicos/9999` | `404 Not Found` | 🟢 Baixo |


### 🔗 **Testes de Fluxo Completo**
| ID   | Caso de Teste | Entrada | Resultado Esperado | Prioridade |
|------|--------------|---------|--------------------|------------|
| CT28 | Criar cliente e vincular pedido | `{ "nome": "Cliente X" }` → `{ "clienteId": 1, "descricao": "Ordem de Serviço" }` | Cliente e pedido cadastrados corretamente | 🔴 Crítico |
| CT29 | Criar cliente e adicionar serviço | `{ "nome": "Cliente Y" }` → `{ "nome": "Torneamento" }` | Cliente e serviço cadastrados corretamente | 🔴 Crítico |
| CT30 | Criar pedido e associar serviço | `{ "clienteId": 1, "descricao": "Peça usinada" }` → `{ "nome": "Corte" }` | Pedido e serviço cadastrados corretamente | 🔴 Crítico |


## 📄 **Documentação Utilizada para Testes**

- **Critérios de Aceitação:**  
  - AC01 - O nome do cliente é obrigatório  
  - AC02 - O pedido deve estar associado a um cliente válido  
  - AC03 - O serviço deve ter um nome único  
  - AC04 - Apenas pedidos existentes podem ser editados  
  - AC05 - Apenas serviços existentes podem ser excluídos  
  - AC06 - O sistema deve retornar erro ao cadastrar itens duplicados  


## **Ferramentas Utilizadas**
- **Insomnia** → Para testes manuais de API  
- **Cypress** → Para automação de testes end-to-end (E2E)  


## Resultados (27/03/2025):
Legenda: 
- ✅: Passou
- ❌: Falhou / Bug

### Clientes
| ID   | Caso de Teste | Situação |
|------|-------------------------|-----|
| CT01 | Criar um cliente válido | ✅ |
| CT02 | Criar cliente sem nome | ✅ |
| CT03 | Criar cliente duplicado | ✅ |
| CT04 | Listar todos os clientes | ✅ | 
| CT05 | Listar cliente inexistente | ✅ |
| CT06 | Editar cliente existente | ✅ |
| CT07 | Editar cliente inexistente | ✅ |
| CT08 | Deletar cliente existente | ✅ |
| CT09 | Deletar cliente inexistente | ✅ |

## Pedidos
| ID   | Caso de Teste | Situação |
|------|--------------|----------|
| CT10 | Criar pedido válido | ✅ |
| CT11 | Criar pedido sem nomeMaterial | ✅ |
| CT12 | Listar pedido sem nenhum ter sido cadastrado | ✅ |
| CT13 | Listar todos os pedidos | ✅ |
| CT14 | Listar pedido inexistente | ✅ |
| CT15 | Editar pedido válido | ❌ |
| CT16 | Editar pedido inexistente | ✅ |
| CT17 | Deletar pedido válido | ✅ |
| CT18 | Deletar pedido inexistente | ✅ |
| extra | Criar pedido Inválido | ✅ |

## Servicos
| ID   | Caso de Teste |  Situação  |
|------|--------------|-------------|
| CT19 | Criar serviço válido | ✅ |
| CT20 | Criar serviço sem nome | ✅ |
| CT21 | Criar serviço duplicado | ✅ |
| CT22 | Listar todos os serviços | ✅ |
| CT23 | Listar serviço inexistente | ✅ |
| CT24 | Editar serviço válido | ❌ |
| CT25 | Editar serviço inexistente | ✅ |
| CT26 | Deletar serviço válido | ✅ |
| CT27 | Deletar serviço inexistente | ✅ |
| extra | Listar serviços sem ter nenhum cadastrado| ✅ |
| extra | Listar serviços com ID Inválido (Nan)| ✅ |
