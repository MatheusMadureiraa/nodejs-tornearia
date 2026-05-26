# Requisitos do Sistema

## Requisitos Funcionais (RF)

| ID | Requisito | Descrição |
|----|------------|------------|
| RF01 | Cadastro de Clientes | O sistema deve permitir cadastrar clientes contendo nome e demais informações opcionais. |
| RF02 | Listagem de Clientes | O sistema deve permitir visualizar todos os clientes cadastrados em formato de lista/tabela. |
| RF03 | Consulta de Cliente | O sistema deve permitir pesquisar clientes pelo nome. |
| RF04 | Atualização de Cliente | O sistema deve permitir editar informações de clientes cadastrados. |
| RF05 | Exclusão de Cliente | O sistema deve permitir remover clientes cadastrados. |
| RF06 | Cadastro de Serviços | O sistema deve permitir cadastrar serviços com nome do serviço, cliente e preço obrigatórios. |
| RF07 | Associação Automática Cliente-Serviço | O sistema deve criar automaticamente um cliente caso o nome informado no serviço não exista. |
| RF08 | Listagem de Serviços | O sistema deve permitir visualizar todos os serviços cadastrados. |
| RF09 | Consulta de Serviços | O sistema deve permitir pesquisar serviços pelo nome. |
| RF10 | Visualização Detalhada de Serviço | O sistema deve permitir visualizar todas as informações completas de um serviço. |
| RF11 | Atualização de Serviços | O sistema deve permitir editar serviços cadastrados. |
| RF12 | Exclusão de Serviços | O sistema deve permitir excluir serviços cadastrados. |
| RF13 | Cadastro de Pedidos | O sistema deve permitir cadastrar pedidos de materiais. |
| RF14 | Geração Automática de Data | O sistema deve registrar automaticamente a data atual caso nenhuma data seja preenchida. |
| RF15 | Listagem de Pedidos | O sistema deve permitir visualizar todos os pedidos cadastrados. |
| RF16 | Consulta de Pedidos | O sistema deve permitir pesquisar pedidos pelo nome do material. |
| RF17 | Visualização Detalhada de Pedido | O sistema deve permitir visualizar todos os atributos de um pedido. |
| RF18 | Atualização de Pedidos | O sistema deve permitir editar pedidos cadastrados. |
| RF19 | Exclusão de Pedidos | O sistema deve permitir remover pedidos cadastrados. |
| RF20 | Relatórios Financeiros | O sistema deve permitir gerar e visualizar relatórios financeiros. |
| RF21 | Exportação de Relatório em PDF | O sistema deve permitir exportar relatórios financeiros em formato PDF. |
| RF22 | Navegação via Sidebar | O sistema deve possuir menu lateral para navegação entre módulos. |
| RF23 | Funcionamento Offline | O sistema deve funcionar sem necessidade de internet. |

---

## Requisitos Não Funcionais (RNF)

| ID | Requisito | Descrição |
|----|------------|------------|
| RNF01 | Aplicação Desktop | O sistema deve executar como aplicação desktop utilizando Electron. |
| RNF02 | Banco de Dados Local | O sistema deve utilizar SQLite como banco de dados local. |
| RNF03 | Persistência de Dados | Os dados devem permanecer salvos após fechamento da aplicação. |
| RNF04 | Desempenho | Operações de CRUD devem possuir resposta inferior a 3 segundos em uso normal. |
| RNF05 | Usabilidade | A interface deve ser simples, intuitiva e fácil de utilizar. |
| RNF06 | Validação de Dados | O sistema deve validar campos obrigatórios antes do envio dos formulários. |
| RNF07 | Compatibilidade | O sistema deve executar em ambientes compatíveis com Electron. |
| RNF08 | Segurança de Entrada | O backend deve validar dados recebidos antes da persistência no banco. |
| RNF09 | Organização Modular | O projeto deve possuir separação entre frontend, backend, banco e testes. |
| RNF10 | Manutenibilidade | O código deve possuir estrutura organizada para facilitar manutenção futura. |
| RNF11 | Tratamento de Erros | O sistema deve retornar mensagens claras para erros internos e de validação. |
| RNF12 | Armazenamento de Imagens | O sistema deve armazenar imagens utilizando formato compatível com SQLite (BLOB). |
| RNF13 | Responsividade da Interface | Componentes visuais devem responder adequadamente às interações do usuário. |
| RNF14 | Inicialização do Sistema | O sistema deve carregar corretamente seus componentes ao iniciar. |
| RNF15 | Disponibilidade Local | O sistema deve permanecer funcional sem servidores externos ou conexão online. |