const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StatusServico = sequelize.define('StatusServico', {
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
    tableName: 'Status_servico',
    timestamps: false
  });

  StatusServico.associate = (models) => {
    StatusServico.hasMany(models.Servicos_disponiveis, {
      foreignKey: 'status_servico_id',
      as: 'servicos'
    });
  };

  return StatusServico;
};
