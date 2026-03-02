const express = require("express");
const fetch = require("node-fetch");
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration,
    CardFactory
} = require("botbuilder");

/* =============================
   APP
============================= */
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send("🚕 TaxiLaser Bot OK");
});

/* =============================
   CREDENCIALES
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
   ADAPTIVE CARD – FORMULARIO
============================= */
const reporteCardJson = {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.4",
    "body": [
        {
            "type": "TextBlock",
            "text": "📋 Crear Reporte TaxiLaser by D005",
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
            "type": "Input.Text",
            "id": "monto",
            "label": "Monto (usar solo en Deuda / Saldo a favor)",
            "placeholder": "$0"
        },
        {
            "type": "Input.ChoiceSet",
            "id": "tipo_multa",
            "label": "Tipo de multa (usar solo si categoría = Multa)",
            "choices": [
                { "title": "Adulteramiento de documentación - $300", "value": "1060DF|Documentación falsa o alterada|300" },
                { "title": "Ceder el app a un tercero - $500 por persona", "value": "1060CA|Ceder el app a un tercero|500" },
                { "title": "Vehículo distinto al sistema - $100", "value": "1060VNR|Vehículo distinto|100" },
                { "title": "Trabajar acompañado - $100", "value": "1060TA|Trabajar acompañado|100" },
                { "title": "Vestimenta indebida - $20", "value": "1060VI|Vestimenta indebida|20" },
                { "title": "No tener tarifario - $10", "value": "1060NTT|No tener tarifario|10" },
                { "title": "TD5 sin base - $20", "value": "1060TD5|TD5 sin base|20" },
                { "title": "Vehículo sucio - $20", "value": "1060VS|Vehículo sucio|20" },
                { "title": "Placa distinta - $50", "value": "1060PNR|Placa distinta|50" },
                { "title": "Dar número de teléfono, Clientes personales - $150", "value": "1060DNT|Clientes personales|150" },
                { "title": "Teléfono con cliente a bordo - $30", "value": "1060UTCA|Teléfono con cliente|30" },
                { "title": "Maletero cargado - $20", "value": "1060MO|Maletero cargado|20" },
                { "title": "Negarse a inspección - $100", "value": "1060NI|Negarse a inspección|100" },
                { "title": "Sin aire/calefacción - $30", "value": "1060NAA|Sin aire|30" },
                { "title": "No cerrar en 20 correcto - $20", "value": "1060CS20I|Cerrar mal|20" },
                { "title": "No tener cambio - $10", "value": "1060NC100|No tener cambio|10" },
                { "title": "Retirarse sin autorización - $50", "value": "1060CSSA|Retirarse sin autorización|50" },
                { "title": "No salir a servicio - $20", "value": "1060DS|No salir|20" },
                { "title": "Falla mecánica - $10", "value": "1060RFM|Falla mecánica|10" },
                { "title": "No aplicar descuentos - $50", "value": "1060CI|No aplicar descuentos|50" },
                { "title": "Reclamo cliente - $20", "value": "1060RC|Reclamo cliente|20" },
                { "title": "Warning operativo - $10", "value": "1060W|Warning|10" },
                { "title": "Desconectarse con servicio - $5", "value": "1060DASA|Desconectarse|5" },
                { "title": "Cerrar para evitar servicio - $50", "value": "1060R20|Evitar servicio|50" },
                { "title": "Late fee/base vencida", "value": "1060LF|Late fee|variable" },
                { "title": "Cliente distinto - $20", "value": "1060CE|Cliente distinto|20" },
                { "title": "Re-entrenamiento - $20", "value": "1060RE|Re-entrenamiento|20" },
                { "title": "Irrespeto a base - $50", "value": "1040CB|Irrespeto|50" },
                { "title": "No responder copias - $10", "value": "1060NRC|No responder copias|10" },
                { "title": "Dejar 10-5 compañero - $20", "value": "1060D5C|Dejar 10-5|20" },
                { "title": "Daño pendiente - $20", "value": "1060RP|Daño pendiente|20" },
                { "title": "Error del Destino - $10", "value": "1060ED|Error destino|10" },
                { "title": "Mal uso de aplicación - $20-$30 (Consultar admin)", "value": "1060MUA|Mal uso de aplicación|20/30" }
            ]
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
        },
        { "type": "Input.Text", "id": "unidad", "label": "Unidad", "value": "D" },
        { "type": "Input.Text", "id": "nombre_cliente", "label": "Nombre de cliente" },
        { "type": "Input.Text", "id": "telefono_cliente", "label": "Teléfono de cliente" },
        { "type": "Input.Text", "id": "numero_servicio",  "label": "N° de servicio", "value": "S/N"},

        { "type": "Input.Text", "id": "observacion", "label": "Observación", "isMultiline": true }
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
   ADAPTIVE CARD – CERRADO
============================= */
const reporteEnviadoCard = {
    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "version": "1.4",
    "body": [
        {
            "type": "TextBlock",
            "text": "✅ Reporte enviado correctamente",
            "weight": "Bolder",
            "size": "Large",
            "color": "Good"
        },
        {
            "type": "TextBlock",
            "text": "Este formulario ya fue procesado y quedó cerrado.",
            "isSubtle": true,
            "wrap": true
        }
    ]
};

/* =============================
   BOT LOGIC
============================= */
const bot = {
    async run(context) {
        const text = context.activity.text?.trim().toLowerCase() || "";

        /* Mostrar formulario */
        if (context.activity.type === "message" && text === "/crearreporte") {
            const sent = await context.sendActivity({
                attachments: [CardFactory.adaptiveCard(reporteCardJson)]
            });

            // Guardamos el ID del mensaje del formulario
            context.turnState.set("reporteCardActivityId", sent.id);
            return;
        }

        /* Submit del formulario */
        if (context.activity.value?.action === "submitReporte") {
            const payload = {
                usuario: context.activity.from.name,
                ...context.activity.value,
                fecha: new Date().toISOString()
            };

            await fetch(process.env.PA_FLOW_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const activityId = context.activity.replyToId;

            // Reemplazamos el card original
            if (activityId) {
                await context.updateActivity({
                    id: activityId,
                    type: "message",
                    attachments: [CardFactory.adaptiveCard(reporteEnviadoCard)]
                });
            }

            return;
        }
    }
};

/* =============================
   ENDPOINT
============================= */
app.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

/* =============================
   START
============================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚕 TaxiLaser Bot escuchando en ${PORT}`);
});
