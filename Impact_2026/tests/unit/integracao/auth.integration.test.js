require('dotenv').config();

jest.mock('../../../src/models', () => ({
  Usuario: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    findByPk: jest.fn().mockResolvedValue({
      id: 1,
      nome: 'Teste',
      email: 'teste@email.com',
      senha: 'hash',
      toJSON: function () { return this; }
    })
  },
  Cidade: {
    findOne: jest.fn().mockResolvedValue(null)
  },
  TipoUsuario: {}
}));

const request = require('supertest');
const app = require('../../../src/index');

describe('Testes de Integração - Auth', () => {

  test('Deve cadastrar um usuário com sucesso', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nome: 'Teste',
        email: 'teste@email.com',
        password: '123456',
        telefone: '44999999999'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

});