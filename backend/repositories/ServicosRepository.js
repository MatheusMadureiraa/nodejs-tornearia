const { consulta } = require('../database/conexao.js');

const create = (servico) => {
    const sql = `
        INSERT INTO servicos (
            nomeServico, preco, idCliente, pagamento, data, 
            statusServico, statusPagamento, notaFiscal, observacao, imagem
        ) VALUES (
            :nomeServico, :preco, :idCliente, :pagamento, :data, 
            :statusServico, :statusPagamento, :notaFiscal, :observacao, :imagem
        )
    `;

    return consulta(sql, {
        ":nomeServico": servico.nomeServico,
        ":preco": servico.preco,
        ":idCliente": servico.idCliente,
        ":pagamento": servico.pagamento,
        ":data": servico.data,
        ":statusServico": servico.statusServico,
        ":statusPagamento": servico.statusPagamento,
        ":notaFiscal": servico.notaFiscal,
        ":observacao": servico.observacao,
        ":imagem": servico.imagem
    }, "Não foi possível cadastrar o serviço, revise os dados digitados.");
};

const findAll = () => {
    const sql = "SELECT * FROM servicos";
    return consulta(sql, [], "Não foi possível retornar a lista de serviços, nenhyum serviço está cadastrado no sistema");
}

const findById = (id) => {
    const sql = "SELECT * FROM servicos WHERE idServico=?";
    return consulta(sql, id, "Serviço que você buscou não foi encontrado! Verifique se ele existe na lista de serviços cadastrados");
}


const patch = (id, camposAtualizar) => {
    if (!camposAtualizar || typeof camposAtualizar !== 'object' || Object.keys(camposAtualizar).length === 0) {
        throw new Error("Nenhum campo fornecido para atualização");
    }

    const campos = Object.keys(camposAtualizar);
    const valores = Object.values(camposAtualizar);

    const setClause = campos.map(campo => `${campo} = ?`).join(', ');
    const sql = `UPDATE servicos SET ${setClause} WHERE idServico = ?`;

    const parametros = [...valores, id];

    console.log("SQL PATCH gerado:", sql);
    console.log("Com dados:", parametros);

    return consulta(sql, parametros, "Não foi possível aplicar o patch no serviço");
};

const deleteById = (id) => {
    const sql = "DELETE FROM servicos WHERE idServico=?";
    return consulta(sql, id, "Não foi possível deletar o serviço, verifique se ele existe na lista de serviços cadastrados")
}

const ServicosRepository = {
    create, findAll, findById, patch, deleteById
}

module.exports = ServicosRepository;