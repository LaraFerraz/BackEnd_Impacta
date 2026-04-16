const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Projeto = sequelize.define('Projeto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Título é obrigatório'
        }
      }
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Descrição é obrigatória'
        }
      }
    },
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categoria',
        key: 'id'
      }
    },
    criador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'id'
      }
    },
    cidade_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cidade',
        key: 'id'
      }
    },
    data_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    meta_participantes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Status_campanha',
        key: 'id'
      }
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Projeto',
    timestamps: false
  });

  Projeto.associate = (models) => {
    Projeto.belongsTo(models.Categoria, {
      foreignKey: 'categoria_id',
      as: 'categoria'
    });
    Projeto.belongsTo(models.Usuario, {
      foreignKey: 'criador_id',
      as: 'criador'
    });
    Projeto.belongsTo(models.Cidade, {
      foreignKey: 'cidade_id',
      as: 'cidade'
    });
    Projeto.belongsTo(models.StatusCampanha, {
      foreignKey: 'status_id',
      as: 'status'
    });
    Projeto.hasOne(models.Info_campanha, {
      foreignKey: 'projeto_id',
      as: 'informacoes'
    });
    Projeto.hasMany(models.Servicos_disponiveis, {
      foreignKey: 'projeto_id',
      as: 'servicos'
    });
    Projeto.hasMany(models.Participacoes, {
      foreignKey: 'projeto_id',
      as: 'participacoes'
    });
    Projeto.hasMany(models.Avaliacoes, {
      foreignKey: 'projeto_id',
      as: 'avaliacoes'
    });
    Projeto.hasMany(models.Favoritos, {
      foreignKey: 'projeto_id',
      as: 'favoritados_por'
    });
  };

  return Projeto;
};
