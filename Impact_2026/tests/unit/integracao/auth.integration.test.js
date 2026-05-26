require('dotenv').config();

// Configura o Mock isolado dos modelos do Sequelize antes de carregar o app Express
jest.mock('../../../src/middleware/models', () => ({
  Usuario: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({
      id: 1,
      nome: 'Usuário de Teste',
      email: 'teste@email.com',
      cpf: '12345678909',
      telefone: '44999999999',
      cidade_id: 1,
      tipo_usuario_id: 2
    }),
    findByPk: jest.fn().mockResolvedValue({
      id: 1,
      nome: 'Usuário de Teste',
      email: 'teste@email.com',
      senha: '$2a$10$R9hZZ...', // Hash Bcrypt simulado
      toJSON: function () { return this; }
    })
  },
  Cidade: {},
  TipoUsuario: {}
}));

const request = require('supertest');
const app = require('../../../src/index');

describe('Testes de Integração - Módulo de Autenticação (Auth)', () => {

  // Limpa o estado dos mocks do Jest entre cada execução para evitar contaminação de escopo
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Deve cadastrar um novo usuário com sucesso quando o payload for válido', async () => {
    const payloadValido = {
      nome: 'Usuário de Teste',
      email: `teste.${Date.now()}@dominio.com`,
      password: 'StrongPassword123!',
      cpf: '12345678909',
      telefone: '44999999999',
      cidade_id: 1
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(payloadValido);

    // Asserções baseadas no novo contrato limpo da API (Sem emojis e com assinatura REST estruturada)
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id', 1);
  });

});
