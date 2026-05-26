// shared/validators.js

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return {
    valid: regex.test(email),
    message: regex.test(email)
      ? null
      : 'Email inválido'
  };
};

const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');

  if (cpf.length !== 11) {
    return {
      valid: false,
      message: 'CPF deve conter 11 dígitos'
    };
  }

  return {
    valid: true,
    message: null
  };
};

const validatePhone = (phone) => {
  const regex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

  return {
    valid: regex.test(phone)
  };
};

const validatePasswordStrength = (password) => {
  const strong =
    password.length >= 6 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password);

  return {
    valid: strong,
    strength: strong ? 'forte' : 'fraca',
    suggestion: strong
      ? null
      : 'A senha deve ter pelo menos 6 caracteres com letras e números'
  };
};

module.exports = {
  validateEmail,
  validateCPF,
  validatePhone,
  validatePasswordStrength
};