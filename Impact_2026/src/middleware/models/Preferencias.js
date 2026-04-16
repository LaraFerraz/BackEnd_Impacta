const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Preferencias = sequelize.define('Preferencias', {
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
    categoria_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categoria',
        key: 'id'
      }
    }
  }, {
    tableName: 'Preferencias',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['usuario_id', 'categoria_id']
      }
    ]
  });

  Preferencias.associate = (models) => {
    Preferencias.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });
    Preferencias.belongsTo(models.Categoria, {
      foreignKey: 'categoria_id',
      as: 'categoria'
    });
  };

  return Preferencias;
};
