const API_URL = "http://localhost:3500/pedidos";

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
async function criarPedido(pedidoData) {
    if (pedidoData.data === '') {
        delete pedidoData.data;
    }

    return await request(API_URL, {
        method: "POST",
        body: JSON.stringify(pedidoData),
    });
}

async function listarPedidos() {
    return await request(API_URL, {
        method: "GET"
    });
}

async function listarPedidoPorId(id){
    return await request (`${API_URL}/${id}`, {
        method: "GET"
    })
}

async function editarPedidoPorId(pedidoData, id) {
    return await request(`${API_URL}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(pedidoData),
    });
}

async function excluirPedidoPorId(id) {
    return await request(`${API_URL}/${id}`, {
        method: "DELETE"
    });
}

export { criarPedido, editarPedidoPorId, excluirPedidoPorId, listarPedidoPorId, listarPedidos };

