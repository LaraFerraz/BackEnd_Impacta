// Validador de dados de usuário com regex e regras de negócio
// Segue boas práticas: funções pequenas (max 10 linhas) e específicas

/**
 * Valida formato de email usando regex RFC5322
 * @param {string} email - Email a validar
 * @returns {boolean} - Email é válido
 */
const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida formato de telefone brasileiro
 * @param {string} telefone - Telefone a validar
 * @returns {boolean} - Telefone é válido
 */
const validarTelefone = (telefone) => {
  const telefoneRegex = /^[\d\s\-\(\)]{10,20}$/;
  return telefoneRegex.test(telefone.replace(/\s/g, ''));
};

/**
 * Valida CPF usando algoritmo de dígito verificador
 * @param {string} cpf - CPF a validar
 * @returns {boolean} - CPF é válido
 */
const validarCPF = (cpf) => {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11 || /^(\d)\1{10}$/.test(cpfLimpo)) {
    return false;
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  const d1 = 11 - (soma % 11);

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  const d2 = 11 - (soma % 11);

  return d1 === parseInt(cpfLimpo.charAt(10)) && d2 === parseInt(cpfLimpo.charAt(11));
};

/**
 * Valida força da senha usando critérios de segurança
 * Retorna nível: fraca, média ou forte
 * @param {string} senha - Senha a analisar
 * @returns {object} - { valida: boolean, nivel: string, mensagem: string }
 */
const validarForcaSenha = (senha) => {
  const criterios = {
    tamanho: senha.length >= 8,
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /\d/.test(senha),
    especial: /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(senha)
  };

  const criteriosAtingidos = Object.values(criterios).filter(Boolean).length;

  let nivel = 'fraca';
  if (criteriosAtingidos >= 4) {
    nivel = 'forte';
  } else if (criteriosAtingidos >= 3) {
    nivel = 'media';
  }

  const valida = criteriosAtingidos >= 2 && senha.length >= 6;

  return {
    valida,
    nivel,
    mensagem: `Senha ${nivel} (${criteriosAtingidos}/5 critérios)`
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
    errors.push({ field: 'nome', message: 'Nome é obrigatório' });
  } else if (nome.trim().length < 2) {
    errors.push({ field: 'nome', message: 'Nome deve ter pelo menos 2 caracteres' });
  } else if (nome.trim().length > 100) {
    errors.push({ field: 'nome', message: 'Nome deve ter no máximo 100 caracteres' });
  }

  // Validar email
  if (!email || !email.trim()) {
    errors.push({ field: 'email', message: 'Email é obrigatório' });
  } else if (!validarEmail(email)) {
    errors.push({ field: 'email', message: 'Email deve ser válido' });
  }

  // Validar CPF
  if (!cpf || !cpf.trim()) {
    errors.push({ field: 'cpf', message: 'CPF é obrigatório' });
  } else if (!validarCPF(cpf)) {
    errors.push({ field: 'cpf', message: 'CPF inválido' });
  }

  // Validar telefone
  if (!telefone || !telefone.trim()) {
    errors.push({ field: 'telefone', message: 'Telefone é obrigatório' });
  } else if (!validarTelefone(telefone)) {
    errors.push({ field: 'telefone', message: 'Telefone deve ser válido' });
  }

  // Validar senha com força
  if (!password || !password.trim()) {
    errors.push({ field: 'password', message: 'Senha é obrigatória' });
  } else {
    const forcaSenha = validarForcaSenha(password);
    if (!forcaSenha.valida) {
      errors.push({
        field: 'password',
        message: 'Senha fraca. Deve ter 6+ caracteres com letras, números e símbolos'
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos', errors });
  }

  next();
};

const validarLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validar email
  if (!email || !email.trim()) {
    errors.push({ field: 'email', message: 'Email é obrigatório' });
  } else if (!validarEmail(email)) {
    errors.push({ field: 'email', message: 'Email deve ser válido' });
  }

  // Validar senha
  if (!password || !password.trim()) {
    errors.push({ field: 'password', message: 'Senha é obrigatória' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Dados inválidos',
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
      message: 'Email não pode ser alterado'
    });
  }

  // Validar nome (se fornecido)
  if (nome !== undefined) {
    if (!nome || !nome.trim()) {
      errors.push({ field: 'nome', message: 'Nome não pode estar vazio' });
    } else if (nome.trim().length < 2) {
      errors.push({ field: 'nome', message: 'Nome deve ter pelo menos 2 caracteres' });
    } else if (nome.trim().length > 100) {
      errors.push({ field: 'nome', message: 'Nome deve ter no máximo 100 caracteres' });
    }
  }

  // Validar telefone (se fornecido)
  if (telefone !== undefined) {
    if (!telefone || !telefone.trim()) {
      errors.push({ field: 'telefone', message: 'Telefone não pode estar vazio' });
    } else if (!validarTelefone(telefone)) {
      errors.push({ field: 'telefone', message: 'Telefone deve ser válido' });
    }
  }

  // Validar CPF (se fornecido)
  if (cpf !== undefined) {
    if (!cpf || !cpf.trim()) {
      errors.push({ field: 'cpf', message: 'CPF não pode estar vazio' });
    } else if (!validarCPF(cpf)) {
      errors.push({ field: 'cpf', message: 'CPF inválido' });
    }
  }

  // Validar senha (se fornecida)
  if (password !== undefined && password.trim()) {
    const forcaSenha = validarForcaSenha(password);
    if (!forcaSenha.valida) {
      errors.push({
        field: 'password',
        message: 'Senha fraca. Deve ter 6+ caracteres com letras, números e símbolos'
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Dados inválidos', errors });
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