const express = require('express');
const { Tipo_usuario, Usuario } = require('../models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

const ITEMS_POR_PAGINA = 10;
const ATRIBUTOS = ['id', 'nome'];

router.get('/', async (req, res) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.page) || 1);
    const limit = ITEMS_POR_PAGINA;
    const offset = (pagina - 1) * ITEMS_POR_PAGINA;

    const { count, rows } = await Tipo_usuario.findAndCountAll({
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

    const totalPaginas = Math.ceil(count / ITEMS_POR_PAGINA);

    res.json({
      dados: rows,
      paginacao: { paginaAtual: pagina, totalPaginas, total: count }
    });

  } catch (error) {
    console.error('Erro ao listar tipos de usuário:', error);
    res.status(500).json({
      message: 'Erro ao listar tipos de usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tipo = await Tipo_usuario.findByPk(req.params.id, {
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
      return res.status(404).json({ message: 'Tipo de usuário não encontrado' });
    }

    res.json(tipo);

  } catch (error) {
    console.error('Erro ao buscar tipo de usuário:', error);
    res.status(500).json({
      message: 'Erro ao buscar tipo de usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.post('/', autenticar, async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Nome do tipo é obrigatório',
        field: 'nome'
      });
    }

    const tipoExistente = await Tipo_usuario.findOne({
      where: { nome: nome.trim() }
    });

    if (tipoExistente) {
      return res.status(409).json({
        message: 'Tipo de usuário já existe',
        field: 'nome'
      });
    }

    const novoTipo = await Tipo_usuario.create({
      nome: nome.trim()
    });

    res.status(201).json({
      message: 'Tipo de usuário criado com sucesso',
      data: novoTipo
    });

  } catch (error) {
    console.error('Erro ao criar tipo de usuário:', error);
    res.status(500).json({
      message: 'Erro ao criar tipo de usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.put('/:id', autenticar, async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Nome do tipo é obrigatório',
        field: 'nome'
      });
    }

    const tipo = await Tipo_usuario.findByPk(req.params.id);

    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de usuário não encontrado' });
    }

    // Verifica se novo nome já existe
    if (nome.trim() !== tipo.nome) {
      const tipoExistente = await Tipo_usuario.findOne({
        where: { nome: nome.trim() }
      });

      if (tipoExistente) {
        return res.status(409).json({
          message: 'Tipo de usuário já existe',
          field: 'nome'
        });
      }
    }

    await tipo.update({ nome: nome.trim() });

    res.json({
      message: 'Tipo de usuário atualizado com sucesso',
      data: tipo
    });

  } catch (error) {
    console.error('Erro ao atualizar tipo de usuário:', error);
    res.status(500).json({
      message: 'Erro ao atualizar tipo de usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.delete('/:id', autenticar, async (req, res) => {
  try {
    const tipo = await Tipo_usuario.findByPk(req.params.id);

    if (!tipo) {
      return res.status(404).json({ message: 'Tipo de usuário não encontrado' });
    }

    // Verifica se há usuários associados
    const usuariosCount = await Usuario.count({
      where: { tipo_usuario_id: req.params.id }
    });

    if (usuariosCount > 0) {
      return res.status(409).json({
        message: 'Não é possível deletar tipo com usuários associados',
        usuariosCount
      });
    }

    await tipo.destroy();

    res.json({ message: 'Tipo de usuário deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar tipo de usuário:', error);
    res.status(500).json({
      message: 'Erro ao deletar tipo de usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
