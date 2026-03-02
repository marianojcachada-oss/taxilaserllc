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
      "text": "📋 Crear Reporte TaxiLaser",
      "weight": "Bolder",
      "size": "Large"
    },
    {
      "type": "ColumnSet",
      "columns": [
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "Container",
              "id": "deudaOff",
              "selectAction": {
                "type": "Action.ToggleVisibility",
                "targetElements": [
                  { "elementId": "deudaOn", "isVisible": true },
                  { "elementId": "deudaOff", "isVisible": false },
                  { "elementId": "saldoOn", "isVisible": false },
                  { "elementId": "saldoOff", "isVisible": true },
                  { "elementId": "warningOn", "isVisible": false },
                  { "elementId": "warningOff", "isVisible": true },
                  { "elementId": "multaOn", "isVisible": false },
                  { "elementId": "multaOff", "isVisible": true },
                  { "elementId": "llantaOn", "isVisible": false },
                  { "elementId": "llantaOff", "isVisible": true },
                  { "elementId": "pendienteOn", "isVisible": false },
                  { "elementId": "pendienteOff", "isVisible": true },
                  { "elementId": "formDeuda", "isVisible": true },
                  { "elementId": "formSaldo", "isVisible": false },
                  { "elementId": "formWarning", "isVisible": false },
                  { "elementId": "formMulta", "isVisible": false },
                  { "elementId": "formLlanta", "isVisible": false },
                  { "elementId": "formPendiente", "isVisible": false }
                ]
              },
              "items": [
                { "type": "TextBlock", "text": "Deuda", "horizontalAlignment": "Center" }
              ]
            },
            {
              "type": "Container",
              "id": "deudaOn",
              "isVisible": false,
              "items": [
                {
                  "type": "TextBlock",
                  "text": "Deuda",
                  "weight": "Bolder",
                  "color": "Good",
                  "horizontalAlignment": "Center"
                },
                {
                  "type": "Container",
                  "style": "good",
                  "minHeight": "3px"
                }
              ]
            }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "Container",
              "id": "saldoOff",
              "selectAction": {
                "type": "Action.ToggleVisibility",
                "targetElements": [
                  { "elementId": "saldoOn", "isVisible": true },
                  { "elementId": "saldoOff", "isVisible": false },
                  { "elementId": "deudaOn", "isVisible": false },
                  { "elementId": "deudaOff", "isVisible": true },
                  { "elementId": "warningOn", "isVisible": false },
                  { "elementId": "warningOff", "isVisible": true },
                  { "elementId": "multaOn", "isVisible": false },
                  { "elementId": "multaOff", "isVisible": true },
                  { "elementId": "llantaOn", "isVisible": false },
                  { "elementId": "llantaOff", "isVisible": true },
                  { "elementId": "pendienteOn", "isVisible": false },
                  { "elementId": "pendienteOff", "isVisible": true },
                  { "elementId": "formDeuda", "isVisible": false },
                  { "elementId": "formSaldo", "isVisible": true },
                  { "elementId": "formWarning", "isVisible": false },
                  { "elementId": "formMulta", "isVisible": false },
                  { "elementId": "formLlanta", "isVisible": false },
                  { "elementId": "formPendiente", "isVisible": false }
                ]
              },
              "items": [
                { "type": "TextBlock", "text": "Saldo", "horizontalAlignment": "Center" }
              ]
            },
            {
              "type": "Container",
              "id": "saldoOn",
              "isVisible": false,
              "items": [
                {
                  "type": "TextBlock",
                  "text": "Saldo",
                  "weight": "Bolder",
                  "color": "Good",
                  "horizontalAlignment": "Center"
                },
                {
                  "type": "Container",
                  "style": "good",
                  "minHeight": "3px"
                }
              ]
            }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "Container",
              "id": "warningOff",
              "selectAction": {
                "type": "Action.ToggleVisibility",
                "targetElements": [
                  { "elementId": "warningOn", "isVisible": true },
                  { "elementId": "warningOff", "isVisible": false },
                  { "elementId": "deudaOn", "isVisible": false },
                  { "elementId": "deudaOff", "isVisible": true },
                  { "elementId": "saldoOn", "isVisible": false },
                  { "elementId": "saldoOff", "isVisible": true },
                  { "elementId": "multaOn", "isVisible": false },
                  { "elementId": "multaOff", "isVisible": true },
                  { "elementId": "llantaOn", "isVisible": false },
                  { "elementId": "llantaOff", "isVisible": true },
                  { "elementId": "pendienteOn", "isVisible": false },
                  { "elementId": "pendienteOff", "isVisible": true },
                  { "elementId": "formDeuda", "isVisible": false },
                  { "elementId": "formSaldo", "isVisible": false },
                  { "elementId": "formWarning", "isVisible": true },
                  { "elementId": "formMulta", "isVisible": false },
                  { "elementId": "formLlanta", "isVisible": false },
                  { "elementId": "formPendiente", "isVisible": false }
                ]
              },
              "items": [
                { "type": "TextBlock", "text": "Warning", "horizontalAlignment": "Center" }
              ]
            },
            {
              "type": "Container",
              "id": "warningOn",
              "isVisible": false,
              "items": [
                {
                  "type": "TextBlock",
                  "text": "Warning",
                  "weight": "Bolder",
                  "color": "Good",
                  "horizontalAlignment": "Center"
                },
                {
                  "type": "Container",
                  "style": "good",
                  "minHeight": "3px"
                }
              ]
            }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "Container",
              "id": "multaOff",
              "selectAction": {
                "type": "Action.ToggleVisibility",
                "targetElements": [
                  { "elementId": "multaOn", "isVisible": true },
                  { "elementId": "multaOff", "isVisible": false },
                  { "elementId": "deudaOn", "isVisible": false },
                  { "elementId": "deudaOff", "isVisible": true },
                  { "elementId": "saldoOn", "isVisible": false },
                  { "elementId": "saldoOff", "isVisible": true },
                  { "elementId": "warningOn", "isVisible": false },
                  { "elementId": "warningOff", "isVisible": true },
                  { "elementId": "llantaOn", "isVisible": false },
                  { "elementId": "llantaOff", "isVisible": true },
                  { "elementId": "pendienteOn", "isVisible": false },
                  { "elementId": "pendienteOff", "isVisible": true },
                  { "elementId": "formDeuda", "isVisible": false },
                  { "elementId": "formSaldo", "isVisible": false },
                  { "elementId": "formWarning", "isVisible": false },
                  { "elementId": "formMulta", "isVisible": true },
                  { "elementId": "formLlanta", "isVisible": false },
                  { "elementId": "formPendiente", "isVisible": false }
                ]
              },
              "items": [
                { "type": "TextBlock", "text": "Multa", "horizontalAlignment": "Center" }
              ]
            },
            {
              "type": "Container",
              "id": "multaOn",
              "isVisible": false,
              "items": [
                {
                  "type": "TextBlock",
                  "text": "Multa",
                  "weight": "Bolder",
                  "color": "Good",
                  "horizontalAlignment": "Center"
                },
                {
                  "type": "Container",
                  "style": "good",
                  "minHeight": "3px"
                }
              ]
            }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "Container",
              "id": "llantaOff",
              "selectAction": {
                "type": "Action.ToggleVisibility",
                "targetElements": [
                  { "elementId": "llantaOn", "isVisible": true },
                  { "elementId": "llantaOff", "isVisible": false },
                  { "elementId": "deudaOn", "isVisible": false },
                  { "elementId": "deudaOff", "isVisible": true },
                  { "elementId": "saldoOn", "isVisible": false },
                  { "elementId": "saldoOff", "isVisible": true },
                  { "elementId": "warningOn", "isVisible": false },
                  { "elementId": "warningOff", "isVisible": true },
                  { "elementId": "multaOn", "isVisible": false },
                  { "elementId": "multaOff", "isVisible": true },
                  { "elementId": "pendienteOn", "isVisible": false },
                  { "elementId": "pendienteOff", "isVisible": true },
                  { "elementId": "formDeuda", "isVisible": false },
                  { "elementId": "formSaldo", "isVisible": false },
                  { "elementId": "formWarning", "isVisible": false },
                  { "elementId": "formMulta", "isVisible": false },
                  { "elementId": "formLlanta", "isVisible": true },
                  { "elementId": "formPendiente", "isVisible": false }
                ]
              },
              "items": [
                { "type": "TextBlock", "text": "Llanta", "horizontalAlignment": "Center" }
              ]
            },
            {
              "type": "Container",
              "id": "llantaOn",
              "isVisible": false,
              "items": [
                {
                  "type": "TextBlock",
                  "text": "Llanta",
                  "weight": "Bolder",
                  "color": "Good",
                  "horizontalAlignment": "Center"
                },
                {
                  "type": "Container",
                  "style": "good",
                  "minHeight": "3px"
                }
              ]
            }
          ]
        },
        {
          "type": "Column",
          "width": "stretch",
          "items": [
            {
              "type": "Container",
              "id": "pendienteOff",
              "selectAction": {
                "type": "Action.ToggleVisibility",
                "targetElements": [
                  { "elementId": "pendienteOn", "isVisible": true },
                  { "elementId": "pendienteOff", "isVisible": false },
                  { "elementId": "deudaOn", "isVisible": false },
                  { "elementId": "deudaOff", "isVisible": true },
                  { "elementId": "saldoOn", "isVisible": false },
                  { "elementId": "saldoOff", "isVisible": true },
                  { "elementId": "warningOn", "isVisible": false },
                  { "elementId": "warningOff", "isVisible": true },
                  { "elementId": "multaOn", "isVisible": false },
                  { "elementId": "multaOff", "isVisible": true },
                  { "elementId": "llantaOn", "isVisible": false },
                  { "elementId": "llantaOff", "isVisible": true },
                  { "elementId": "formDeuda", "isVisible": false },
                  { "elementId": "formSaldo", "isVisible": false },
                  { "elementId": "formWarning", "isVisible": false },
                  { "elementId": "formMulta", "isVisible": false },
                  { "elementId": "formLlanta", "isVisible": false },
                  { "elementId": "formPendiente", "isVisible": true }
                ]
              },
              "items": [
                { "type": "TextBlock", "text": "Pendiente", "horizontalAlignment": "Center" }
              ]
            },
            {
              "type": "Container",
              "id": "pendienteOn",
              "isVisible": false,
              "items": [
                {
                  "type": "TextBlock",
                  "text": "Pendiente",
                  "weight": "Bolder",
                  "color": "Good",
                  "horizontalAlignment": "Center"
                },
                {
                  "type": "Container",
                  "style": "good",
                  "minHeight": "3px"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "Container",
      "id": "formDeuda",
      "isVisible": false,
      "spacing": "Medium",
      "items": [
        { "type": "Input.Text", "id": "numero_servicio_deuda", "label": "N° de servicio", "value": "S/N" },
        {
          "type": "Input.ChoiceSet",
          "id": "notificar_deuda",
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
        { "type": "Input.Text", "id": "nombre_cliente_deuda", "label": "Nombre de cliente" },
        { "type": "Input.Text", "id": "telefono_cliente_deuda", "label": "Teléfono de cliente" },
        { "type": "Input.Text", "id": "monto_deuda", "label": "Monto", "placeholder": "$0" },
        { "type": "Input.Text", "id": "observacion_deuda", "label": "Observaciones", "isMultiline": true }
      ]
    },
    {
      "type": "Container",
      "id": "formSaldo",
      "isVisible": false,
      "items": [
        { "type": "Input.Text", "id": "numero_servicio_saldo", "label": "N° de servicio", "value": "S/N" },
        {
          "type": "Input.ChoiceSet",
          "id": "notificar_saldo",
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
        { "type": "Input.Text", "id": "nombre_cliente_saldo", "label": "Nombre de cliente" },
        { "type": "Input.Text", "id": "telefono_cliente_saldo", "label": "Teléfono de cliente" },
        { "type": "Input.Text", "id": "monto_saldo", "label": "Monto", "placeholder": "$0" },
        { "type": "Input.Text", "id": "observacion_saldo", "label": "Observaciones", "isMultiline": true }
      ]
    },
    {
      "type": "Container",
      "id": "formWarning",
      "isVisible": false,
      "items": [
        { "type": "Input.Text", "id": "numero_servicio_warning", "label": "N° de servicio", "value": "S/N" },
        { "type": "Input.Text", "id": "unidad_warning", "label": "Unidad", "value": "D" },
        { "type": "Input.Text", "id": "observacion_warning", "label": "Observaciones", "isMultiline": true }
      ]
    },
    {
      "type": "Container",
      "id": "formMulta",
      "isVisible": false,
      "items": [
        { "type": "Input.Text", "id": "numero_servicio_multa", "label": "N° de servicio", "value": "S/N" },
        {
          "type": "Input.ChoiceSet",
          "id": "tipo_multa",
          "label": "Multa",
          "style": "compact",
          "choices": [ { "title": "Ejemplo 1", "value": "1" } ]
        },
        {
          "type": "Input.ChoiceSet",
          "id": "notificar_multa",
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
        { "type": "Input.Text", "id": "nombre_cliente_multa", "label": "Nombre de cliente" },
        { "type": "Input.Text", "id": "telefono_cliente_multa", "label": "Teléfono de cliente" },
        { "type": "Input.Text", "id": "unidad_multa", "label": "Unidad", "value": "D" },
        { "type": "Input.Text", "id": "observacion_multa", "label": "Observaciones", "isMultiline": true }
      ]
    },
    {
      "type": "Container",
      "id": "formLlanta",
      "isVisible": false,
      "items": [
        { "type": "Input.Text", "id": "numero_servicio_llanta", "label": "N° de servicio", "value": "S/N" },
        { "type": "Input.Text", "id": "unidad_llanta", "label": "Unidad", "value": "D" }
      ]
    },
    {
      "type": "Container",
      "id": "formPendiente",
      "isVisible": false,
      "items": [
        { "type": "Input.Text", "id": "numero_servicio_pendiente", "label": "N° de servicio", "value": "S/N" },
        {
          "type": "Input.ChoiceSet",
          "id": "notificar_pendiente",
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
        { "type": "Input.Text", "id": "nombre_cliente_pendiente", "label": "Nombre de cliente" },
        { "type": "Input.Text", "id": "telefono_cliente_pendiente", "label": "Teléfono de cliente" },
        { "type": "Input.Text", "id": "unidad_pendiente", "label": "Unidad", "value": "D" },
        { "type": "Input.Text", "id": "observacion_pendiente", "label": "Observación a analizar", "isMultiline": true }
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
