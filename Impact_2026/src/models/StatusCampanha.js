const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StatusCampanha = sequelize.define('StatusCampanha', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'Status_campanha',
    timestamps: false
  });

  StatusCampanha.associate = (models) => {
    StatusCampanha.hasMany(models.Projeto, {
      foreignKey: 'status_id',
      as: 'projetos'
    });
  };

  return StatusCampanha;
};
