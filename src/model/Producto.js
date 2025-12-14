const { DataTypes } = require("sequelize");
const sequelize = require("./conexion");

const Producto = sequelize.define(
  "Producto",
  {
    // Model attributes are defined here
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(12, 2),
    },
    stock: {
      type: DataTypes.INTEGER,
      // allowNull defaults to true
    },
    categoria: {
      type: DataTypes.STRING(20),
    },
  },
  {
    // Other model options go here
  }
);

Producto.sync();

module.exports = Producto;

