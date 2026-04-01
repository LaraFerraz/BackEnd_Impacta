const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Avaliacoes = sequelize.define('Avaliacoes', {
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
    nota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'Nota deve ser um número inteiro'
        },
        min: {
          args: [1],
          msg: 'Nota mínima é 1'
        },
        max: {
          args: [5],
          msg: 'Nota máxima é 5'
        }
      }
    },
    data_avaliacao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Avaliacoes',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['usuario_id', 'projeto_id']
      }
    ]
  });

  Avaliacoes.associate = (models) => {
    Avaliacoes.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
    Avaliacoes.belongsTo(models.Projeto, {
      foreignKey: 'projeto_id',
      as: 'projeto'
    });
  };

  return Avaliacoes;
};
