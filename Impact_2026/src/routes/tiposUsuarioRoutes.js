const express = require('express');
const { TipoUsuario, Usuario } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

const ITEMS_POR_PAGINA = 10;
const ATRIBUTOS = ['id', 'nome'];

// GET /api/tipos-usuario - Listar tipos de usuário com paginação
router.get('/', async (req, res, next) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = ITEMS_POR_PAGINA;
    const offset = (pagina - 1) * limit;

    const { count, rows } = await TipoUsuario.findAndCountAll({
      attributes: ATRIBUTOS,
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nome'],
          required: false
        }
      ],
      order: [['nome', 'ASC']],
      limit,
      offset
    });

    const totalPaginas = Math.ceil(count / limit);

    return res.json({
      data: rows,
      pagination: {
        pagina_atual: pagina,
        total_paginas: totalPaginas,
        total: count
      }
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/tipos-usuario/:id - Buscar tipo de usuário detalhado por ID
router.get('/:id', async (req, res, next) => {
  try {
    const tipo = await TipoUsuario.findByPk(req.params.id, {
      attributes: ATRIBUTOS,
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nome', 'email'],
          required: false
        }
      ]
    });

    if (!tipo) {
      return res.status(404).json({
        message: 'Tipo de usuário não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    return res.json({ data: tipo });
  } catch (error) {
    return next(error);
  }
});

// POST /api/tipos-usuario - Criar novo tipo de usuário
router.post('/', autenticar, async (req, res, next) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Nome do tipo é obrigatório', field: 'nome' }]
      });
    }

    // Criamos diretamente. O índice UNIQUE da coluna 'nome' no banco de dados 
    // será pego automaticamente pelo seu errorHandler global (disparando um 409 Conflict)
    const novoTipo = await TipoUsuario.create({
      nome: nome.trim()
    });

    return res.status(201).json({
      message: 'Tipo de usuário criado com sucesso',
      data: novoTipo
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /api/tipos-usuario/:id - Atualizar nome de um tipo de usuário
router.put('/:id', autenticar, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        errors: [{ message: 'Nome do tipo é obrigatório', field: 'nome' }]
      });
    }

    const tipo = await TipoUsuario.findByPk(id);

    if (!tipo) {
      return res.status(404).json({
        message: 'Tipo de usuário não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Atualiza o nome. Se violar a restrição UNIQUE, o erro flui nativamente para o interceptador
    await tipo.update({ nome: nome.trim() });

    return res.json({
      message: 'Tipo de usuário atualizado com sucesso',
      data: tipo
    });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/tipos-usuario/:id - Remover tipo de usuário (Se não houver vínculos ativos)
router.delete('/:id', autenticar, async (req, res, next) => {
  try {
    const { id } = req.params;
    const tipo = await TipoUsuario.findByPk(id);

    if (!tipo) {
      return res.status(404).json({
        message: 'Tipo de usuário não encontrado',
        code: 'NOT_FOUND_ERROR'
      });
    }

    // Validação de integridade referencial manual (Evita quebra lógica antes do DB barrar)
    const usuariosCount = await Usuario.count({
      where: { tipo_usuario_id: id }
    });

    if (usuariosCount > 0) {
      return res.status(409).json({
        message: 'Conflito de integridade',
        code: 'CONFLICT_ERROR',
        errors: [{ message: 'Não é possível deletar um tipo que possui usuários associados', usuarios_vinculados: usuariosCount }]
      });
    }

    await tipo.destroy();
    return res.json({ message: 'Tipo de usuário deletado com sucesso' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
