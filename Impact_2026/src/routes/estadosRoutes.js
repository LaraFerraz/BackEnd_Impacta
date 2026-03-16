const express = require('express');
const { Estado, Pais, Cidade } = require('../models');
const { autenticar } = require('../middleware/authMiddleware');

const router = express.Router();

const ITEMS_POR_PAGINA = 10;
const ATRIBUTOS = ['id', 'nome', 'sigla', 'pais_id'];

router.get('/', async (req, res) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.page) || 1);
    const limit = ITEMS_POR_PAGINA;
    const offset = (pagina - 1) * ITEMS_POR_PAGINA;

    const { count, rows } = await Estado.findAndCountAll({
      attributes: ATRIBUTOS,
      include: [
        { model: Pais, as: 'pais', attributes: ['id', 'nome'] },
        { model: Cidade, as: 'cidades', attributes: ['id', 'nome'] }
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
    console.error('Erro ao listar estados:', error);
    res.status(500).json({
      message: 'Erro ao listar estados',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const estado = await Estado.findByPk(req.params.id, {
      attributes: ATRIBUTOS,
      include: [
        { model: Pais, as: 'pais', attributes: ['id', 'nome'] },
        { model: Cidade, as: 'cidades', attributes: ['id', 'nome'] }
      ]
    });

    if (!estado) {
      return res.status(404).json({ message: 'Estado não encontrado' });
    }

    res.json(estado);

  } catch (error) {
    console.error('Erro ao buscar estado:', error);
    res.status(500).json({
      message: 'Erro ao buscar estado',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.post('/', autenticar, async (req, res) => {
  try {
    const { nome, sigla, pais_id } = req.body;

    const erros = [];
    if (!nome || !nome.trim()) erros.push({ field: 'nome', message: 'Nome é obrigatório' });
    if (!sigla || !sigla.trim()) erros.push({ field: 'sigla', message: 'Sigla é obrigatória' });
    if (!pais_id) erros.push({ field: 'pais_id', message: 'País é obrigatório' });

    if (erros.length > 0) {
      return res.status(400).json({ message: 'Dados inválidos', errors: erros });
    }

    // Verifica se país existe
    const paisExistente = await Pais.findByPk(pais_id);
    if (!paisExistente) {
      return res.status(404).json({ message: 'País não encontrado' });
    }

    // Verifica se estado já existe
    const estadoExistente = await Estado.findOne({
      where: { nome: nome.trim(), pais_id }
    });

    if (estadoExistente) {
      return res.status(409).json({
        message: 'Estado já existe para este país',
        field: 'nome'
      });
    }

    const novoEstado = await Estado.create({
      nome: nome.trim(),
      sigla: sigla.trim().toUpperCase(),
      pais_id
    });

    res.status(201).json({
      message: 'Estado criado com sucesso',
      data: novoEstado
    });

  } catch (error) {
    console.error('Erro ao criar estado:', error);
    res.status(500).json({
      message: 'Erro ao criar estado',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.put('/:id', autenticar, async (req, res) => {
  try {
    const { nome, sigla, pais_id } = req.body;

    const estado = await Estado.findByPk(req.params.id);

    if (!estado) {
      return res.status(404).json({ message: 'Estado não encontrado' });
    }

    const atualizacao = {};
    
    if (nome && nome.trim()) {
      atualizacao.nome = nome.trim();
    }
    if (sigla && sigla.trim()) {
      atualizacao.sigla = sigla.trim().toUpperCase();
    }
    if (pais_id) {
      const paisExistente = await Pais.findByPk(pais_id);
      if (!paisExistente) {
        return res.status(404).json({ message: 'País não encontrado' });
      }
      atualizacao.pais_id = pais_id;
    }

    await estado.update(atualizacao);

    res.json({
      message: 'Estado atualizado com sucesso',
      data: estado
    });

  } catch (error) {
    console.error('Erro ao atualizar estado:', error);
    res.status(500).json({
      message: 'Erro ao atualizar estado',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

router.delete('/:id', autenticar, async (req, res) => {
  try {
    const estado = await Estado.findByPk(req.params.id);

    if (!estado) {
      return res.status(404).json({ message: 'Estado não encontrado' });
    }

    // Verifica se há cidades associadas
    const cidadesCount = await Cidade.count({
      where: { estado_id: req.params.id }
    });

    if (cidadesCount > 0) {
      return res.status(409).json({
        message: 'Não é possível deletar estado com cidades associadas'
      });
    }

    await estado.destroy();

    res.json({ message: 'Estado deletado com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar estado:', error);
    res.status(500).json({
      message: 'Erro ao deletar estado',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
