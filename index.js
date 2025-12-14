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

// Credenciales del bot
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MICROSOFT_APP_ID,
    MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
    MicrosoftAppType: "SingleTenant",
    MicrosoftAppTenantId: process.env.MICROSOFT_APP_TENANT_ID
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Errores globales
adapter.onTurnError = async (context, error) => {
    console.error("❌ Error:", error);
    await context.sendActivity("⚠️ Ocurrió un error.");
};

// ----------------------------------
// TU ADAPTIVE CARD JSON (TAL CUAL)
// ----------------------------------
const reporteCardJson = {
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    { "type": "TextBlock","text": "📋 Crear Reporte TaxiLaser","weight": "Bolder","size": "Large" },

    { "type": "Input.ChoiceSet","id": "categoria","label": "Categoría del reporte","style": "compact",
      "choices": [
        { "title": "Deuda", "value": "Deuda" },
        { "title": "Saldo a favor", "value": "Saldo a favor" },
        { "title": "Warning", "value": "Warning" },
        { "title": "Multa", "value": "Multa" }
      ],
      "value": "Deuda"
    },

    { "type": "Input.Text","id": "unidad","label": "Número de unidad","placeholder": "Ej: D026" },
    { "type": "Input.Text","id": "id_servicio","label": "ID de servicio (opcional)","placeholder": "Si aplica" },
    { "type": "Input.Text","id": "nombre_cliente","label": "Nombre del cliente" },
    { "type": "Input.Text","id": "telefono_cliente","label": "Teléfono del cliente" },
    { "type": "Input.Text","id": "observacion","label": "Observación","isMultiline": true },

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
    },

    {
      "type": "TextBlock",
      "text": "📎 Si querés adjuntar imágenes: responde a este mismo post con los archivos. El sistema las tomará automáticamente.",
      "wrap": true,
      "size": "Small",
      "color": "accent"
    }
  ],
  "actions": [
    { "type": "Action.Submit", "title": "Enviar Reporte" }
  ]
};

// ----------------------------------
// BOT LOGIC
// ----------------------------------
const bot = {
    async run(context) {

        console.log("📨 ACTIVITY COMPLETA:", JSON.stringify(context.activity, null, 2));

        const text = context.activity.text?.trim()?.toLowerCase() || "";
        console.log("📩 Mensaje recibido:", text);

        // 1️⃣ Comando: /crearreporte
        if (context.activity.type === "message" && text === "/crearreporte") {

            console.log("➡️ Enviando la tarjeta de reporte al usuario");

            await context.sendActivity({
                attachments: [CardFactory.adaptiveCard(reporteCardJson)]
            });

            return;
        }

        // 2️⃣ SUBMIT DE LA TARJETA (cuando el usuario completa)
        if (context.activity.value?.action === "submitReporte") {

            const payload = {
                usuario: context.activity.from.name,
                categoria: context.activity.value.categoria,
                unidad: context.activity.value.unidad,
                id_servicio: context.activity.value.id_servicio,
                nombre_cliente: context.activity.value.nombre_cliente,
                telefono_cliente: context.activity.value.telefono_cliente,
                observacion: context.activity.value.observacion,
                notificar: context.activity.value.notificar,
                fecha: new Date().toISOString()
            };

            console.log("📦 Submit recibido:", payload);

            // Enviamos a Power Automate
            await fetch(process.env.PA_FLOW_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            await context.sendActivity("✅ Reporte enviado correctamente.");
            return;
        }

        // Respuesta default
        await context.sendActivity("👋 Escribí /crearreporte para generar un reporte.");
    }
};

// ----------------------------------
// Endpoint del bot
// ----------------------------------
app.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚕 TaxiLaser Bot escuchando en puerto ${PORT}`));
