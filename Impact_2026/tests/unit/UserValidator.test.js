// Define o ambiente de teste de forma explícita
process.env.NODE_ENV = 'test';

const {
  validarEmail,
  validarCPF,
  validarTelefone,
  validarForcaSenha
} = require('../../src/validators/UserValidator');

// =========================================================================
// Suíte de Testes 1: Formato de Correio Eletrônico (Email)
// =========================================================================
describe('Testes Unitários - Validador de Email (validarEmail)', () => {
  
  test('Deve retornar valido true quando o formato do email for sintaticamente correto', () => {
    const resultado = validarEmail('usuario@dominio.com');
    expect(resultado.valido).toBe(true);
  });

  test('Deve retornar valido false quando o endereço de email omitir o caractere arroba (@)', () => {
    const resultado = validarEmail('usuariodominio.com');
    expect(resultado.valido).toBe(false);
  });

  test('Deve retornar valido false quando o valor fornecido for uma string vazia', () => {
    const resultado = validarEmail('');
    expect(resultado.valido).toBe(false);
  });
});

// =========================================================================
// Suíte de Testes 2: Cadastro de Pessoas Físicas (CPF)
// =========================================================================
describe('Testes Unitários - Validador de CPF (validarCPF)', () => {
  
  test('Deve retornar valido true quando for um CPF matematicamente correto e possuir pontuação', () => {
    // Nota: Certifique-se de que o número abaixo passa no algoritmo real de dígito verificador da sua lib compartilhada
    const resultado = validarCPF('123.456.789-09'); 
    expect(resultado.valido).toBe(true);
  });

  test('Deve retornar valido true quando for unicamente uma sequência numérica contendo os 11 dígitos corretos', () => {
    const resultado = validarCPF('12345678909');
    expect(resultado.valido).toBe(true);
  });

  test('Deve retornar valido false quando a sequência possuir todos os dígitos idênticos (rejeição de máscara)', () => {
    const resultado = validarCPF('111.111.111-11');
    expect(resultado.valido).toBe(false);
  });

  test('Deve retornar valido false quando a extensão de caracteres for insuficiente', () => {
    const resultado = validarCPF('123.456');
    expect(resultado.valido).toBe(false);
  });
});

// =========================================================================
// Suíte de Testes 3: Contatos Telefônicos (Telefone)
// =========================================================================
describe('Testes Unitários - Validador de Telefone (validarTelefone)', () => {
  
  test('Deve retornar valido true quando o número possuir máscara de telefone padrão válida', () => {
    const resultado = validarTelefone('(11) 99999-9999');
    expect(resultado.valido).toBe(true);
  });

  test('Deve retornar valido true quando for uma sequência limpa contendo código de área e o número móvel', () => {
    const resultado = validarTelefone('11999999999');
    expect(resultado.valido).toBe(true);
  });

  test('Deve retornar valido false quando a quantidade de dígitos numéricos extraídos for inferior ao mínimo aceitável', () => {
    const resultado = validarTelefone('1199');
    expect(resultado.valido).toBe(false);
  });
});

// =========================================================================
// Suíte de Testes 4: Robustez de Segurança Criptográfica (Senha)
// =========================================================================
describe('Testes Unitários - Validador de Complexidade de Senha (validarForcaSenha)', () => {
  
  test('Deve retornar a estrutura de contrato correta exigida pela API corporativa', () => {
    const resultado = validarForcaSenha('StrongPassword123!');
    
    // Ajustado para bater com a nova assinatura de chaves unificadas do backend
    expect(resultado).toHaveProperty('valido');
    expect(resultado).toHaveProperty('nivel');
    expect(resultado).toHaveProperty('detalhes');
    expect(resultado).not.toHaveProperty('mensagem'); // Valida a ausência da chave legada descontinuada
  });

  test('Deve retornar valido false quando a string não cumprir os critérios de tamanho mínimo', () => {
    const resultado = validarForcaSenha('abc');
    expect(resultado.valido).toBe(false);
  });

  test('Deve retornar valido true quando a composição contiver letras maiúsculas, minúsculas, números e caracteres especiais', () => {
    const resultado = validarForcaSenha('MyP@ssw0rd2026!');
    expect(resultado.valido).toBe(true);
  });
});
