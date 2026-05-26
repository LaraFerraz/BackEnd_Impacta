const express = require('express');
const { Preferencias, Usuario, Categoria } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

// Aplicando autenticação obrigatória em todas as rotas de preferências
router.use(autenticar);

// GET /api/preferencias/usuario/:usuario_id - Listar preferências de um usuário
router.get('/usuario/:usuario_id', async (req, res, next) => {
  try {
    const { usuario_id } = req.params;

    // Segurança: impede que um usuário comum veja as preferências de outra conta
    if (parseInt(usuario_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para visualizar as preferências deste usuário' }]
      });
    }

    const preferencias = await Preferencias.findAll({
      where: { usuario_id },
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] }
      ]
    });

    return res.json({
      data: preferencias,
      total: preferencias.length
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/preferencias/:id - Buscar preferência específica por ID
router.get('/:id', async (req, res, next) => {
  try {
    const preferencia = await Preferencias.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] }
      ]
    });

    if (!preferencia) {
      return res.status(404).json({
        message: 'Preferência não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: garante que o registro pertence ao usuário autenticado antes de exibi-lo
    if (preferencia.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para acessar este recurso' }]
      });
    }

    return res.json({ data: preferencia });
  } catch (error) {
    return next(error);
  }
});

// POST /api/preferencias - Adicionar preferência ao usuário
router.post('/', async (req, res, next) => {
  try {
    const { usuario_id, categoria_id } = req.body;

    if (!usuario_id || !categoria_id) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Campos obrigatórios faltando: usuario_id, categoria_id' }]
      });
    }

    // Segurança: impede um usuário de injetar preferências no ID de outra pessoa
    if (parseInt(usuario_id, 10) !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não pode criar preferências para outra conta' }]
      });
    }

    // Criamos a preferência diretamente. Se o par (usuario_id, categoria_id) quebrar 
    // o índice UNIQUE do banco de dados, o seu errorHandler responderá automaticamente com 409 Conflict.
    const preferencia = await Preferencias.create({
      usuario_id,
      categoria_id
    });

    const preferenciaCompleta = await Preferencias.findByPk(preferencia.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nome', 'email'] },
        { model: Categoria, as: 'categoria', attributes: ['id', 'nome'] }
      ]
    });

    return res.status(201).json({
      message: 'Preferência adicionada com sucesso',
      data: preferenciaCompleta
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/preferencias/:id - Remover preferência
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const preferencia = await Preferencias.findByPk(id);

    if (!preferencia) {
      return res.status(404).json({
        message: 'Preferência não encontrada',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Segurança: impede que uma conta delete a preferência de outra conta
    if (preferencia.usuario_id !== req.usuario.id) {
      return res.status(403).json({
        message: 'Acesso negado',
        code: 'AUTHORIZATION_ERROR',
        errors: [{ message: 'Você não tem permissão para remover esta preferência' }]
      });
    }

    await preferencia.destroy();

    return res.json({ message: 'Preferência removida com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;