const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Pais = sequelize.define('Pais', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'Pais',
    timestamps: false
  });

  Pais.associate = (models) => {
    Pais.hasMany(models.Estado, {
      foreignKey: 'pais_id',
      as: 'estados'
    });
  };

  return Pais;
};