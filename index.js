const express = require("express");
const { CloudAdapter, ConfigurationServiceClientCredentialFactory, createBotFrameworkAuthenticationFromConfiguration } = require("botbuilder");
const app = express();

app.use(express.json());

// Evita que Render caiga
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

// Manejo de errores
adapter.onTurnError = async (context, error) => {
    console.error(`❌ Error en el turno:`, error);
    await context.sendActivity("⚠️ Hubo un error procesando tu mensaje.");
};

// Bot simple para test
const bot = {
    async run(context) {
        await context.sendActivity("Hola! Soy TaxiLaser bot 🚕");
    }
};

// Endpoint REAL
app.post("/api/messages", async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

// Inicializar servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚕 TaxiLaser Bot escuchando en puerto ${PORT}`));
