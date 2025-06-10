const API_BASE_URL = "http://localhost:3500";

// Função para fazer requisições à API
async function request(url, options = {}) {
    try {
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

        const data = await response.json();
        return {
            status: response.status,
            data: data
        };
    } catch (error) {
        console.error("Erro na requisição:", error);
        throw error;
    }
}

// Buscar dados de todas as tabelas
async function buscarDadosCompletos() {
    try {
        const [clientesResponse, servicosResponse, pedidosResponse] = await Promise.all([
            request(`${API_BASE_URL}/clientes`),
            request(`${API_BASE_URL}/servicos`),
            request(`${API_BASE_URL}/pedidos`)
        ]);

        return {
            clientes: Array.isArray(clientesResponse.data) ? clientesResponse.data : [],
            servicos: Array.isArray(servicosResponse.data) ? servicosResponse.data : [],
            pedidos: Array.isArray(pedidosResponse.data) ? pedidosResponse.data : []
        };
    } catch (error) {
        console.error("Erro ao buscar dados completos:", error);
        return {
            clientes: [],
            servicos: [],
            pedidos: []
        };
    }
}

export { buscarDadosCompletos };