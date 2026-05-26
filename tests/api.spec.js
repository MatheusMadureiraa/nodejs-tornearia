const { test, expect } = require('@playwright/test');

const baseURL = process.env.API_BASE_URL || 'http://127.0.0.1:3500';

const uniqueString = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const createJson = async (requestContext, url, body, expectedStatus) => {
  const response = await requestContext.post(url, { data: body });
  expect(response.status()).toBe(expectedStatus);
  return response.json();
};

test.describe('API Integration Tests', () => {
  test('clientes - create valid client and validate list', async ({ request }) => {
    const clientName = uniqueString('Cliente');
    const createResponse = await request.post(`${baseURL}/clientes`, {
      data: { nomeCliente: clientName }
    });

    expect(createResponse.status()).toBe(201);
    const createBody = await createResponse.json();
    expect(createBody.message).toContain('cadastrado com sucesso');

    const listResponse = await request.get(`${baseURL}/clientes`);
    expect(listResponse.ok()).toBeTruthy();
    const listBody = await listResponse.json();
    expect(Array.isArray(listBody)).toBe(true);
    expect(listBody.some((item) => item.nomeCliente === clientName)).toBe(true);
  });

  test('clientes - create missing name returns 400', async ({ request }) => {
    const response = await request.post(`${baseURL}/clientes`, {
      data: { nomeCliente: '' }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain('Nome do cliente é obrigatório');
  });

  test('clientes - invalid get and invalid delete return proper errors', async ({ request }) => {
    const missingId = 9999999;

    const getResponse = await request.get(`${baseURL}/clientes/${missingId}`);
    expect(getResponse.status()).toBe(404);
    const getBody = await getResponse.json();
    expect(getBody.message).toContain('Cliente não encontrado');

    const deleteResponse = await request.delete(`${baseURL}/clientes/${missingId}`);
    expect(deleteResponse.status()).toBe(404);
    const deleteBody = await deleteResponse.json();
    expect(deleteBody.message).toContain('Cliente não encontrado');
  });

  test('servicos - create valid service and validate list', async ({ request }) => {
    const serviceName = uniqueString('Servico');
    const clientName = uniqueString('ClienteServico');

    const createResponse = await request.post(`${baseURL}/servicos`, {
      data: {
        nomeServico: serviceName,
        preco: 100,
        nomeCliente: clientName
      }
    });

    expect(createResponse.status()).toBe(201);
    const createBody = await createResponse.json();
    expect(createBody.message).toContain('cadastrado com sucesso');

    const listResponse = await request.get(`${baseURL}/servicos`);
    expect(listResponse.ok()).toBeTruthy();
    const listBody = await listResponse.json();
    expect(Array.isArray(listBody)).toBe(true);
    expect(listBody.some((item) => item.nomeServico === serviceName)).toBe(true);
  });

  test('servicos - create invalid service returns 400', async ({ request }) => {
    const response = await request.post(`${baseURL}/servicos`, {
      data: {
        nomeServico: '',
        preco: -10,
        nomeCliente: ''
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain('Nome do serviço, preço e nome do cliente são campos obrigatórios');
  });

  test('servicos - invalid service id returns 404', async ({ request }) => {
    const response = await request.get(`${baseURL}/servicos/9999999`);
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.message).toContain('não está cadastrado no sistema');
  });

  test('pedidos - create valid order and patch update', async ({ request }) => {
    const materialName = uniqueString('Material');
    const createResponse = await request.post(`${baseURL}/pedidos`, {
      data: {
        nomeMaterial: materialName,
        quantidade: 2,
        valor: 120
      }
    });

    expect(createResponse.status()).toBe(201);
    const createBody = await createResponse.json();
    expect(createBody.message).toContain('cadastrado com sucesso');

    const listResponse = await request.get(`${baseURL}/pedidos`);
    expect(listResponse.ok()).toBeTruthy();
    const listBody = await listResponse.json();
    expect(Array.isArray(listBody)).toBe(true);
    const createdOrder = listBody.find((item) => item.nomeMaterial === materialName);
    expect(createdOrder).toBeTruthy();
    expect(createdOrder.quantidade).toBe(2);

    const updateResponse = await request.patch(`${baseURL}/pedidos/${createdOrder.idPedido}`, {
      data: {
        nomeMaterial: `${materialName}-ATUALIZADO`
      }
    });

    expect(updateResponse.status()).toBe(200);
    const updateBody = await updateResponse.json();
    expect(updateBody.message).toContain('pedido atualizado com sucesso');
  });

  test('pedidos - create missing material returns 400', async ({ request }) => {
    const response = await request.post(`${baseURL}/pedidos`, {
      data: {
        quantidade: 1,
        valor: 50
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain('Nome do material é obrigatório');
  });

  test('pedidos - invalid delete returns 400', async ({ request }) => {
    const response = await request.delete(`${baseURL}/pedidos/9999999`);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.message).toContain('não está cadastrado no sistema');
  });
});
