const { DataTypes } = require("sequelize");
const sequelize = require("./conexion");

const Curso = sequelize.define(
    'Curso',
    {
      // Model attributes are defined here
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      precio: {
        type: DataTypes.DECIMAL(12, 2),
        // allowNull defaults to true
      }
    },
    {
      // Other model options go here
    },
  );

Curso.sync();

module.exports = Curso;