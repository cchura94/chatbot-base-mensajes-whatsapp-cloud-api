const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('bd_whatsapp_cloud_api', 'postgres', 'postgresql', {
    host: 'localhost',
    port: 5433,
    dialect: 'postgres'
});

async function testConexionBD(){
    try {
        await sequelize.authenticate();
        console.log('CONEXION EXITOSA DE BD.');
      } catch (error) {
        console.error('Erro de conexion con BD:', error);
      }
}

testConexionBD();

module.exports = sequelize;