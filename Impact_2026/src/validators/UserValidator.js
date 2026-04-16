const {
  validateEmail,
  validateCPF,
  validatePhone,
  validatePasswordStrength
} = require('../../../../shared/validators.js');

// Adapters para usar a API centralizada (front-end usa { valid }, backend usa { valido })
const validarEmail = (email) => {
  const result = validateEmail(email);
  return {
    valido: result.valid,
    ...((!result.valid) && { message: result.message })
  };
};
const validarTelefone = (telefone) => {
  const result = validatePhone(telefone);
  return {
    valido: result.valid,
    ...((!result.valid) && {
      detalhes: {
        numDigitos: telefone.replace(/\D/g, '').length,
        formatoEsperado: '(11) 9999-9999 ou 11999999999'
      }
    })
  };
};
const validarCPF = (cpf) => {
  const result = validateCPF(cpf);
  return {
    valido: result.valid,
    ...((!result.valid) && { problema: result.message })
  };
};

const validarForcaSenha = (senha) => {
  const result = validatePasswordStrength(senha);
  return {
    valida: result.valid,
    nivel: result.strength,
    mensagem: result.message,
    faltando: result.missing,
    detalhes: result.suggestion
  };
};


/**
 * Middleware: Valida dados para cadastro de novo usuário
 * Valida: nome, email, CPF, telefone, senha (força)
 */
const validarCadastro = (req, res, next) => {
  const { nome, email, password, cpf, telefone } = req.body;
  const errors = [];

  // Validar nome
  if (!nome || !nome.trim()) {
    errors.push({ 
      field: 'nome', 
      message: '❌ Nome é obrigatório',
      problema: 'Campo vazio'
    });
  } else if (nome.trim().length < 2) {
    errors.push({ 
      field: 'nome', 
      message: '❌ Nome muito curto',
      problema: `Mínimo 2 caracteres (você digitou ${nome.trim().length})`
    });
  } else if (nome.trim().length > 100) {
    errors.push({ 
      field: 'nome', 
      message: '❌ Nome muito longo',
      problema: `Máximo 100 caracteres (você digitou ${nome.trim().length})`
    });
  }

  // Validar email
  if (!email || !email.trim()) {
    errors.push({ 
      field: 'email', 
      message: '❌ Email é obrigatório',
      problema: 'Campo vazio'
    });
  } else if (!validarEmail(email)) {
    errors.push({ 
      field: 'email', 
      message: '❌ Email inválido',
      problema: `Formato esperado: seu.email@dominio.com.br`
    });
  }

  // Validar CPF
  if (!cpf || !cpf.trim()) {
    errors.push({ 
      field: 'cpf', 
      message: '❌ CPF é obrigatório',
      problema: 'Campo vazio'
    });
  } else {
    const validacaoCPF = validarCPF(cpf);
    if (!validacaoCPF.valido) {
      errors.push({
        field: 'cpf',
        message: '❌ CPF inválido',
        problema: validacaoCPF.problema
      });
    }
  }

  // Validar telefone
  if (!telefone || !telefone.trim()) {
    errors.push({ 
      field: 'telefone', 
      message: '❌ Telefone é obrigatório',
      problema: 'Campo vazio'
    });
  } else {
    const validacaoTelefone = validarTelefone(telefone);
    if (!validacaoTelefone.valido) {
      errors.push({ 
        field: 'telefone', 
        message: '❌ Telefone inválido',
        problema: `Use o formato: (11) 9999-9999 ou 11999999999. Você digitou: ${telefone.trim()}`
      });
    }
  }

  // Validar senha com força
  if (!password || !password.trim()) {
    errors.push({ 
      field: 'password', 
      message: '❌ Senha é obrigatória',
      problema: 'Campo vazio'
    });
  } else {
    const forcaSenha = validarForcaSenha(password);
    if (!forcaSenha.valida) {
      errors.push({
        field: 'password',
        message: `❌ Senha ${forcaSenha.nivel}`,
        problema: forcaSenha.detalhes || `Mínimo: 6 caracteres com números e letras`
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Dados inválidos - Veja os problemas abaixo', 
      errors 
    });
  }

  next();
};

const validarLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validar email
  if (!email || !email.trim()) {
    errors.push({ 
      field: 'email', 
      message: '❌ Email é obrigatório',
      problema: 'Campo vazio'
    });
  } else if (!validarEmail(email)) {
    errors.push({ 
      field: 'email', 
      message: '❌ Email inválido',
      problema: 'Formato esperado: seu.email@dominio.com.br'
    });
  }

  // Validar senha
  if (!password || !password.trim()) {
    errors.push({ 
      field: 'password', 
      message: '❌ Senha é obrigatória',
      problema: 'Campo vazio'
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Preenchimento incorreto - Veja os problemas abaixo',
      errors
    });
  }

  next();
};


