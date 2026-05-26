const {
  validateEmail,
  validateCPF,
  validatePhone,
  validatePasswordStrength
} = require('../../shared/validators.js');

// =========================================================================
// Adapters de Validação (Tradução de Contrato Compartilhado -> API Backend)
// =========================================================================

const verificarEmail = (email) => {
  const result = validateEmail(email);
  return {
    valido: !!result.valid,
    message: result.message
  };
};

const verificarTelefone = (telefone) => {
  const result = validatePhone(telefone);
  return {
    valido: !!result.valid
  };
};

const verificarCPF = (cpf) => {
  const result = validateCPF(cpf);
  return {
    valido: !!result.valid,
    problema: result.message
  };
};

const verificarForcaSenha = (senha) => {
  const result = validatePasswordStrength(senha);
  return {
    valido: !!result.valid,
    nivel: result.strength,
    detalhes: result.suggestion
  };
};

// =========================================================================
// Middlewares de Validação Excedente (Express)
// =========================================================================

/**
 * Middleware: Valida dados para cadastro de novo usuário
 */
const validarCadastro = (req, res, next) => {
  const { nome, email, password, cpf, telefone } = req.body;
  const errors = [];

  // Validar nome
  if (!nome || !nome.trim()) {
    errors.push({ field: 'nome', message: 'O campo nome é obrigatório' });
  } else {
    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 2) {
      errors.push({ field: 'nome', message: `Nome muito curto. Mínimo 2 caracteres (você digitou ${nomeLimpo.length})` });
    } else if (nomeLimpo.length > 100) {
      errors.push({ field: 'nome', message: `Nome muito longo. Máximo 100 caracteres (você digitou ${nomeLimpo.length})` });
    }
  }

  // Validar email
  if (!email || !email.trim()) {
    errors.push({ field: 'email', message: 'O campo email é obrigatório' });
  } else {
    const emailValidado = verificarEmail(email.trim());
    if (!emailValidado.valido) {
      errors.push({ field: 'email', message: 'Formato de email inválido. Exemplo esperado: seu.email@dominio.com' });
    }
  }

  // Validar CPF
  if (!cpf || !cpf.trim()) {
    errors.push({ field: 'cpf', message: 'O campo CPF é obrigatório' });
  } else {
    const validacaoCPF = verificarCPF(cpf);
    if (!validacaoCPF.valido) {
      errors.push({ field: 'cpf', message: validacaoCPF.problema || 'Número de CPF inválido' });
    }
  }

  // Validar telefone
  if (!telefone || !telefone.trim()) {
    errors.push({ field: 'telefone', message: 'O campo telefone é obrigatório' });
  } else {
    const validacaoTelefone = verificarTelefone(telefone);
    if (!validacaoTelefone.valido) {
      errors.push({ field: 'telefone', message: 'Formato de telefone inválido. Use (11) 99999-9999 ou similar' });
    }
  }

  // Validar senha com força
  if (!password || !password.trim()) {
    errors.push({ field: 'password', message: 'O campo password é obrigatório' });
  } else {
    const forcaSenha = verificarForcaSenha(password);
    if (!forcaSenha.valido) {
      errors.push({
        field: 'password',
        message: forcaSenha.detalhes || `Senha fraca (${forcaSenha.nivel}). Mínimo: 6 caracteres com letras e números`
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  return next();
};

/**
 * Middleware: Valida dados de login
 */
const validarLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push({ field: 'email', message: 'O campo email é obrigatório' });
  } else {
    const emailValidado = verificarEmail(email.trim());
    if (!emailValidado.valido) {
      errors.push({ field: 'email', message: 'Formato de email inválido' });
    }
  }

  if (!password || !password.trim()) {
    errors.push({ field: 'password', message: 'O campo password é obrigatório' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  return next();
};

/**
 * Middleware: Valida dados para atualização de perfil
 */
const validarAtualizacao = (req, res, next) => {
  const { nome, telefone, password, cpf } = req.body;
  const errors = [];

  // Proíbe alteração de email por segurança
  if (req.body.email !== undefined) {
    errors.push({
      field: 'email',
      message: 'Por motivos de segurança, o e-mail da conta não pode ser alterado'
    });
  }

  // Validar nome (se fornecido)
  if (nome !== undefined) {
    if (!nome || !nome.trim()) {
      errors.push({ field: 'nome', message: 'O campo nome não pode estar vazio' });
    } else {
      const nomeLimpo = nome.trim();
      if (nomeLimpo.length < 2) {
        errors.push({ field: 'nome', message: `Nome muito curto. Mínimo 2 caracteres (você digitou ${nomeLimpo.length})` });
      } else if (nomeLimpo.length > 100) {
        errors.push({ field: 'nome', message: `Nome muito longo. Máximo 100 caracteres (você digitou ${nomeLimpo.length})` });
      }
    }
  }

  // Validar telefone (se fornecido)
  if (telefone !== undefined) {
    if (!telefone || !telefone.trim()) {
      errors.push({ field: 'telefone', message: 'O campo telefone não pode estar vazio' });
    } else {
      const validacaoTelefone = verificarTelefone(telefone);
      if (!validacaoTelefone.valido) {
        errors.push({ field: 'telefone', message: 'Formato de telefone inválido' });
      }
    }
  }

  // Validar CPF (se fornecido)
  if (cpf !== undefined) {
    if (!cpf || !cpf.trim()) {
      errors.push({ field: 'cpf', message: 'O campo CPF não pode estar vazio' });
    } else {
      const validacaoCPF = verificarCPF(cpf);
      if (!validacaoCPF.valido) {
        errors.push({ field: 'cpf', message: validacaoCPF.problema || 'Número de CPF inválido' });
      }
    }
  }

  // Validar senha (se fornecida e não vazia)
  if (password !== undefined && password && password.trim()) {
    const forcaSenha = verificarForcaSenha(password);
    if (!forcaSenha.valido) {
      errors.push({
        field: 'password',
        message: forcaSenha.detalhes || `Senha fraca (${forcaSenha.nivel})`
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      errors
    });
  }

  return next();
};

module.exports = {
  validarCadastro,
  validarLogin,
  validarAtualizacao,
  validarEmail: verificarEmail,
  validarTelefone: verificarTelefone,
  validarCPF: verificarCPF,
  validarForcaSenha: verificarForcaSenha
};
