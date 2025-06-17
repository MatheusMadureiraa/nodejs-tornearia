# Testes do sistema da Vallim Tornearia

- Ferramenta utilizada: Insomnia e Cypress
- Documentação: Casos de Teste e Plano de Testes

# Melhorias a serem feitas:
1. Autocomplete de Clientes e Fornecedores
Contexto:

Formulário 1: 'Adicionar Serviço'

Campo a ser modificado: Nome do Cliente

Comportamento atual: É um campo de texto onde o usuário digita livremente o nome do cliente.

Problema: Isso gera inconsistências (ex: "Empresa A", "empresa a", "Empresa A LTDA").

Formulário 2: 'Adicionar Gasto(pedido)'

Campo a ser modificado: Fornecedor

Comportamento atual: Também é um campo de texto livre.

Problema: Mesmo problema do campo de cliente.

Modificação Desejada:

Transforme os campos Nome do Cliente e Fornecedor em componentes de autocomplete com busca.

Funcionalidade: Conforme o usuário digita no campo, uma lista suspensa (dropdown) deve aparecer abaixo, mostrando os clientes/fornecedores já cadastrados que correspondem à busca. O fluxo de cadastro de novos clientes deve permanecer como está: caso o nome seja diferente, cadastra um novo

Seleção: O usuário deve poder clicar em um item da lista para preencher o campo com o nome exato que está no banco de dados, associando o ID correto internamente.

2. Armazenar fotos
Não esta armazenando fotos ainda. 
- Preciso que seja possível armazenar a foto ao enviar uma no form da página 'Adicionar Serviço'. 
- Que seja possível editar ou adicionar uma foto (caso não exista para aquele serviço) no modal de editar, na lista de servicos. 
- Que seja possível visualizar a foto ao 'ver detalhes' do servico (caso tenha foto registrada, caso não tenha, aparecer mensagem "Imagem não cadastrada").
- A caixa de diálogo de arquivo deve filtrar para aceitar apenas formatos de imagem (jpg, png, etc.), ou exibir um erro se um tipo inválido for selecionado.

! OBS PARA VC, GEMINI: Vc acha que isso pode pesar o banco de dados ou até mesmo a aplicação quando tiver muitas fotos cadastradas? É apenas 1 foto por serviço, mas tenho medo de sobrecarregar o sistema com um tempo, ainda mais que é um databse local (SQLITE) q estou usando e o PC da tornearia é um windows 8. Teria outra forma de armazenar? Talvez salvar a imagem automaticamente em uma pasta na área de trabalho do pc, com o nome do servico e data, coisa assim. !

3. Editar campos
- Ao editar a 'quantidade' e deixa-la vazia, a quantidade aparece como 'null' na lista. Deveria aparecer 1 ou 0
- Ao editar o 'valor' ou 'preco' em qualquer uma das listas para uma string vazia, ele aceita e buga a lista, deveria ser um valor obrigatorio, ou caso vazia, ele nao edita
- É possível editar o "Pagamento" em servicos para qualquer texto, deve ter as opcoes fixas de pagamentos possíveis, e não pode escrever texto, apenas selecionar uma das opcoes.
- Ao editar, O campo 'imagem' em servicos, deve ser um arquivo (foto) que pode ser selecionado para editar a foto no banco de dados. A foto está armazenada como BLOB no SQLite local.

4. Adicionar Gasto/Pedido
Ao adicionar um pedido com nome que contêm número, ele da erro, não sei se é no front ou no back-end que isso está sendo tratado para gerar o erro. Mas deve ser possível adicionar um pedido com número.

5. Show alert
o Alerta showAlert não aparece na tela ao editar ou excluir item. Seja o error ou success, nenhum aparece na tela em frente ao modal ou em frente a lista. No forms de adicionar servico ou gasto/pedido ele aparece normalmente. Faça o aparecer, apenas o timeout para reiniciar após o showAlert sumir está funcionando, mas o showAlert não aparece na tela (apenas no console).

6. Excluir cliente com serviço associado
É possível excluir um cliente que possui seu IdCliente associado a um servico. O sistema deve exibir um alerta (ex: "Este cliente não pode ser excluído pois possui serviços vinculados.") e impedir a exclusão. Caso não haja serviços, exclui normalmente.







