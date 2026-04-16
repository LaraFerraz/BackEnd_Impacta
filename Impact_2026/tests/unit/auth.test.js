process.env.NODE_ENV = 'test';


const request = require('supertest');
const app = require('../../src/index');
const { autorizarProprio } = require('../../src/middleware/authMiddleware');

describe('Testes de Cadastro', () => {

 it('IDs diferentes retorna 403', () => {
  const req = {
    usuario: { id: 1 },
    params: { id: '2' }
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const next = jest.fn();

  autorizarProprio(req, res, next);

  expect(res.status).toHaveBeenCalledWith(403);
  expect(next).not.toHaveBeenCalled();
});

});