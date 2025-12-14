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

/* =============================
   Credenciales del bot
============================= */
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MICROSOFT_APP_ID,
    MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
    MicrosoftAppType: "SingleTenant",
    MicrosoftAppTenantId: process.env.MICROSOFT_APP_TENANT_ID
});

const botFrameworkAuthentication =
    createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

const adapter = new CloudAdapter(botFrameworkAuthentication);

/* =============================
   Error global
============================= */
adapter.onTurnError = async (context, error) => {
    console.error("❌ Error:", error);
    await context.sendActivity("⚠️ Ocurrió un error.");
};

/* =============================
   Motor de estilo
============================= */
function getCardStyleByCategoria(categoria) {
    switch (categoria) {
        case "Deuda":
            return "Attention";
        case "Warning":
        case "Multa":
            return "Warning";
        case "Saldo a favor":
            return "Good";
        default:
            return "Emphasis";
    }
}

/* =============================
   Adaptive Card - Formulario
============================= */
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

/* =============================
   BOT LOGIC
============================= */
const bot = {
    async run(context) {

        console.log("📨 ACTIVITY:", JSON.stringify(context.activity, null, 2));
        const text = context.activity.text?.trim()?.toLowerCase() || "";

        /* /crearreporte */
        if (context.activity.type === "message" && text === "/crearreporte") {
            await context.sendActivity({
                attachments: [CardFactory.adaptiveCard(reporteCardJson)]
            });
            return;
        }

        /* Submit */
        if (
            context.activity.type === "message" &&
            context.activity.value?.action === "submitReporte"
        ) {

            const categoria = context.activity.value.categoria;
            const cardStyle = getCardStyleByCategoria(categoria);

            const payload = {
                usuario: context.activity.from.name,
                teamsUserId: context.activity.from.id,
                aadObjectId: context.activity.from.aadObjectId,
                conversationId: context.activity.conversation.id,
                serviceUrl: context.activity.serviceUrl,

                ...context.activity.value,

                cardStyle,
                fecha: new Date().toISOString()
            };

            console.log("📦 Payload enviado:", payload);

            await fetch(process.env.PA_FLOW_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            await context.sendActivity("✅ Reporte enviado correctamente.");
            return;
        }

        await context.sendActivity("👋 Escribí /crearreporte para generar un reporte.");
    }
};

/* =============================
   Endpoint Bot
============================= */
app.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

/* =============================
   Server
============================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚕 TaxiLaser Bot escuchando en puerto ${PORT}`);
});

}

