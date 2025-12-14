const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");


const whatsappService = require("./../services/whatsappService");
const openAIService = require("./../services/openaiService");
const Contacto = require("../model/Contacto");
const Producto = require("../model/Producto");

async function enviarMensaje(req, res) {
  try {
    const { numero, mensaje } = req.body;

    if (!numero || !mensaje) {
      return res.status(400).json({
        success: false,
        error: "Debes enviar { numero, mensaje }",
      });
    }

    // procesar el mensaje
    const response = await whatsappService.enviarMensajeWhatsapp(
      numero,
      mensaje
    );

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

// recibir mensajes
async function recibirMensajesWebhook(req, res) {
  try {
    const body = req.body;

    if (!body || !body.entry || !body.entry[0]?.changes) {
      return res.status(400).send("webhook inválido");
    }

    const entry = body.entry[0];
    const changes = entry.changes[0];

    if (!changes.value.messages) {
      return res.status(200).send("Evento recibido (no es un mensaje)");
    }

    const message = changes.value.messages[0];
    const from = message.from;
    const type = message.type;
    const nombre = changes.value.contacts[0].profile.name;

    // guardando contacto
    let contacto = await Contacto.findOne({where: { nro_whatsapp: from}});
    if(!contacto){
      contacto = await Contacto.create({
        nombre: nombre || "SIN NOMBRE",
        nro_whatsapp: from
      })
    }

    console.log("Mensaje recibido: ", JSON.stringify(message, null, 2));

    let userMessage = "";

    if (type === "text") {
      userMessage = message.text.body;
    } else if (type === "interactive") {
      if (message.interactive.button_reply) {
        userMessage = message.interactive.button_reply.title;
      } else if (message.interactive.list_reply) {
        userMessage = message.interactive.list_reply.title;
      }
    } else {
      userMessage = `[Tipo ${type} recibido]`;
    }

    // Lógica de respuestas automáticas
    // Aquí pueden usar OpenAI, menús, etc.
    let reply = await obtenerRespuestaBot(userMessage);

    // generar respuesta de la IA (openAI)
    if(!reply || reply.type === "unknown"){
      console.log("Usando OpenAI para generar respuesta IA");
      const respuestaInteligente = await openAIService.respuestaIA(userMessage)
      reply = {
        type: "text",
        body: respuestaInteligente
      }
    }

    if(contacto.saldo > 0){
      const resp = await whatsappService.enviarMensajeWhatsapp(from, {type: "text", body: "Hola "+ contacto.nombre + ", Tiene un saldo pendiente a pagar: "+contacto.saldo});
    }
    console.log("***************: ", reply)
    const response = await whatsappService.enviarMensajeWhatsapp(from, reply);

    return res.status(200).send("Evento recibido");
  } catch (error) {}
}

function obtenerRespuestaBot(text) {
  const msg = text.toLowerCase();
  if (msg.includes("hola") || msg === "menu" || msg.includes("inicio")) {
    return menuPrincipal();
  }

  // Opción Ver cursos
  if (msg.includes("ver cursos")) {
    return listaCursos();
  }

  if (msg.includes("catalogo")) {
    return generarCatalogo();
  }

  // si pregunta sobre cursos
  if (msg.includes("cursos")) {
    return listaCursos();
  }

  // opción categorias
  if (msg.includes("categorias")) {
    return listaCategorias();
  }

  if (msg.includes("categoria ")) {
    const id = msg.replace("categoria ", "").trim();
    return cursoPorCategoria(id);
  }

  // opción soporte
  if (msg.includes("soporte")) {
    return soporteMenu();
  }

  return { type: "unknown" }
  return {
    type: "text",
    body: "No entendí eso 😅\n\nEscribe menu para ver las opciones.",
  };
}

function menuPrincipal() {
  return {
    type: "buttons",
    body: "👋Bienvenido a la Plataforma.\n\n> Elige una opción",
    buttons: [
      { type: "reply", reply: { id: "ver_cursos", title: "Ver Cursos" } },
      { type: "reply", reply: { id: "categorias", title: "Categorias" } },
      { type: "reply", reply: { id: "soporte", title: "Soporte" } },
    ],
  };
}

function listaCursos() {
  return {
    type: "list",
    header: "Cursos disponibles",
    body: "Selecciona un curso para ver más información",
    footer: "por Blumbit",
    buttonText: "Ver cursos",
    sections: [
      {
        title: "Frontend",
        rows: [
          { id: "cat1", title: "Desarrollo web con React" },
          { id: "cat2", title: "Vue" },
          { id: "cat3", title: "Angular" },
        ],
      },
      {
        title: "Backend",
        rows: [
          { id: "cat4", title: "Node con Nest" },
          { id: "cat5", title: "Node con Express" },
          { id: "cat6", title: "Laravel" },
          { id: "cat7", title: "Spring Boot" },
        ],
      },
    ],
  };
}

function listaCategorias() {
  return {
    type: "list",
    header: "Categorías",
    body: "Elige una categoria",
    footer: "saludos.",
    buttonText: "Ver categorias",
    sections: [
      {
        title: "Categorias",
        rows: [
          { id: "prog", title: "Programación" },
          { id: "neg", title: "Negocios" },
          { id: "diseño", title: "Diseño" },
          { id: "data", title: "Data" },
        ],
      },
    ],
  };
}

function soporteMenu() {
  return {
    type: "buttons",
    body: "👋¿Cómo podemos ayudarte?",
    buttons: [
      { type: "reply", reply: { id: "asesor", title: "Hablar con un asesor" } },
      { type: "reply", reply: { id: "catalogo", title: "Catalogo" } },
    ],
  };
}

function cursoPorCategoria(id) {
  const categorias = {
    programación: ["Desarrollo Web", "Javascript", "React"],
    negocios: ["Marketing Digital", "Ventas", "Emprendimientos"],
    diseño: ["UI/UX", "Branding"],
    data: ["Data Science", "Python", "SQL"],
  };

  const lista = categorias[id];

  if (!lista) {
    return { type: "text", body: "No hay cursos en esta categoría" };
  }

  return {
    type: "text",
    body: `Cursos en *${id}*:\n\n- ${lista.join("\n- ")}`,
  };
}

async function generarCatalogo() {

  const productos = await Producto.findAll({raw: true});
    // let productos = datos;
    console.log("productos *********: ", productos)
    /*
    [
      { id: 1, nombre: "Laptop", precio: 1200.50, stock: 10, categoria: "Electrónica" },
      { id: 2, nombre: "Mouse", precio: 25.99, stock: 50, categoria: "Accesorios" },
      { id: 3, nombre: "Teclado", precio: 45.00, stock: 30, categoria: "Accesorios" }
    ];
    */
  
    // 🔹 Ruta al ROOT del proyecto
    const rootDir = process.cwd();
  
    // 🔹 Carpeta public en el root
    const publicDir = path.join(rootDir, "public");
  
    // 🔹 Crear carpeta si no existe
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
  
    // 🔹 Nombre dinámico del archivo
    const fileName = `catalogo_productos_${Date.now()}.pdf`;
    const outputPath = path.join(publicDir, fileName);
  
    // 🔹 Generar solo si no existe
    if (!fs.existsSync(outputPath)) {
  
      const doc = new PDFDocument({ margin: 40 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
  
      doc.fontSize(20).text("Catálogo de Productos", { align: "center" });
      doc.moveDown(2);
  
      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("ID", 40);
      doc.text("Nombre", 80);
      doc.text("Categoría", 200);
      doc.text("Precio", 340);
      doc.text("Stock", 430);
  
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
  
      doc.font("Helvetica");
  
      productos.forEach(p => {
        doc.text(p.id, 40);
        doc.text(p.nombre, 80);
        doc.text(p.categoria, 200);
        doc.text("$" + p.precio, 340);
        doc.text(p.stock, 430);
        doc.moveDown();
      });
  
      doc.end();
    }
  
    return {
      type: "document",
      link: `https://38250f25fdc9.ngrok-free.app/${fileName}`,
      filename: fileName,
      caption: "Hola, le enviamos el catálogo de productos"
    };
  }

module.exports = {
  enviarMensaje,
  recibirMensajesWebhook,
};
