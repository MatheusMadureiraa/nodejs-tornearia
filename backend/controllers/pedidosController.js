const PedidosRepository = require('../repositories/PedidosRepository.js');

const createNewOrder = async(req, res) => {
    const { nomeMaterial, fornecedor, quantidade, valor, entregador, observacao, data } = req.body
    if(!nomeMaterial || /\d/.test(nomeMaterial)) return res.status(400).json({ message: 'Nome do material é obrigatório para cadastro e não pode ser um número'});
    else if (quantidade < 1 ) return res.status(400).json({ message: 'Quantidade do material não pode ser negativa'});
    else if (valor < 0 ) return res.status(400).json({ message: 'Valor do material não pode ser negativo'});

    try{
        const currentDate = data || new Date().toISOString().split('T')[0];

        const pedidoData = {
            nomeMaterial: nomeMaterial,
            fornecedor: fornecedor || null,
            quantidade: quantidade || 0,
            valor: valor || 0,
            entregador: entregador || null,
            observacao: observacao || null,
            data: currentDate
        };
    
        const result = await PedidosRepository.create(pedidoData);
        if(!result){
            return res.status(400).json({ message: 'Não foi possível cadastrar o pedido do item no sistema'});
        }
        return res.status(201).json({ message: `Pedido de "${nomeMaterial}" cadastrado com sucesso.`});
    }
    catch (error) {
            return res.status(500).json({ message: 'Ocorreu um erro no servidor.', error: error.message });
    }
}

const getAllOrders = async(req, res) => {
    try{
        const result = await PedidosRepository.findAll();
        if(!result || result.length === 0) return res.status(200).json({ message: 'Nenhum pedido de material está cadastrado no sistema'});
        return res.json(result);
    } catch(err){
        return res.status(500).json({ message: 'Ocorreu um erro no servidor ao listar os pedidos: ', error: err.message });
    }
}

const getOrderById = async( req, res) => {
    if(!req?.params?.idPedido) return res.status(400).json({ message: 'ID do pedido é obrigatório'});

    try{
        const id = req.params.idPedido;
        const result = await PedidosRepository.findById(id);
        if(!result || result.length === 0){
            return res.status(404).json({ message: 'O pedido que buscou não está cadastrado no sistema'});
        }
        return res.status(200).json(result);
    } catch(err){
        return res.status(500).json({ message: 'Ocorreu um erro no servidor ao buscar o pedido: ', error: err.message });
    }
}

const patchOrder = async(req, res) => {
    console.log("📩 PATCH request recebido:");
    console.log("➡️ ID:", req.params.idPedido);
    console.log("➡️ Body:", req.body);
    const id = req.params.idPedido;
    if (!id) {
        return res.status(400).json({ message: 'ID do pedido é obrigatório' });
    }

    try {
        console.log("🛠 PATCH recebido:", req.body);
        const pedidoAtual = await PedidosRepository.findById(id);
        if (!pedidoAtual || pedidoAtual.length === 0) {
            return res.status(404).json({ message: 'pedido não encontrado' });
        }

        const camposAtualizar = req.body;
        if (Object.keys(camposAtualizar).length === 0) {
            return res.status(400).json({ message: 'Nenhum campo enviado para atualização' });
        }

        const result = await PedidosRepository.patch(id, camposAtualizar);
        if (!result || result.changes === 0) {
            return res.status(400).json({ message: 'Não foi possível atualizar o pedido' });
        }

        res.status(200).json({ message: 'pedido atualizado com sucesso' });
    } catch (error) {
        console.error("❌ Erro ao fazer patch no pedido:", error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

const deleteOrder = async(req, res) => {
    if(!req?.params?.idPedido) return res.status(400).json({ message: 'ID do pedido é obrigatório para deletar'});
    try{
        const id = req.params.idPedido;
        const result = await PedidosRepository.deleteById(id);
        if(!result || result.changes === 0){
            return res.status(400).json({ message: 'O pedido que tentou deletar não está cadastrado no sistema'});
        }
        return res.status(200).json({message: `Pedido deletado com sucesso do sistema.`})
    } catch(err){
        return res.status(500).json({ message: 'Ocorreu um erro no servidor ao deletar o pedido: ', error: err.message });
    }
}

module.exports = {
    createNewOrder,
    getAllOrders,
    getOrderById,
    patchOrder,
    deleteOrder
};