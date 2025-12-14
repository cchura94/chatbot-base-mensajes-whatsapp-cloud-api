const OpenAi = require("openai");
const Curso = require("../model/Curso");

const client = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY
});


async function respuestaIA(mensaje){
    try {
        let cursos = await Curso.findAll({raw: true});
        const response = await client.chat.completions.create({
            model: "gpt-5.2",
            messages: [
                {
                    role: "system",
                    content: `Eres un experto en ventas de cursos de desarrollo. debes responder las consultas de los clientes en no más de 30 palabras. no debes responder otros temas`
                },
                {
                    "role": "user",
                    "content": "que cursos estan disponibles?",
                },
                {
                    "role": "assistant",
                    "content": "ofrecemos diferentes cursos, pero por el momento. solo está disponible el curso de n8n a un costo de 49 USD. pero para el siguiente año tendremos estos cursos: "+JSON.stringify(cursos)
                },
                {
                    "role": "user",
                    "content": mensaje
                },
            ],

        });

        return response.choices[0].message.content;
    } catch (error) {
        console.log(error);
        return "Lo siento, no pude procesar tu consulta"
    }
}

module.exports = {
    respuestaIA
}
