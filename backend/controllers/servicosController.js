const ServicosRepository = require('../repositories/ServicosRepository.js');
const ClientesRepository = require('../repositories/ClientesRepository.js');
const imageHandler = require('../utils/imageHandler.js');

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
        
        // Handle image if provided
        let imagemPath = null;
        if (imagem) {
            try {
                imagemPath = imageHandler.saveImageFromBase64(imagem);
            } catch (imageError) {
                console.error('Error saving image:', imageError);
                return res.status(400).json({ message: 'Erro ao salvar imagem: ' + imageError.message });
            }
        }

        const servicoData = {
            nomeServico: nomeServico,
            preco,
            idCliente: cliente.idCliente,
            pagamento: pagamento || 'Dinheiro',
            data: currentDate,
            statusServico: statusServico || -1,
            statusPagamento: statusPagamento || -1,
            notaFiscal: notaFiscal || null,
            observacao: observacao || null,
            imagem_path: imagemPath
        };

        const result = await ServicosRepository.create(servicoData);
        if(!result){
            // If service creation failed and we saved an image, clean it up
            if (imagemPath) {
                imageHandler.deleteImage(imagemPath);
            }
            return res.status(400).json({ message: 'Não foi possível cadastrar o serviço no sistema'});
        }

        // Update the image filename with the service ID for better organization
        if (imagemPath && result.lastID) {
            try {
                const newImagePath = imageHandler.generateUniqueFilename(imagemPath, result.lastID);
                const oldPath = imageHandler.getImagePath(imagemPath);
                const newPath = imageHandler.getImagePath(newImagePath);
                
                require('fs').renameSync(oldPath, newPath);
                
                // Update the database with the new filename
                await ServicosRepository.patch(result.lastID, { imagem_path: newImagePath });
            } catch (renameError) {
                console.error('Error renaming image file:', renameError);
                // Continue anyway, the service was created successfully
            }
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

        // Handle image update
        let imagemPath = servicoAtual.imagem_path; // Keep current image by default
        if (imagem) {
            try {
                // Delete old image if it exists
                if (servicoAtual.imagem_path) {
                    imageHandler.deleteImage(servicoAtual.imagem_path);
                }
                // Save new image
                imagemPath = imageHandler.saveImageFromBase64(imagem, id);
            } catch (imageError) {
                console.error('Error updating image:', imageError);
                return res.status(400).json({ message: 'Erro ao atualizar imagem: ' + imageError.message });
            }
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
            imagem_path: imagemPath
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

        // Validate and clean data
        const cleanedFields = {};
        const validPaymentMethods = ['Boleto', 'Cartão', 'Dinheiro', 'Pix'];
        
        Object.keys(camposAtualizar).forEach(key => {
            const value = camposAtualizar[key];
            
            if (key === 'preco') {
                // Ensure preco is not empty and is a valid number
                if (value === null || value === undefined || value === '' || isNaN(parseFloat(value))) {
                    return res.status(400).json({ message: 'Preço é obrigatório e deve ser um número válido' });
                }
                cleanedFields[key] = Math.max(0, parseFloat(value));
            } else if (key === 'pagamento') {
                // Validate payment method
                if (value && !validPaymentMethods.includes(value)) {
                    return res.status(400).json({ message: 'Método de pagamento inválido. Use: Boleto, Cartão, Dinheiro ou Pix' });
                }
                cleanedFields[key] = value || 'Dinheiro';
            } else if (key === 'imagem') {
                // Handle image update
                if (value) {
                    try {
                        // Delete old image if it exists
                        if (servicoAtual.imagem_path) {
                            imageHandler.deleteImage(servicoAtual.imagem_path);
                        }
                        // Save new image
                        cleanedFields['imagem_path'] = imageHandler.saveImageFromBase64(value, id);
                    } catch (imageError) {
                        console.error('Error updating image:', imageError);
                        return res.status(400).json({ message: 'Erro ao atualizar imagem: ' + imageError.message });
                    }
                }
            } else {
                cleanedFields[key] = value;
            }
        });

        const result = await ServicosRepository.patch(id, cleanedFields);
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
        
        // Get service data to find associated image
        const servico = await ServicosRepository.findById(id);
        if (servico && servico.imagem_path) {
            // Delete associated image file
            imageHandler.deleteImage(servico.imagem_path);
        }
        
        const result = await ServicosRepository.deleteById(id);
        if(!result || result.changes === 0) return res.status(404).json({ message: 'O Serviço que tentou deletar não está cadastrado no sistema'});

        res.status(200).json({ message: `Serviço deletado com sucesso`});
    } catch(err) {
        res.status(500).json({ message: 'Erro interno no servidor'});
    }
}

// New endpoint to serve images
const getServiceImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = imageHandler.getImagePath(filename);
        
        if (!imagePath || !imageHandler.imageExists(filename)) {
            return res.status(404).json({ message: 'Imagem não encontrada' });
        }

        // Set appropriate content type
        const ext = require('path').extname(filename).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };

        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ message: 'Erro ao carregar imagem' });
    }
};

module.exports ={ 
    createNewService,
    getAllServices,
    getServiceById,
    updateService,
    patchService,
    deleteService,
    getServiceImage
}