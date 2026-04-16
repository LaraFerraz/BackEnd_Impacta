const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Servicos_disponiveis = sequelize.define('Servicos_disponiveis', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    projeto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projeto',
        key: 'id'
      }
    },
    nome_servico: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome do serviço é obrigatório'
        }
      }
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    quantidade_necessaria: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_servico_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Status_servico',
        key: 'id'
      }
    },
    campanha_ativa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a campanha do projeto ainda está ativa'
    }
  }, {
    tableName: 'Servicos_disponiveis',
    timestamps: false
  });

  Servicos_disponiveis.associate = (models) => {
    Servicos_disponiveis.belongsTo(models.Projeto, {
      foreignKey: 'projeto_id',
      as: 'projeto'
    });
    Servicos_disponiveis.belongsTo(models.StatusServico, {
      foreignKey: 'status_servico_id',
      as: 'status'
    });
    Servicos_disponiveis.hasMany(models.Participacoes, {
      foreignKey: 'servico_id',
      as: 'participacoes'
    });
  };

  return Servicos_disponiveis;
};
