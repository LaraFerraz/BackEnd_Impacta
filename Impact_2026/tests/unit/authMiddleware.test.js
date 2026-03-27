const { autenticar, autorizarProprio } = require('../../src/middleware/authMiddleware');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'impacta-secret-key-2026';

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

const next = jest.fn();

describe('Autenticação JWT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('token válido passa', () => {
    const token = jwt.sign({ id: 1, email: 'user@test.com' }, JWT_SECRET, { expiresIn: '7d' });
    const req = criarMockReq({ authorization: `Bearer ${token}` });
    const res = criarMockRes();

    autenticar(req, res, next);

    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe(1);
    expect(next).toHaveBeenCalled();
  });

  test('token ausente retorna 401', () => {
    const req = criarMockReq({});
    const res = criarMockRes();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('token inválido retorna 401', () => {
    const req = criarMockReq({ authorization: 'Bearer invalid.token' });
    const res = criarMockRes();

    autenticar(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('Autorização (Próprio Usuário)', () => {
  test('mesmos IDs passa', () => {
    const req = criarMockReq();
    req.usuario = { id: 1 };
    req.params = { id: '1' };
    const res = criarMockRes();

    autorizarProprio(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('IDs diferentes retorna 403', () => {
    const req = criarMockReq();
    req.usuario = { id: 1 };
    req.params = { id: '2' };
    const res = criarMockRes();

    autorizarProprio(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
