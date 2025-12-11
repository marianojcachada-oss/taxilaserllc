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
        const text = context.activity.text?.trim()?.toLowerCase() || "";

        console.log("📩 Mensaje recibido:", text);

        // Comando principal
        if (text === "/crearreporte") {
            console.log("➡️ Ejecutando /crearreporte");
            try {
                console.log("➡️ Enviando datos al Flow:", process.env.PA_FLOW_URL);

                const respuesta = await fetch(process.env.PA_FLOW_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        usuario: context.activity.from.name,
                        message: text,
                        fecha: new Date().toISOString()
                    })
                });

                console.log("➡️ Status Flow:", respuesta.status);

                if (!respuesta.ok) {
                    throw new Error(`Flow devolvió código ${respuesta.status}`);
                }

                const card = await respuesta.json();

                await context.sendActivity({
                    attachments: [card.attachments[0]]
                });

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
