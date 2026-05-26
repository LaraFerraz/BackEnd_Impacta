// Define o ambiente de teste antes de qualquer outra operação
process.env.NODE_ENV = 'test';

const { autorizarProprio } = require('../../src/middleware/authMiddleware');

describe('Testes Unitários - Middleware de Autorização (authMiddleware)', () => {
  
  let mockRequest;
  let mockResponse;
  let nextFunction;

  // Inicializa e limpa as estruturas de mock do Express antes de cada caso de teste
  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  test('Deve retornar 403 Forbidden quando o ID do usuário autenticado for diferente do ID do parâmetro da rota', () => {
    // Cenário: Token pertence ao ID 1, mas a requisição tenta modificar/acessar o ID 2
    mockRequest.usuario = { id: 1 };
    mockRequest.params = { id: '2' };

    autorizarProprio(mockRequest, mockResponse, nextFunction);

    // Asserções: Garante o bloqueio seguro e padronizado com o contrato corporativo
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Acesso negado: Você não tem permissão para alterar ou acessar este perfil',
      code: 'FORBIDDEN_ERROR'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('Deve invocar o gatilho next() com sucesso quando o ID do token coincidir com o ID do parâmetro', () => {
    // Cenário: Token pertence ao ID 1 e a requisição está alterando o seu próprio ID 1
    mockRequest.usuario = { id: 1 };
    mockRequest.params = { id: '1' }; // Passado como string (comportamento nativo de req.params)

    autorizarProprio(mockRequest, mockResponse, nextFunction);

    // Asserções: O ciclo deve continuar sem enviar respostas HTTP prematuras
    expect(nextFunction).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

});

