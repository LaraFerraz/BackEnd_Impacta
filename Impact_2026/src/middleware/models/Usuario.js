const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório'
        }
      }
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        msg: 'Email já está em uso'
      },
      validate: {
        isEmail: {
          msg: 'Email deve ser válido'
        },
        notEmpty: {
          msg: 'Email é obrigatório'
        }
      }
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Senha é obrigatória'
        },
        len: {
          args: [6, 255],
          msg: 'Senha deve ter pelo menos 6 caracteres'
        }
      }
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    cidade_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Cidade',
        key: 'id'
      }
    },
    tipo_usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2, // Cliente por padrão
      references: {
        model: 'Tipo_usuario',
        key: 'id'
      }
    },
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: {
        msg: 'CPF já está em uso'
      },
      validate: {
        notEmpty: {
          msg: 'CPF é obrigatório'
        }
      }
    },
    data_criacao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Usuario',
    timestamps: false
  });

  // Associações
  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Cidade, {
      foreignKey: 'cidade_id',
      as: 'cidade'
    });
    
    Usuario.belongsTo(models.TipoUsuario, {
      foreignKey: 'tipo_usuario_id',
      as: 'tipo'
    });

    Usuario.hasMany(models.Projeto, {
      foreignKey: 'criador_id',
      as: 'projetos_criados'
    });

    Usuario.hasMany(models.Preferencias, {
      foreignKey: 'usuario_id',
      as: 'preferencias'
    });

    Usuario.hasMany(models.Participacoes, {
      foreignKey: 'usuario_id',
      as: 'participacoes'
    });

    Usuario.hasMany(models.Avaliacoes, {
      foreignKey: 'usuario_id',
      as: 'avaliacoes'
    });

    Usuario.hasMany(models.Favoritos, {
      foreignKey: 'usuario_id',
      as: 'favoritos'
    });
  };

  return Usuario;
};