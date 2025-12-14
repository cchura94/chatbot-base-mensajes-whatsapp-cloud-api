const express = require("express");
const whastappController = require("./../controllers/whatsappController")

const router = express.Router();

router.post('/enviar-mensaje', whastappController.enviarMensaje);

// Ruta para recibir mensajes
router.post("/webhook", whastappController.recibirMensajesWebhook)

// Verificar webhook
const verifyToken = process.env.VERIFY_TOKEN;
router.get('/webhook', (req, res) => {
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
  
    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.status(403).end();
    }
});


module.exports = router