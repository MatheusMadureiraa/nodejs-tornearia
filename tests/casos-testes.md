## ✅ Casos de Teste da API

### Testes para `/clientes`
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


### Testes para `/pedidos`
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


### Testes para `/servicos`
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


## 📄 **Documentação Utilizada para Testes da API**

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

## ✅ Casos de Teste Interface (Manual)

Este documento detalha os casos de teste focados em cenários de exceção, validação de dados e robustez do sistema.

| ID    | Módulo                      | Descrição do Teste                                                                             | Passo a Passo                                                                                                                                                                                          | Resultado Esperado                                                                                                       | Resultado Obtido | Status |
| :---- | :-------------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- | :--------------- | :----- |
| **CT01** | Adicionar Serviço           | Tentar cadastrar um serviço com o campo "Preço" contendo texto.                                | 1. Ir para "Adicionar Serviço".<br>2. Preencher os outros campos.<br>3. No campo "Preço", digitar "abc".<br>4. Clicar em "Cadastrar Serviço".                                                                  | O sistema deve exibir uma mensagem de erro clara (ex: "Valor inválido para o preço") e não deve salvar o serviço.           |                  |        |
| **CT02** | Adicionar Serviço           | Tentar cadastrar um serviço com um cliente que não existe no banco de dados.                    | 1. Ir para "Adicionar Serviço".<br>2. No campo "Nome do Cliente", digitar um nome completamente novo.<br>3. Preencher o resto e salvar.                                                                     | O sistema deve perguntar se o usuário deseja cadastrar este novo cliente ou exibir um erro informando que o cliente não existe. |                  |        |
| **CT03** | Adicionar Gasto             | Tentar cadastrar um gasto com o campo "Quantidade" ou "Valor" negativo.                         | 1. Ir para "Adicionar Gasto".<br>2. Preencher os campos.<br>3. Inserir "-10" no campo "Quantidade" ou "Valor".<br>4. Clicar em "Cadastrar Pedido".                                                               | O sistema deve impedir o salvamento e mostrar um erro (ex: "Valores não podem ser negativos.").                          |                  |        |
| **CT04** | Adicionar Gasto             | Deixar campos obrigatórios (como Nome ou Valor) em branco.                                     | 1. Ir para "Adicionar Gasto".<br>2. Deixar o campo "Nome" vazio.<br>3. Tentar salvar.                                                                                                                         | Uma mensagem de erro indicando qual campo obrigatório precisa ser preenchido deve ser exibida.                               |                  |        |
| **CT05** | Editar Serviço (Modal)      | Tentar salvar o modal de edição de serviço após apagar o conteúdo de um campo obrigatório.        | 1. Na lista de serviços, clicar em "..." e "Editar".<br>2. No modal, apagar o "Nome do Serviço".<br>3. Clicar em "Salvar Alterações".                                                                    | O sistema deve exibir um erro dentro do modal e não deve fechá-lo nem salvar as alterações.                                   |                  |        |
| **CT06** | Editar Serviço (Modal)      | Inserir um número inválido para "Status Serviço" ou "Status Pagamento".                        | 1. Na lista de serviços, clicar em "..." e "Editar".<br>2. No campo "Status Serviço", digitar "99".<br>3. Clicar em "Salvar Alterações".                                                                    | O sistema deve validar a entrada e exibir um erro, pois o status "99" não existe. Idealmente, este campo seria um dropdown. |                  |        |
| **CT07** | Listagens (Geral)         | Testar a busca com caracteres especiais (Ç, %, _, ').                                        | 1. Ir para "Lista de Serviços".<br>2. Na barra de busca, digitar "%" ou "Ç".<br>3. Observar o resultado.                                                                                               | A busca deve funcionar corretamente, sem quebrar a aplicação (especialmente com ' e %).                                     |                  |        |
| **CT08** | Listagens (Geral)         | Tentar ordenar uma coluna que não deveria ser ordenável ou está vazia.                           | 1. Ir para "Lista de Clientes".<br>2. No dropdown "ORDENAR POR", verificar as opções.<br>3. Selecionar cada uma e ver se a ordenação funciona.                                                               | A ordenação deve ser aplicada corretamente. Se houver uma opção inválida, ela não deve quebrar a lista.                    |                  |        |
| **CT09** | Listagens (Geral)         | Navegar para uma página de paginação que não existe (via manipulação, se possível).              | 1. Ir para uma lista com múltiplas páginas.<br>2. Observar o comportamento dos botões "Anterior" e "Próximo" na primeira e última página.                                                                 | O botão "Anterior" deve estar desabilitado na página 1. O botão "Próximo" deve estar desabilitado na última página.          |                  |        |
| **CT10** | Deleção                     | Tentar deletar um cliente que possui serviços associados.                                      | 1. Ir para "Lista de Clientes".<br>2. Tentar deletar um cliente que tem pelo menos um serviço na "Lista de Serviços".                                                                                        | O sistema deve exibir um alerta (ex: "Este cliente não pode ser excluído pois possui N serviços vinculados.") e impedir a exclusão. |                  |        |
| **CT11** | Deleção                     | Tentar deletar um gasto e verificar o impacto no relatório financeiro.                           | 1. Anotar o "Total de Gastos" no relatório.<br>2. Ir para "Lista de Gastos" e excluir um item.<br>3. Voltar ao relatório.                                                                                  | O valor do "Total de Gastos" e do "Lucro" deve ser atualizado corretamente para refletir a exclusão.                       |                  |        |
| **CT12** | Relatórios                  | Gerar um relatório para um período sem dados.                                                  | 1. Ir para "Relatório Gerencial".<br>2. Selecionar um ano no filtro onde não houve nenhuma atividade.<br>3. Observar o gráfico e os KPIs.                                                              | Os gráficos devem aparecer vazios com uma mensagem "Nenhum dado para exibir". Os KPIs devem mostrar R$ 0,00, sem quebrar.    |                  |        |
| **CT13** | Relatórios                  | Verificar o cálculo do lucro com um serviço que teve prejuízo (custo > preço).                 | 1. Cadastrar um serviço com preço R$ 100.<br>2. Lançar um gasto de R$ 150 associado a ele (se o app permitir).<br>3. Verificar o KPI "Lucro" no relatório.                                                   | O lucro deve ser exibido como um valor negativo (ex: -R$ 50,00) e calculado corretamente.                                    |                  |        |
| **CT14** | Relatórios                  | Exportar relatório (PDF) com dados e sem dados.                                                | 1. Ir para "Relatório Gerencial".<br>2. Clicar em "Exportar p/ PDF".<br>3. Fazer o mesmo em um período sem dados.                                                                                          | Um arquivo PDF deve ser gerado com sucesso em ambos os casos. O PDF vazio deve ter um layout limpo com uma mensagem apropriada. |                  |        |
| **CT15** | Dashboards (Pág. Inicial)   | Verificar a atualização dos gráficos de pizza após mudar o status de um serviço.                 | 1. Anotar os números no dashboard "Status dos Serviços".<br>2. Mudar um serviço de "Pendente" para "Concluído".<br>3. Voltar à página inicial.                                                             | O gráfico de pizza e os contadores devem ser atualizados em tempo real ou após um refresh da página.                        |                  |        |
| **CT16** | Geral / Usabilidade         | Inserir um texto extremamente longo em campos de observação ou nome.                            | 1. Em "Adicionar Serviço", no campo "Observação", colar 5000 caracteres.<br>2. Salvar.<br>3. Verificar como o texto é exibido na lista e no modal de edição.                                               | O sistema não deve quebrar. O texto deve ser truncado com "..." na lista e exibido corretamente com uma barra de rolagem no modal. |                  |        |
| **CT17** | Geral / Usabilidade         | Clicar rapidamente e repetidamente no botão "Cadastrar Serviço".                               | 1. Preencher o formulário de serviço.<br>2. Clicar no botão "Cadastrar Serviço" 5 vezes em um segundo.                                                                                                    | Apenas um serviço deve ser criado. O botão deve ser desabilitado após o primeiro clique até que a operação termine.           |                  |        |
| **CT18** | Geral / Usabilidade         | Testar a função de Backup.                                                                     | 1. Clicar no botão "Backup" no menu.<br>2. Verificar se um arquivo é gerado.<br>3. Se houver restauração, tentar restaurar a partir de um arquivo inválido.                                             | O backup deve gerar um arquivo legível. A restauração a partir de um arquivo inválido deve falhar com uma mensagem de erro clara. |                  |        |
| **CT19** | Geral / Usabilidade         | Alterar a escala de exibição do sistema operacional (ex: 125% no Windows).                     | 1. Mudar a escala do display no SO.<br>2. Abrir o aplicativo.                                                                                                                                              | O layout não deve quebrar. Os textos e componentes devem se redimensionar de forma proporcional.                               |                  |        |
| **CT20** | Adicionar Serviço           | Tentar cadastrar um serviço com data no formato inválido.                                       | 1. Ir para "Adicionar Serviço".<br>2. No campo de data, digitar "32/01/2025" ou "abc".<br>3. Tentar salvar.                                                                                               | O sistema deve validar a data e exibir uma mensagem de erro.                                                                   |                  |        |
| **CT21** | Editar Pedido (Modal)       | Clicar em "Cancelar" após fazer alterações.                                                    | 1. Abrir o modal de edição de um gasto.<br>2. Alterar o valor.<br>3. Clicar em "Cancelar".<br>4. Reabrir o mesmo modal.                                                                                         | As alterações não devem ser salvas. O valor original deve ser mantido.                                                       |                  |        |
| **CT22** | Listagens (Serviços)        | Filtrar por status e pagamento ao mesmo tempo (se possível).                                    | 1. Ir para a lista de serviços.<br>2. Tentar aplicar múltiplos filtros (ex: Status = Concluído E Pagamento = Pago).                                                                                        | A lista deve exibir apenas os registros que atendem a AMBOS os critérios de filtro.                                          |                  |        |
| **CT23** | Relatórios                  | Verificar o "Top 5 Clientes" quando há menos de 5 clientes.                                    | 1. Excluir clientes até que restem apenas 3.<br>2. Ir para a página inicial.<br>3. Observar o gráfico "Top 5 Clientes por Faturamento".                                                                  | O gráfico deve exibir apenas os 3 clientes existentes, sem quebrar.                                                            |                  |        |
| **CT24** | Relatórios                  | Verificar o "Top 5 Clientes" quando há um empate no faturamento.                               | 1. Criar serviços para que dois clientes diferentes tenham exatamente o mesmo faturamento.<br>2. Observar a ordem no gráfico "Top 5 Clientes".                                                            | O sistema deve ter um critério de desempate claro (ex: ordem alfabética) ou exibir ambos os clientes corretamente.              |                  |        |
| **CT25**| Adicionar/Editar Imagem     | Tentar anexar um arquivo que não é uma imagem (ex: .txt, .pdf) no campo de imagem.               | 1. Ir para "Adicionar/Editar Serviço".<br>2. Clicar em "Selecionar imagem".<br>3. Tentar selecionar um arquivo `documento.txt`.                                                                         | A caixa de diálogo de arquivo deve filtrar para aceitar apenas formatos de imagem (jpg, png, etc.), ou exibir um erro se um tipo inválido for selecionado. |                  |        |
| **CT26**| Adicionar/Editar Imagem     | Anexar uma imagem com um nome de arquivo muito longo ou com caracteres especiais.                | 1. Renomear uma imagem para `teste'ç%&().jpg`.<br>2. Tentar anexá-la a um serviço.                                                                                                                   | O sistema deve conseguir salvar e exibir a imagem corretamente, sem erros.                                                   |                  |        |
| **CT27**| Adicionar/Editar Imagem     | Anexar uma imagem muito grande (ex: 20 MB).                                                    | 1. Tentar anexar uma imagem de alta resolução e tamanho de arquivo grande.                                                                                                                               | O sistema deve lidar com a imagem (ex: comprimindo-a ou definindo um limite de tamanho) ou exibir uma mensagem de erro clara informando que o arquivo é muito grande. |                  |        |
| **CT28**| Adicionar/Editar Imagem     | Excluir um serviço que tem uma imagem anexada.                                                   | 1. Anexar uma imagem a um serviço.<br>2. Excluir o serviço.                                                                                                                                                 | O serviço deve ser excluído, e o arquivo de imagem associado também deve ser removido do armazenamento para evitar arquivos órfãos. |                  |        |
| **CT29**| Listagens (Geral)         | Realizar uma busca vazia.                                                                      | 1. Ir para qualquer tela de listagem (Clientes, Serviços, etc).<br>2. Clicar na barra de busca sem digitar nada e pressionar Enter.                                                                       | A lista deve permanecer inalterada ou recarregar todos os itens, sem erros.                                                     |                  |        |
| **CT30**| Listagens (Geral)         | Realizar uma busca por um termo que não retorna nenhum resultado.                                | 1. Ir para a lista de serviços.<br>2. Buscar por "TERMO_QUE_NAO_EXISTE_12345".                                                                                                                           | A lista deve ficar vazia e exibir uma mensagem amigável, como "Nenhum resultado encontrado para sua busca.".                    |                  |        |
| **CT31**| Formulários (Geral)         | Usar a tecla TAB para navegar por todos os campos de um formulário.                              | 1. Abrir o formulário "Adicionar Serviço".<br>2. Pressionar a tecla TAB repetidamente.                                                                                                                  | O foco deve passar por todos os campos interativos (inputs, selects, botões) em uma ordem lógica e previsível.                  |                  |        |
| **CT32**| Formulários (Geral)         | Tentar submeter um formulário usando a tecla Enter.                                              | 1. Preencher o formulário "Adicionar Gasto".<br>2. Com o cursor em um dos últimos campos de texto, pressionar Enter.                                                                                      | A ação padrão esperada é a submissão do formulário (equivalente a clicar em "Cadastrar Pedido").                                |                  |        |
| **CT33**| Relatórios                  | Verificar como o relatório lida com dados do ano atual vs anos anteriores.                       | 1. Ter dados de 2024 e 2025.<br>2. No Relatório Gerencial, alternar o filtro de ano entre 2024 e 2025.                                                                                                 | Os KPIs e o gráfico devem ser atualizados instantaneamente para refletir os dados apenas do ano selecionado.                    |                  |        |
| **CT34**| Editar Serviço (Modal)      | Tentar alterar o status de um serviço para "Concluído" sem que ele esteja "Pago".                | 1. Editar um serviço com status de pagamento "Pendente".<br>2. Tentar mudar o status do serviço para "Concluído".                                                                                         | O sistema deve permitir esta ação, pois um serviço pode ser concluído antes de ser pago. (Este é um teste de regra de negócio). |                  |        |
| **CT35**| Deleção                     | Confirmar a ação de exclusão.                                                                  | 1. Clicar para excluir um item (serviço, gasto, cliente).                                                                                                                                              | O sistema deve exibir um diálogo de confirmação (ex: "Você tem certeza que deseja excluir este item?") antes de deletar permanentemente. |                  |        |
| **CT36**| Geral / Usabilidade         | Testar a responsividade da janela.                                                               | 1. Redimensionar a janela do aplicativo para ser muito estreita ou muito larga.<br>2. Maximizar e restaurar a janela.                                                                                    | Os componentes da interface devem se reajustar de forma fluida, sem sobreposição, quebra de layout ou desaparecimento de elementos. |                  |        |
| **CT37**| Dashboards (Pág. Inicial)   | Verificar o filtro de período ("Últimos 30 dias").                                             | 1. Criar um serviço com data de hoje.<br>2. Criar um serviço com data de 40 dias atrás.<br>3. Observar os dashboards "Status dos Serviços" e "Status dos Pagamentos".                                       | Apenas o serviço criado hoje deve ser contabilizado nos gráficos e contadores do dashboard.                                     |                  |        |
| **CT38**| Adicionar Gasto             | Adicionar um gasto com valor zero.                                                               | 1. Ir para "Adicionar Gasto".<br>2. Inserir "0" no campo "Valor".<br>3. Tentar salvar.                                                                                                                        | O sistema pode permitir ou não (regra de negócio), mas deve ser consistente. Se não permitir, deve mostrar um erro claro.      |                  |        |
| **CT39**| Listagens (Serviços)        | Verificar se o status "Devendo (parci)" está correto.                                          | 1. Criar um serviço.<br>2. Marcar o pagamento como parcial (se houver essa funcionalidade de lançamento parcial).                                                                                       | O status na lista deve refletir corretamente como "Devendo (parci)" com a cor amarela.                                          |                  |        |
| **CT40**| Geral / Usabilidade         | Tentar fechar o aplicativo enquanto um modal está aberto.                                        | 1. Abrir o modal "Editar Serviço".<br>2. Tentar fechar a janela principal do aplicativo (pelo 'X').                                                                                                       | O aplicativo não deve fechar ou deve perguntar ao usuário se ele deseja descartar as alterações não salvas no modal.              |                  |        |
| **CT41**| Cliente                     | Tentar cadastrar dois clientes com o mesmo nome, mas CNPJ/CPF diferentes.                       | 1. Cadastrar "Empresa A" com CNPJ "1".<br>2. Cadastrar "Empresa A" com CNPJ "2".                                                                                                                          | O sistema deve permitir, pois são entidades diferentes apesar do nome igual.                                                    |                  |        |
| **CT42**| Cliente                     | Tentar cadastrar um cliente com um nome composto ou com números.                                | 1. Cadastrar um cliente com o nome "José da Silva 2".                                                                                                                                                   | O sistema deve aceitar e exibir o nome corretamente em todas as listas e relatórios.                                           |                  |        |
| **CT43**| Gastos                      | Cadastrar um gasto sem fornecedor.                                                               | 1. Ir para "Adicionar Gasto".<br>2. Deixar o campo "Fornecedor" em branco.<br>3. Salvar o gasto.                                                                                                            | O sistema deve permitir (tratando como "Não informado"), já que pode ser um gasto avulso.                                      |                  |        |
| **CT44**| Relatórios                  | Verificar o relatório de lucro quando não há gastos no período.                                  | 1. Filtrar um período onde há faturamento, mas nenhum gasto foi lançado.<br>2. Observar o KPI "Lucro".                                                                                                    | O Lucro deve ser igual ao Faturamento Total, e o Total de Gastos deve ser R$ 0,00.                                               |                  |        |
| **CT45**| Relatórios                  | Verificar o relatório de lucro quando não há faturamento no período.                             | 1. Filtrar um período onde há gastos, mas nenhum serviço foi faturado.<br>2. Observar o KPI "Lucro".                                                                                                      | O Lucro deve ser um valor negativo igual ao Total de Gastos, e o Faturamento Total deve ser R$ 0,00.                          |                  |        |
| **CT46**| Adicionar Serviço           | Adicionar serviço com nota fiscal contendo letras e números.                                     | 1. Ir para "Adicionar Serviço".<br>2. No campo "Nota Fiscal", digitar "NF-e 12345-ABC".<br>3. Salvar.                                                                                                    | O sistema deve aceitar o campo alfanumérico e exibi-lo corretamente.                                                            |                  |        |
| **CT47**| Geral / Usabilidade         | Usar o botão "Voltar" do aplicativo.                                                             | 1. Navegar da Página Inicial -> Serviços -> Adicionar Serviço.<br>2. Usar o botão "Voltar" (seta `↩`) no formulário.                                                                                      | O usuário deve ser redirecionado para a tela anterior, que é a "Lista de Serviços".                                             |                  |        |
| **CT48**| Editar Serviço (Modal)      | Cancelar a exclusão de um serviço no diálogo de confirmação.                                     | 1. Abrir o modal "Editar Serviço".<br>2. Clicar em "Excluir".<br>3. No diálogo de confirmação que deve aparecer, clicar em "Não" ou "Cancelar".                                                          | O serviço não deve ser excluído, e o modal de edição deve permanecer aberto.                                                     |                  |        |
| **CT49**| Formulários (Geral)         | Colar texto formatado em um campo de texto.                                                      | 1. Copiar um texto em negrito ou com cor de um editor de texto.<br>2. Colar no campo "Observação".                                                                                                        | O sistema deve colar apenas o texto plano, sem a formatação (negrito, cor, etc.).                                              |                  |        |
| **CT50**| Listagens (Geral)         | Verificar o comportamento da busca após a exclusão de um item.                                   | 1. Buscar por "Parafuso".<br>2. Excluir o item "Parafuso" dos resultados da busca.<br>3. Realizar a mesma busca novamente.                                                                               | A busca por "Parafuso" não deve mais retornar nenhum resultado.                                                                  |                  |        |
| **CT51**| Dashboards (Pág. Inicial)   | Verificar o que acontece no "Top 5 Clientes" se um dos 5 melhores for excluído.                  | 1. Anotar o Top 5.<br>2. Excluir o cliente que está em 3º lugar.<br>3. Observar o gráfico novamente.                                                                                                       | O gráfico deve ser atualizado. O cliente que estava em 6º lugar deve agora aparecer no gráfico, na 5ª posição.                  |                  |        |
| **CT52**| Geral / Usabilidade         | Interação com o sistema sem conexão com a base de dados (se for cliente-servidor).               | 1. Desconectar o servidor de banco de dados.<br>2. Tentar abrir o aplicativo ou realizar uma ação.                                                                                                         | O aplicativo deve exibir uma mensagem de erro clara sobre a falha de conexão e lidar com a situação de forma elegante, sem travar. |                  |        |

