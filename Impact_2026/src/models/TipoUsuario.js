const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TipoUsuario = sequelize.define('TipoUsuario', {
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
    tableName: 'Tipo_usuario',
    timestamps: false
  });

  TipoUsuario.associate = (models) => {
    TipoUsuario.hasMany(models.Usuario, {
      foreignKey: 'tipo_usuario_id',
      as: 'usuarios'
    });
  };

  return TipoUsuario;
};