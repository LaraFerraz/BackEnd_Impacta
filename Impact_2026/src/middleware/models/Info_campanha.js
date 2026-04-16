const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Info_campanha = sequelize.define('Info_campanha', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    projeto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projeto',
        key: 'id'
      }
    },
    objetivos: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    publico_alvo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    impacto_esperado: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    regras: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Info_campanha',
    timestamps: false
  });

  Info_campanha.associate = (models) => {
    Info_campanha.belongsTo(models.Projeto, {
      foreignKey: 'projeto_id',
      as: 'projeto'
    });
  };

  return Info_campanha;
};
