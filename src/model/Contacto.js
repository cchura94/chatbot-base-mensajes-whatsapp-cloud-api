const { DataTypes } = require("sequelize");
const sequelize = require("./conexion");

const Contacto = sequelize.define(
    'Contacto',
    {
      // Model attributes are defined here
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      nro_whatsapp: {
        type: DataTypes.STRING(20),
        // allowNull defaults to true
      },
      saldo: {
        type: DataTypes.DECIMAL(12, 2)
      }
    },
    {
      // Other model options go here
    },
  );

Contacto.sync();

module.exports = Contacto;