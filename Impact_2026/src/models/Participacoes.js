const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Participacoes = sequelize.define('Participacoes', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'id'
      }
    },
    projeto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projeto',
        key: 'id'
      }
    },
    servico_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Servicos_disponiveis',
        key: 'id'
      }
    },
    data_inscricao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    status_participacao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Status_participacao',
        key: 'id'
      }
    }
  }, {
    tableName: 'Participacoes',
    timestamps: false
  });

  Participacoes.associate = (models) => {
    Participacoes.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
    Participacoes.belongsTo(models.Projeto, {
      foreignKey: 'projeto_id',
      as: 'projeto'
    });
    Participacoes.belongsTo(models.Servicos_disponiveis, {
      foreignKey: 'servico_id',
      as: 'servico'
    });
    Participacoes.belongsTo(models.StatusParticipacao, {
      foreignKey: 'status_participacao_id',
      as: 'status'
    });
  };

  return Participacoes;
};
