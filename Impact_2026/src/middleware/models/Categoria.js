const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Categoria = sequelize.define('Categoria', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório'
        }
      }
    }
  }, {
    tableName: 'Categoria',
    timestamps: false
  });

  Categoria.associate = (models) => {
    Categoria.hasMany(models.Projeto, {
      foreignKey: 'categoria_id',
      as: 'projetos'
    });
    Categoria.hasMany(models.Preferencias, {
      foreignKey: 'categoria_id',
      as: 'preferencias'
    });
  };

  return Categoria;
};
