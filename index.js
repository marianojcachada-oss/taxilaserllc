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

            // EXTRAEMOS TODOS LOS DATOS IMPORTANTES DE TEAMS
            const payload = {
                usuario: context.activity.from.name,
                message: text,
                fecha: new Date().toISOString(),

                // 🔥 ESTO ES LO QUE POWER AUTOMATE NECESITA
                teamsUserId: context.activity.from.id || null,
                aadObjectId: context.activity.from.aadObjectId || null,
                conversationId: context.activity.conversation?.id || null,
                serviceUrl: context.activity.serviceUrl || null
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

                // Si no es JSON válido, no intentamos parsear
                let card = null;
                try {
                    card = JSON.parse(raw);
                } catch {
                    console.log("⚠️ El Flow no devolvió JSON.");
                }

                // Si el Flow devuelve AdaptiveCard, enviamos
                if (card?.attachments?.[0]) {
                    await context.sendActivity({
                        attachments: [card.attachments[0]]
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
