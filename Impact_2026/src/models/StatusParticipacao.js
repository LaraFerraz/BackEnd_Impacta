const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StatusParticipacao = sequelize.define('StatusParticipacao', {
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
    tableName: 'Status_participacao',
    timestamps: false
  });

  StatusParticipacao.associate = (models) => {
    StatusParticipacao.hasMany(models.Participacoes, {
      foreignKey: 'status_participacao_id',
      as: 'participacoes'
    });
  };

  return StatusParticipacao;
};
