const express = require("express");
const fetch = require("node-fetch");
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration,
    CardFactory
} = require("botbuilder");

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.status(200).send("TaxiLaser Bot OK"));

// -----------------------------
// Credenciales del bot
// -----------------------------
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MICROSOFT_APP_ID,
    MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
    MicrosoftAppType: "SingleTenant",
    MicrosoftAppTenantId: process.env.MICROSOFT_APP_TENANT_ID
});

const botFrameworkAuthentication =
    createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Errores globales
adapter.onTurnError = async (context, error) => {
    console.error("❌ Error:", error);
    await context.sendActivity("⚠️ Ocurrió un error.");
};

// -----------------------------
// Adaptive Card (JSON puro)
// -----------------------------
const reporteCardJson = {
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "TextBlock",
      "text": "📋 Crear Reporte TaxiLaser",
      "weight": "Bolder",
      "size": "Large"
    },

    {
      "type": "Input.ChoiceSet",
      "id": "categoria",
      "label": "Categoría del reporte",
      "choices": [
        { "title": "Deuda", "value": "Deuda" },
        { "title": "Saldo a favor", "value": "Saldo a favor" },
        { "title": "Warning", "value": "Warning" },
        { "title": "Multa", "value": "Multa" }
      ],
      "value": "Deuda"
    },

    {
      "type": "Input.Number",
      "id": "monto",
      "label": "Monto (solo Deuda / Saldo a favor)",
      "placeholder": "Ej: 50"
    },

    {
      "type": "Input.ChoiceSet",
      "id": "multa",
      "label": "Tipo de multa (solo Multa)",
      "choices": [
        { "title": "Adulteramiento de documentación - $300", "value": "1060DF|Adulteramiento de documentación|300" },
        { "title": "Ceder el app a un tercero - $500", "value": "1060CA|Ceder el app a un tercero|500" },
        { "title": "Vehículo sucio - $20", "value": "1060VS|Vehículo sucio|20" },
        { "title": "Trabajar acompañado - $100", "value": "1060TA|Trabajar acompañado|100" },
        { "title": "No tener tarifario - $10", "value": "1060NTT|No tener tarifario|10" },
        { "title": "Reclamos de cliente - $20", "value": "1060RC|Reclamos de cliente|20" },
        { "title": "Late fee / base vencida", "value": "1060LF|Late fee/base vencida|10-20" }
        // 👉 podés seguir agregando el resto sin problema
      ]
    },

    { "type": "Input.Text", "id": "unidad", "label": "Número de unidad" },
    { "type": "Input.Text", "id": "id_servicio", "label": "ID de servicio (opcional)" },
    { "type": "Input.Text", "id": "nombre_cliente", "label": "Nombre del cliente" },
    { "type": "Input.Text", "id": "telefono_cliente", "label": "Teléfono del cliente" },

    {
      "type": "Input.Text",
      "id": "observacion",
      "label": "Observación",
      "isMultiline": true
    },

    {
      "type": "Input.ChoiceSet",
      "id": "notificar",
      "label": "Notificar a:",
      "isMultiSelect": true,
      "choices": [
        { "title": "PRINCIPALES", "value": "PRINCIPALES" },
        { "title": "TAXIMETRO", "value": "TAXIMETRO" },
        { "title": "MANAGERS", "value": "MANAGERS" },
        { "title": "ADMINISTRACION", "value": "ADMINISTRACION" },
        { "title": "SUPERVISORES", "value": "SUPERVISORES" },
        { "title": "REPORTES", "value": "REPORTES" }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Enviar Reporte",
      "data": { "action": "submitReporte" }
    }
  ]
};


// -----------------------------
// BOT LOGIC
// -----------------------------
const bot = {
    async run(context) {

        console.log("📨 ACTIVITY COMPLETA:", JSON.stringify(context.activity, null, 2));

        const text = context.activity.text?.trim()?.toLowerCase() || "";

        // 1️⃣ /crearreporte → enviar tarjeta
        if (
            context.activity.type === "message" &&
            text === "/crearreporte"
        ) {
            await context.sendActivity({
                attachments: [CardFactory.adaptiveCard(reporteCardJson)]
            });
            return;
        }

        // 2️⃣ Submit de la tarjeta
        if (
  context.activity.type === "message" &&
  context.activity.value?.action === "submitReporte"
) {

  const v = context.activity.value;

  let multaCodigo = null;
  let multaDescripcion = null;
  let multaMonto = null;

  if (v.categoria === "Multa" && v.multa) {
    const partes = v.multa.split("|");
    multaCodigo = partes[0] || null;
    multaDescripcion = partes[1] || null;
    multaMonto = partes[2] || null;
  }

  const payload = {
    usuario: context.activity.from.name,
    teamsUserId: context.activity.from.id,
    aadObjectId: context.activity.from.aadObjectId,
    conversationId: context.activity.conversation.id,
    serviceUrl: context.activity.serviceUrl,

    categoria: v.categoria,

    monto:
      v.categoria === "Deuda" || v.categoria === "Saldo a favor"
        ? v.monto || null
        : null,

    multaCodigo,
    multaDescripcion,
    multaMonto,

    unidad: v.unidad,
    id_servicio: v.id_servicio,
    nombre_cliente: v.nombre_cliente,
    telefono_cliente: v.telefono_cliente,
    observacion: v.observacion,
    notificar: v.notificar,

    fecha: new Date().toISOString()
  };

  console.log("📦 Payload final:", payload);

  await fetch(process.env.PA_FLOW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  await context.sendActivity("✅ Reporte enviado correctamente.");
  return;
}

