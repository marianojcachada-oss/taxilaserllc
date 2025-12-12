const express = require("express");
const fetch = require("node-fetch");
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration
} = require("botbuilder");

const app = express();
app.use(express.json());

// Endpoint para evitar que Render duerma
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

// Manejo global de errores
adapter.onTurnError = async (context, error) => {
    console.error("❌ Error:", error);
    await context.sendActivity("⚠️ Ocurrió un error.");
};

// -----------------------------
// BOT LOGIC
// -----------------------------
const bot = {
    async run(context) {

        console.log("📨 ACTIVITY COMPLETA:", JSON.stringify(context.activity, null, 2));

        const text = context.activity.text?.trim()?.toLowerCase() || "";
        console.log("📩 Mensaje recibido:", text);

        // Comando principal
        if (text === "/crearreporte") {
            console.log("➡️ Ejecutando /crearreporte");

            // Datos enviados al Flow
           const payload = {
    type: "message",
    
    from: {
        id: context.activity.from.id,
        name: context.activity.from.name,
        aadObjectId: context.activity.from.aadObjectId
    },

    conversation: {
        id: context.activity.conversation.id
    },

    serviceUrl: context.activity.serviceUrl,

    text: text,
    fecha: new Date().toISOString()
};


            console.log("📦 Payload enviado al Flow:", payload);

            try {
                console.log("➡️ Llamando al Flow:", process.env.PA_FLOW_URL);

                const respuesta = await fetch(process.env.PA_FLOW_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                console.log("➡️ Status Flow:", respuesta.status);

                const raw = await respuesta.text();
                console.log("📥 Respuesta RAW del Flow:", raw);

                // Intentamos parsear JSON
                let card = null;
                try {
                    card = JSON.parse(raw);
                } catch {
                    console.log("⚠️ El Flow no devolvió JSON válido.");
                }

                // Si el Flow devuelve tarjeta
                if (card?.attachments?.[0]) {
                    const original = card.attachments[0];

                    // 🔥 FIX FINAL PARA TEAMS
                    const attachment = {
                        contentType: original.contentType,
                        content: original.content,
                        contentUrl: null // ← obligatorio en MS Teams personal scope
                    };

                    console.log("📤 Enviando Adaptive Card final al usuario...");

                    await context.sendActivity({
                        attachments: [attachment]
                    });

                } else {
                    await context.sendActivity("El Flow respondió pero no devolvió una Adaptive Card.");
                }

                return;

            } catch (err) {
                console.error("❌ Error llamando al Flow:", err);
                await context.sendActivity("⚠️ No pude contactar a Power Automate.");
                return;
            }
        }

        // Respuesta default
        await context.sendActivity("👋 Hola! Escribí /crearreporte para generar un reporte.");
    }
};

// -----------------------------
// Endpoint del bot
// -----------------------------
app.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚕 TaxiLaser Bot escuchando en puerto ${PORT}`));
