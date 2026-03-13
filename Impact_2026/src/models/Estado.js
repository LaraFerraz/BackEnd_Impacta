const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Estado = sequelize.define('Estado', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sigla: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    pais_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Pais',
        key: 'id'
      }
    }
  }, {
    tableName: 'Estado',
    timestamps: false
  });

  Estado.associate = (models) => {
    Estado.belongsTo(models.Pais, {
      foreignKey: 'pais_id',
      as: 'pais'
    });
    
    Estado.hasMany(models.Cidade, {
      foreignKey: 'estado_id',
      as: 'cidades'
    });
  };

  return Estado;
};