const { consulta } = require('../database/conexao.js');

//CRUD
const create = (cliente) => {
    const sql = "INSERT INTO clientes (nomeCliente) VALUES (?)";
    return consulta(sql, [cliente], "Não foi possível cadastrar o cliente no banco de dados, revise o nome digitado.");

};

const findAll = () => {
    const sql = "SELECT * FROM clientes";
    return consulta(sql, [], "Não foi possível retornar a lista de clientes"); // Passando array vazio
};

const findById = (id) => {
    const sql = "SELECT * FROM clientes WHERE idCliente=?";
    return consulta(sql, [id], "Cliente que você buscou não foi encontrado! Verifique se ele existe na lista de clientes cadastrados");
};

const update = (nome, id) => {
    const sql = "UPDATE clientes SET nomeCliente=? WHERE idCliente=?";
    return consulta(sql, [nome, id], "Não foi possível atualizar o cliente, verifique se ele existe na lista de clientes cadastrados");
};

const deleteById = (id) => {
    const sql = "DELETE FROM clientes WHERE idCliente=?";
    return consulta(sql, [id], "Não foi possível deletar o cliente, verifique se ele existe na lista de clientes cadastrados")
};

// Others helpers
const findByName = async (nome) => {
    const sql = "SELECT * FROM clientes WHERE nomeCliente = ?";
    const result = await consulta(sql, [nome], "Cliente não encontrado");
    console.log(result);

    if (result.length > 0) return result[0];
    return null;
};

ClientesRepository = {
    create, findAll, findById, update, deleteById, findByName
}

module.exports = ClientesRepository;

