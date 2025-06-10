const ServicosRepository = require('../repositories/ServicosRepository.js');
const ClientesRepository = require('../repositories/ClientesRepository.js');

const createNewService = async(req, res) => {
    if(!req?.body?.nomeServico || !req?.body?.preco || !req?.body?.nomeCliente) {
        return res.status(400).json({ message: 'Nome do serviço, preço e nome do cliente são campos obrigatórios para cadastro'});
    }
    else if(isNaN(req.body.preco) || req.body.preco < 0) return res.status(400).json({ message: 'Preço do serviço deve ser um número maior que zero'});
    try{
        const { nomeServico, preco, pagamento, data, statusServico, statusPagamento, notaFiscal, observacao, imagem, nomeCliente} = req.body;

        let cliente = await ClientesRepository.findByName(nomeCliente);

        if(!cliente){
            const novoCliente = await ClientesRepository.create(nomeCliente);
            console.log("Cliente encontrado/criado:", novoCliente);
            cliente = {idCliente: novoCliente.lastID};
        }
        const currentDate = data || new Date().toISOString().split('T')[0];
        const servicoData = {
            nomeServico: nomeServico,
            preco,
            idCliente: cliente.idCliente,
            pagamento: pagamento || 1,
            data: currentDate,
            statusServico: statusServico || -1,
            statusPagamento: statusPagamento || 0,
            notaFiscal: notaFiscal || null,
            observacao: observacao || null,
            imagem: imagem || null
        };


        const result = await ServicosRepository.create(servicoData);
        if(!result){
            return res.status(400).json({ message: 'Não foi possível cadastrar o serviço no sistema'});
        }
        
        return res.status(201).json({ message: `Serviço ${nomeServico} cadastrado com sucesso.`});
    } catch(err){
        console.log(`Erro interno no servidor: ${err.message}`);
        return res.status(500).json({ message: 'Erro interno no servidor'});
    }
}

const getAllServices = async(req, res) => {
    try{
        const result = await ServicosRepository.findAll();
        if(!result || result.length === 0) return res.status(200).json({ message: 'Nenhum serviço está cadastrado no sistema'});

        return res.json(result);
    } catch(err){
        console.log(`Erro interno no servidor: ${err.message}`);
        return res.status(500).json({ message: 'Erro interno no servidor'});
    }
}

const getServiceById = async (req, res) => {
    if(isNaN(req?.params?.idServico)) return res.status(400).json({ message: 'ID do serviço é um número obrigatório'});

    try{
        const id = req.params.idServico;
        const result = await ServicosRepository.findById(id);
        if(!result || result.length === 0 ) return res.status(404).json({ message: 'O Serviço que buscou não está cadastrado no sistema'});

        res.status(200).json(result);
    } catch(err){
        res.status(500).json({ message: 'Erro interno no servidor'});
    }
}

const updateService = async (req, res) => {
    if (!req?.params?.idServico) {
        return res.status(400).json({ message: 'ID do serviço é obrigatório' });
    }
    try {
        const id = req.params.idServico;
        console.log(`🔍 ID do serviço recebido: ${id}`);

        const servicoAtual = await ServicosRepository.findById(id);
        console.log("🔍 Serviço atual no banco:", servicoAtual);

        if (!servicoAtual || servicoAtual.length === 0) {
            return res.status(404).json({ message: 'O serviço que tentou atualizar não está cadastrado no sistema' });
        }

        const { nomeServico, nomeCliente, preco, pagamento, data, statusServico, statusPagamento, notaFiscal, observacao, imagem } = req.body;
        console.log("🔍 Dados recebidos no body:", req.body);

        if (!nomeServico) {
            return res.status(400).json({ message: 'Nome do serviço é obrigatório para atualizar' });
        }

        let cliente = await ClientesRepository.findByName(nomeCliente);
        console.log("🔍 Cliente encontrado:", cliente);

        if (!cliente || cliente.length === 0) {
            return res.status(404).json({ message: `O cliente "${nomeCliente}" não está cadastrado no sistema` });
        }

        const servicoData = {
            nomeServico: nomeServico ?? servicoAtual.nomeServico,
            idCliente: nomeCliente ? cliente.idCliente : servicoAtual.idCliente,
            preco: preco !== undefined ? preco : servicoAtual.preco,
            pagamento: pagamento ?? servicoAtual.pagamento,
            data: data ?? servicoAtual.data,
            statusServico: statusServico ?? servicoAtual.statusServico,
            statusPagamento: statusPagamento ?? servicoAtual.statusPagamento,
            notaFiscal: notaFiscal ?? servicoAtual.notaFiscal,
            observacao: observacao ?? servicoAtual.observacao,
            imagem: imagem ?? servicoAtual.imagem        
        };

        Object.keys(servicoData).forEach((key) => {
            if (servicoData[key] === undefined) {
                delete servicoData[key];
            }
        });

        console.log("🔍 Dados a serem atualizados:", servicoData);

        const result = await ServicosRepository.update(id, servicoData);
        console.log("🔍 Resultado do update:", result);

        if (!result || result.changes === 0) {
            return res.status(400).json({ message: 'Não foi possível atualizar o serviço no sistema' });
        }

        res.status(200).json({ message: `Serviço "${nomeServico}" atualizado com sucesso` });
    } catch (err) {
        console.error("❌ Erro ao atualizar serviço:", err);
        res.status(500).json({ message: 'Erro interno no servidor ao atualizar o serviço' });
    }   
};

const patchService = async (req, res) => {
    console.log("📩 PATCH request recebido:");
    console.log("➡️ ID:", req.params.idServico);
    console.log("➡️ Body:", req.body);
    const id = req.params.idServico;
    if (!id) {
        return res.status(400).json({ message: 'ID do serviço é obrigatório' });
    }

    try {
        console.log("🛠 PATCH recebido:", req.body);
        const servicoAtual = await ServicosRepository.findById(id);
        if (!servicoAtual || servicoAtual.length === 0) {
            return res.status(404).json({ message: 'Serviço não encontrado' });
        }

        const camposAtualizar = req.body;
        if (Object.keys(camposAtualizar).length === 0) {
            return res.status(400).json({ message: 'Nenhum campo enviado para atualização' });
        }

        const result = await ServicosRepository.patch(id, camposAtualizar);
        if (!result || result.changes === 0) {
            return res.status(400).json({ message: 'Não foi possível atualizar o serviço' });
        }

        res.status(200).json({ message: 'Serviço atualizado com sucesso' });
    } catch (error) {
        console.error("❌ Erro ao fazer patch no serviço:", error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

const deleteService = async (req, res) => {
    if(!req?.params?.idServico) return res.status(400).json({ message: 'ID do serviço é obrigatório para deletar'});

    try{
        const id = req.params.idServico;
        const result = await ServicosRepository.deleteById(id);
        if(!result || result.changes === 0) return res.status(404).json({ message: 'O Serviço que tentou deletar não está cadastrado no sistema'});

        res.status(200).json({ message: `Serviço deletado com sucesso`});
    } catch(err) {
        res.status(500).json({ message: 'Erro interno no servidor'});
    }
}

module.exports ={ 
    createNewService,
    getAllServices,
    getServiceById,
    updateService,
    patchService,
    deleteService
}