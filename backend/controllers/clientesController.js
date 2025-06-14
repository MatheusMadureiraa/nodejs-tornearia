const ClientesRepository = require('../repositories/ClientesRepository.js');

const createNewClient = async (req, res) => {
    console.log('Entrou no createNewClient');
    if (!req?.body?.nomeCliente || req.body.nomeCliente.trim() === '' || req.body.nomeCliente === null ) {
        return res.status(400).json({ message: 'Nome do cliente é obrigatório' });
    }
    else if(req.body.nomeCliente.length < 3 || req.body.nomeCliente.length > 100  || /\d/.test(req.body.nomeCliente)) {
        return res.status(400).json({ message: 'Nome do cliente deve ter entre 3 e 100 caracteres e não pode ser um número' });
    }
    try {
        const clientName = req.body.nomeCliente;
        console.log('TESTEEE ante sdo findByName', clientName);
        if(await ClientesRepository.findByName(clientName)) return res.status(400).json({ message: `Cliente com nome "${clientName}" já cadastrado` });

        const result = await ClientesRepository.create(clientName);
        if (result.changes > 0) return res.status(201).json({ message: `Cliente com nome ${clientName} cadastrado com sucesso.` });
    } catch (err) {
        console.log(`Erro interno no servidor: ${err.message}`);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

const getAllClients = async (req, res) => {
    try {
        const clients = await ClientesRepository.findAll();
        if (!clients || clients.length === 0) return res.status(200).json({ message: 'Nenhum cliente está cadastrado no sistema' });

        res.json(clients);
    } catch (err) {
        res.status(500).json({ erro: `Erro ao buscar clientes: ${err.message}` });
    }
};

const getClienteById = async (req, res) => {
    if (isNaN(req?.params?.idCliente)) return res.status(400).json({ message: 'ID do cliente deve ser um número' });

    try {
        const client = await ClientesRepository.findById(req.params.idCliente);
        if (!client || client.length === 0) return res.status(404).json({ message: 'Cliente não encontrado' });
        res.json(client);
    } catch (err) {
        res.status(500).json({ message: `Erro ao buscar o cliente: ${err.message}` });
    }
};

const updateClient = async (req, res) => {
    if (!req?.params?.idCliente || !req?.body?.nomeCliente) {
        return res.status(400).json({ message: 'ID e Nome são obrigatórios para atualizar um cliente' });
    }

    try {
        const id = req.params.idCliente;
        const nome = req.body.nomeCliente;
        const result = await ClientesRepository.update(nome, id);

        if (result.changes > 0) return res.status(200).json({ message: 'Cliente atualizado com sucesso' });
        res.status(400).json({ message: 'Esse cliente não está cadastrado' });
    } catch (err) {
        res.status(500).json({ erro: `Erro interno no servidor: ${err.message}` });
    }
};

const deleteClient = async (req, res) => {
    if (!req?.params?.idCliente) return res.status(400).json({ message: 'ID do cliente é obrigatório para deletar' });

    try {
        const id = req.params.idCliente;
        const result = await ClientesRepository.deleteById(id);

        if (result.changes > 0) return res.status(200).json({
            message: 'Cliente deletado com sucesso'
        });
        res.status(404).json({ message: 'Cliente não encontrado' });
    } catch (err) {
        res.status(500).json({ message: 'Erro ao deletar cliente' });
    }
};

module.exports = {
    createNewClient,
    getAllClients,
    getClienteById,
    updateClient,
    deleteClient
};