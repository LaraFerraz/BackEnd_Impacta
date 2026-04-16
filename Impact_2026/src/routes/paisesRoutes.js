const express = require('express');
const { Pais, Estado } = require('../middleware/models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

const ITEMS_POR_PAGINA = 10;
const ATRIBUTOS = ['id', 'nome'];

router.get('/', async (req, res) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.page) || 1);
    const limit = ITEMS_POR_PAGINA;
    const offset = (pagina - 1) * ITEMS_POR_PAGINA;

    const { count, rows } = await Pais.findAndCountAll({
      attributes: ATRIBUTOS,
      include: [
        {
          model: Estado,
          as: 'estados',
          attributes: ['id', 'nome', 'sigla']
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
    console.error('Erro ao listar países:', error);
    res.status(500).json({
      message: 'Erro ao listar países',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pais = await Pais.findByPk(req.params.id, {
      attributes: ATRIBUTOS,
      include: [
        {
          model: Estado,
          as: 'estados',
          attributes: ['id', 'nome', 'sigla']
        }
      ]
    });

    if (!pais) {
      return res.status(404).json({ message: 'País não encontrado' });
    }

    res.json(pais);

  } catch (error) {
    console.error('Erro ao buscar país:', error);
    res.status(500).json({
      message: 'Erro ao buscar país',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.post('/', autenticar, async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Nome do país é obrigatório',
        field: 'nome'
      });
    }

    const paisExistente = await Pais.findOne({
      where: { nome: nome.trim() }
    });

    if (paisExistente) {
      return res.status(409).json({
        message: 'País já existe',
        field: 'nome'
      });
    }

    const novoPais = await Pais.create({
      nome: nome.trim()
    });

    res.status(201).json({
      message: 'País criado com sucesso',
      data: novoPais
    });

  } catch (error) {
    console.error('Erro ao criar país:', error);
    res.status(500).json({
      message: 'Erro ao criar país',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.put('/:id', autenticar, async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({
        message: 'Nome do país é obrigatório',
        field: 'nome'
      });
    }

    const pais = await Pais.findByPk(req.params.id);

    if (!pais) {
      return res.status(404).json({ message: 'País não encontrado' });
    }

    // Verifica se novo nome já existe
    if (nome.trim() !== pais.nome) {
      const paisExistente = await Pais.findOne({
        where: { nome: nome.trim() }
      });

      if (paisExistente) {
        return res.status(409).json({
          message: 'País já existe',
          field: 'nome'
        });
      }
    }

    await pais.update({ nome: nome.trim() });

    res.json({
      message: 'País atualizado com sucesso',
      data: pais
    });

  } catch (error) {
    console.error('Erro ao atualizar país:', error);
    res.status(500).json({
      message: 'Erro ao atualizar país',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.delete('/:id', autenticar, async (req, res) => {
  try {
    const pais = await Pais.findByPk(req.params.id);

    if (!pais) {
      return res.status(404).json({ message: 'País não encontrado' });
    }

    // Verifica se há estados associados
    const estadosCount = await Estado.count({
      where: { pais_id: req.params.id }
    });

    if (estadosCount > 0) {
      return res.status(409).json({
        message: 'Não é possível deletar país com estados associados'
      });
    }

    await pais.destroy();

    res.json({ message: 'País deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar país:', error);
    res.status(500).json({
      message: 'Erro ao deletar país',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
