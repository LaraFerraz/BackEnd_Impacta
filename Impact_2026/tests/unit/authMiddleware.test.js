const { autenticar, autorizarProprio } = require('../../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const criarMockReq = (headers = {}) => ({
  headers,
  usuario: null
});

const criarMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Autenticação JWT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('token válido passa', () => {
    const token = jwt.sign(
      { id: 1 },
      'impacta-secret-key-2026-dev-only' // mesma do middleware
    );

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };

    const res = {};
    const next = jest.fn();

    autenticar(req, res, next);

    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe(1);
    expect(next).toHaveBeenCalled();
  });

  test('token ausente retorna 401', () => {
    const req = criarMockReq({});
    const res = criarMockRes();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('token inválido retorna 401', () => {
    const req = criarMockReq({ authorization: 'Bearer invalid.token' });
    const res = criarMockRes();
    const next = jest.fn();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('Autorização (Próprio Usuário)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('mesmos IDs passa', () => {
    const req = {
      usuario: { id: 1 },
      params: { id: '1' }
    };

    const res = criarMockRes();
    const next = jest.fn();

    autorizarProprio(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('IDs diferentes retorna 403', () => {
    const req = {
      usuario: { id: 1 },
      params: { id: '2' }
    };

    const res = criarMockRes();
    const next = jest.fn();

    autorizarProprio(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});