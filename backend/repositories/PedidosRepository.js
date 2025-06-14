const { consulta } = require('../database/conexao.js');

const create = (pedido) => {
    const sql = `INSERT INTO pedidos (
        nomeMaterial, fornecedor, quantidade, valor, entregador, observacao, data
    ) VALUES (
        :nomeMaterial, :fornecedor, :quantidade, :valor, :entregador, :observacao, :data
    )`;

    return consulta(sql, {
        ":nomeMaterial": pedido.nomeMaterial,
        ":fornecedor": pedido.fornecedor,
        ":quantidade": pedido.quantidade,
        ":valor": pedido.valor,
        ":entregador": pedido.entregador,
        ":observacao": pedido.observacao,
        ":data": pedido.data
    }, "Não foi possível cadastrar o pedido, revise os dados digitados.");
}

const findAll = () => {
    const sql = "SELECT * FROM pedidos";
    return consulta(sql, [], "Não foi possível retornar a lista de pedidos, nenhum pedido de material está cadastrado no sistema");
}

const findById = (id) => {
    const sql = "SELECT * FROM pedidos WHERE idPedido=?";
    return consulta(sql, id, "O pedido de material que você procurou não está cadastrado no sistema");
}

const patch = (id, camposAtualizar) => {
    if (!camposAtualizar || typeof camposAtualizar !== 'object' || Object.keys(camposAtualizar).length === 0) {
        throw new Error("Nenhum campo fornecido para atualização");
    }

    const campos = Object.keys(camposAtualizar);
    const valores = Object.values(camposAtualizar);

    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    const sql = `UPDATE pedidos SET ${setClause} WHERE idPedido = ?`;

    const parametros = [...valores, id];

    console.log("SQL PATCH gerado:", sql);
    console.log("Com dados:", parametros);

    return consulta(sql, parametros, "Não foi possível aplicar o patch no pedido");
};

const deleteById = (id) => {
    const sql = "DELETE FROM pedidos WHERE idPedido=?";
    return consulta(sql, id, "Não foi possível deletar o pedido, revise se ele está cadastrado no sistema");
}

const PedidosRepository = {
    create,
    findAll,
    findById,
    patch,
    deleteById
};

module.exports = PedidosRepository;