/**
 * Middleware: Valida dados para atualização de perfil
 * Email NÃO pode ser alterado (apenas nome, telefone, senha com força)
 */
const validarAtualizacao = (req, res, next) => {
  const { nome, telefone, password, cpf } = req.body;
  const errors = [];

  // Proíbe alteração de email
  if (req.body.email !== undefined) {
    errors.push({
      field: 'email',
      message: '❌ Email não pode ser alterado',
      problema: 'Por segurança, o email é imutável'
    });
  }

  // Validar nome (se fornecido)
  if (nome !== undefined) {
    if (!nome || !nome.trim()) {
      errors.push({ 
        field: 'nome', 
        message: '❌ Nome não pode estar vazio',
        problema: 'O campo nome é obrigatório'
      });
    } else if (nome.trim().length < 2) {
      errors.push({ 
        field: 'nome', 
        message: '❌ Nome muito curto',
        problema: `Mínimo 2 caracteres (você digitou ${nome.trim().length})`
      });
    } else if (nome.trim().length > 100) {
      errors.push({ 
        field: 'nome', 
        message: '❌ Nome muito longo',
        problema: `Máximo 100 caracteres (você digitou ${nome.trim().length})`
      });
    }
  }

  // Validar telefone (se fornecido)
  if (telefone !== undefined) {
    if (!telefone || !telefone.trim()) {
      errors.push({ 
        field: 'telefone', 
        message: '❌ Telefone não pode estar vazio',
        problema: 'O campo telefone é obrigatório'
      });
    } else {
      const validacaoTelefone = validarTelefone(telefone);
      if (!validacaoTelefone.valido) {
        errors.push({ 
          field: 'telefone', 
          message: '❌ Telefone inválido',
          problema: `Use o formato: (11) 9999-9999 ou 11999999999`
        });
      }
    }
  }

  // Validar CPF (se fornecido)
  if (cpf !== undefined) {
    if (!cpf || !cpf.trim()) {
      errors.push({ 
        field: 'cpf', 
        message: '❌ CPF não pode estar vazio',
        problema: 'O campo CPF é obrigatório'
      });
    } else {
      const validacaoCPF = validarCPF(cpf);
      if (!validacaoCPF.valido) {
        errors.push({
          field: 'cpf',
          message: '❌ CPF inválido',
          problema: validacaoCPF.problema
        });
      }
    }
  }

  // Validar senha (se fornecida e não vazia)
  if (password !== undefined && password && password.trim()) {
    const forcaSenha = validarForcaSenha(password);
    if (!forcaSenha.valida) {
      errors.push({
        field: 'password',
        message: `❌ Senha ${forcaSenha.nivel}`,
        problema: forcaSenha.detalhes || `Mínimo: 6 caracteres com números e letras`
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Dados inválidos - Veja os problemas abaixo', 
      errors 
    });
  }

  next();
};

module.exports = {
  validarCadastro,
  validarLogin,
  validarAtualizacao,
  validarEmail,
  validarTelefone,
  validarCPF,
  validarForcaSenha
};