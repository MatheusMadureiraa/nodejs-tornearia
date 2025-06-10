const API_URL = "http://localhost:3500/servicos";

// requisições
async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });

    if (!response.ok) {
        const errorMessage = await response.text();
        console.error(`Erro ${response.status}: ${errorMessage}`);
        throw new Error(`Erro na API: ${errorMessage}`);
    }

    const data =  await response.json();
    return {
        status: response.status,
        data: data
    };
}

// CRUD
async function criarServico(dados) {
    if (dados.data === '') {
        delete dados.data;
    }

    return await request(API_URL, {
        method: "POST",
        body: JSON.stringify(dados),
    });
}

async function listarServicos() {
    return await request(API_URL, {
        method: "GET"
    });
}

async function listarServicoPorId(id) {
    return await request(`${API_URL}/${id}`, {
        method: "GET"
    });
}

async function editarServicoPorId(servicoData, id) {
    return await request(`${API_URL}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(servicoData),
    });
}

async function excluirServicoPorId(id) {
    return await request(`${API_URL}/${id}`, { method: "DELETE" });
}

async function updateStatusServico(idServico, campos) {
    return await request(`${API_URL}/${idServico}`, {
        method: "PATCH",
        body: JSON.stringify(campos)
    });
}

export { criarServico, editarServicoPorId, excluirServicoPorId, listarServicoPorId, listarServicos, updateStatusServico };

