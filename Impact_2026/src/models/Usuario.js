const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório'
        },
        len: {
          args: [2, 100],
          msg: 'Nome deve ter entre 2 e 100 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
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
    cpf: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: {
        msg: 'CPF já está cadastrado'
      },
      validate: {
        notEmpty: {
          msg: 'CPF é obrigatório'
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
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Telefone é obrigatório'
        }
      }
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
    interesses: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    data_cadastro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Usuario',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['cpf']
      }
    ]
  });

  // Associações
  Usuario.associate = (models) => {
    Usuario.belongsTo(models.Cidade, {
      foreignKey: 'cidade_id',
      as: 'cidade'
    });
    
    Usuario.belongsTo(models.Tipo_usuario, {
      foreignKey: 'tipo_usuario_id',
      as: 'tipo'
    });
  };

  return Usuario;
};