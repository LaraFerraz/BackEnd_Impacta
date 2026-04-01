const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Favoritos = sequelize.define('Favoritos', {
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
    }
  }, {
    tableName: 'Favoritos',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['usuario_id', 'projeto_id']
      }
    ]
  });

  Favoritos.associate = (models) => {
    Favoritos.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
    Favoritos.belongsTo(models.Projeto, {
      foreignKey: 'projeto_id',
      as: 'projeto'
    });
  };

  return Favoritos;
};
