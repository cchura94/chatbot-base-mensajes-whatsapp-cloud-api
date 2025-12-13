const express = require("express");
const whastappController = require("./../controllers/whatsappController")

const router = express.Router();

router.post('/enviar-mensaje', whastappController.enviarMensaje);
