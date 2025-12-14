const express = require("express");
const fetch = require("node-fetch");
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration,
    CardFactory
} = require("botbuilder");

/* =============================
   APP BÁSICA
============================= */
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send("🚕 TaxiLaser Bot OK");
});

/* =============================
   CREDENCIALES BOT
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
   ERROR GLOBAL
============================= */
adapter.onTurnError = async (context, error) => {
    console.error("❌ Error:", error);
    await context.sendActivity("⚠️ Ocurrió un error inesperado.");
};

/* =============================
   ADAPTIVE CARD – CREAR REPORTE
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
            "size": "Large",
            "wrap": true
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
            "type": "Input.Text",
            "id": "unidad",
            "label": "Número de unidad"
        },
        {
            "type": "Input.Text",
            "id": "id_servicio",
            "label": "ID de servicio (opcional)"
        },
        {
            "type": "Input.Text",
            "id": "nombre_cliente",
            "label": "Nombre del cliente"
        },
        {
            "type": "Input.Text",
            "id": "telefono_cliente",
            "label": "Teléfono del cliente"
        },
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
            "data": {
                "action": "submitReporte"
            }
        }
    ]
};

/* =============================
   BOT LOGIC
============================= */
const bot = {
    async run(context) {

        console.log("📨 ACTIVITY:", JSON.stringify(context.activity, null, 2));

        const text = context.activity.text?.trim().toLowerCase() || "";

        /* /crearreporte */
        if (
            context.activity.type === "message" &&
            text === "/crearreporte"
        ) {
            await context.sendActivity({
                attachments: [
                    CardFactory.adaptiveCard(reporteCardJson)
                ]
            });
            return;
        }

        /* SUBMIT DE LA CARD */
        if (
            context.activity.type === "message" &&
            context.activity.value?.action === "submitReporte"
        ) {

            console.log("📦 SUBMIT:", context.activity.value);

            const payload = {
                usuario: context.activity.from.name,
                teamsUserId: context.activity.from.id,
                aadObjectId: context.activity.from.aadObjectId,
                conversationId: context.activity.conversation.id,
                serviceUrl: context.activity.serviceUrl,

                categoria: context.activity.value.categoria,
                unidad: context.activity.value.unidad,
                id_servicio: context.activity.value.id_servicio,
                nombre_cliente: context.activity.value.nombre_cliente,
                telefono_cliente: context.activity.value.telefono_cliente,
                observacion: context.activity.value.observacion,
                notificar: context.activity.value.notificar,

                fecha: new Date().toISOString()
            };

            await fetch(process.env.PA_FLOW_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            await context.sendActivity("✅ Reporte enviado correctamente.");
            return;
        }

        /* DEFAULT */
        await context.sendActivity("👋 Escribí /crearreporte para generar un reporte.");
    }
};

/* =============================
   ENDPOINT BOT
============================= */
app.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

/* =============================
   START SERVER
============================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚕 TaxiLaser Bot escuchando en puerto ${PORT}`);
});
