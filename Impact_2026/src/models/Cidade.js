const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cidade = sequelize.define('Cidade', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    estado_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Estado',
        key: 'id'
      }
    }
  }, {
    tableName: 'Cidade',
    timestamps: false
  });

  Cidade.associate = (models) => {
    Cidade.belongsTo(models.Estado, {
      foreignKey: 'estado_id',
      as: 'estado'
    });
    
    Cidade.hasMany(models.Usuario, {
      foreignKey: 'cidade_id',
      as: 'usuarios'
    });
  };

  return Cidade;
};