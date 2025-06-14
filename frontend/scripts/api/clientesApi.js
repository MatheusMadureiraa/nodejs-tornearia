const API_URL = "http://localhost:3500/clientes";

// requisições
async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "content-type": "application/json", // ajustado para minúsculas
        },
        ...options,
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        console.error(`erro ${response.status}: ${errorMessage}`);
        throw new Error(`erro na api: ${errorMessage}`);
    }

    const data =  await response.json();
    return {
        status: response.status,
        data: data
    };
}

async function listarClientes() {
    return await request(API_URL, {
        method: "GET"
    });
}

async function listarClientePorId(id){
    return await request(`${API_URL}/${id}`, {
        method: "GET"
    })
}

async function editarClientePorId(clienteData, id) {
    return await request(`${API_URL}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(clienteData)
    })
}

async function excluirClientePorId(id) {
    return await request(`${API_URL}/${id}`, {
        method: "DELETE"
    })
}

// funcao para buscar nome
async function fetchClientsNames(servicos) {
    const nomesMap = {};
    // como servico.nomecliente não vem do backend, sempre precisaremos tentar buscar todos os ids únicos
    const uniqueIds = [...new Set(servicos.map(servico => servico.idCliente))];

    if (uniqueIds.length > 0) {
        await Promise.all(uniqueIds.map(async (id) => {
            if (!id) { 
                nomesMap[id] = "Desconhecido";
                return;
            }
            try {
                const response = await fetch(`${API_URL}/${id}`, {
                    headers: { "content-type": "application/json" }
                });

                if (response.ok) {
                    const clienteData = await response.json();
                    nomesMap[id] = Array.isArray(clienteData) ? 
                                   (clienteData[0]?.nomeCliente || "Desconhecido") : 
                                   (clienteData?.nomeCliente || "Desconhecido");
                } else if (response.status === 404) {
                    nomesMap[id] = "Desconhecido";
                } else {
                    const errorMessage = await response.text();
                    console.warn(`aviso: falha ao buscar cliente id ${id} (status ${response.status}): ${errorMessage.substring(0, 100)}`);
                    nomesMap[id] = "Desconhecido";
                }
            } catch (err) {
                console.warn(`aviso: exceção ao buscar cliente id ${id}: ${err.message}`);
                nomesMap[id] = "Desconhecido";
            }
        }));
    }

    servicos.forEach(servico => {
        servico.nomeCliente = nomesMap[servico.idCliente] || "Desconhecido";
    });
}

export { editarClientePorId, excluirClientePorId, fetchClientsNames, listarClientePorId, listarClientes };
