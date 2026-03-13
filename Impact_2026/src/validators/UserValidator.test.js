/**
 * Testes para validadores de usuário
 * Testa: email, CPF, telefone, força de senha
 */

const {
  validarEmail,
  validarCPF,
  validarTelefone,
  validarForcaSenha
} = require('../../src/validators/UserValidator');

describe('Validação de Email', () => {
  test('válido', () => {
    expect(validarEmail('user@email.com')).toBe(true);
  });

  test('inválido - sem @', () => {
    expect(validarEmail('useremail.com')).toBe(false);
  });

  test('inválido - vazio', () => {
    expect(validarEmail('')).toBe(false);
  });
});

describe('Validação de CPF', () => {
  test('válido com formatação', () => {
    expect(validarCPF('123.456.789-09')).toBe(true);
  });

  test('válido sem formatação', () => {
    expect(validarCPF('12345678909')).toBe(true);
  });

  test('inválido - dígitos iguais', () => {
    expect(validarCPF('111.111.111-11')).toBe(false);
  });

  test('inválido - tamanho', () => {
    expect(validarCPF('123.456')).toBe(false);
  });
});

describe('Validação de Telefone', () => {
  test('válido', () => {
    expect(validarTelefone('(11) 9999-9999')).toBe(true);
  });

  test('válido sem formatação', () => {
    expect(validarTelefone('11999999999')).toBe(true);
  });

  test('inválido - muito curto', () => {
    expect(validarTelefone('1199')).toBe(false);
  });
});

describe('Validação de Força de Senha', () => {
  test('retorna objeto correto', () => {
    const resultado = validarForcaSenha('Test123!');
    expect(resultado).toHaveProperty('valida');
    expect(resultado).toHaveProperty('nivel');
    expect(resultado).toHaveProperty('mensagem');
  });

  test('fraca com critérios baixos', () => {
    const resultado = validarForcaSenha('abc');
    expect(resultado.valida).toBe(false);
  });

  test('forte com critérios altos', () => {
    const resultado = validarForcaSenha('MyP@ssw0rd');
    expect(resultado.valida).toBe(true);
  });
});
