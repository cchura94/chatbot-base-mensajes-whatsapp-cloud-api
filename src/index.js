// importar paquetes de terceros
const express = require("express");
require("dotenv").config();
const cors = require("cors");


// importar paquetes locales

// inicializar paquetes
const app = express();

// declarar variables
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors())
app.use(express.json());

// configurar rutas
app.get("/saludo", (req, res) => {
    console.log("Mi nombre es: "+req.query.nombre + ", saludos desde: "+req.query.pais);
    return res.json({mensaje: "Hola."});
})

// levantar el servidor
app.listen(port, () => {
    console.log('Servidor corriendo en el puerto '+port);
})