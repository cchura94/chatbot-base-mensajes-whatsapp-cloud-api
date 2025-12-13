const axios = require("axios");

const whatsappUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+ accessToken
}

async function enviarMensajeWhatsapp(phoneNumber, messageData){
    try {
        
        const payload = buildPayload(phoneNumber, messageData);
        console.log(payload);
        const response = await axios.post(whatsappUrl, payload, { headers });
        return response.data;

    } catch (error) {
        console.log("Error al enviar mensaje: ", error.response?.data || error);
    }
}

function buildPayload(to, data){
    const base = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to
    }

    switch(data.type){
        case "text":
            return { ...base, "type": "text", "text": { body: data.body } }
        case "image":
            return { ...base, "type": "image", "image": { link: data.link, caption: data.caption } }
        case "document":
            return { ...base, "type": "document", "document": { link: data.link, caption: data.caption, filename: data.filename } }
        case "location":
            return { ...base, "type": "location", "location": { latitude: data.latitude, longitude: data.longitude, name: data.name, address: data.address } }
        default:
            throw new Error(" Tipo de mensaje no soportado: "+data.type);
    }
}
        

module.exports = {
    enviarMensajeWhatsapp
}