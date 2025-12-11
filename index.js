const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const {
    CloudAdapter,
    ActivityHandler,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration
} = require('botbuilder');

// === CONFIGURACIÓN DE CREDENCIALES === //
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MICROSOFT_APP_ID,
    MicrosoftAppPassword: process.env.MICROSOFT_APP_PASSWORD,
    MicrosoftAppType: "SingleTenant",
    MicrosoftAppTenantId: process.env.MICROSOFT_APP_TENANT_ID
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(
    null,
    credentialsFactory
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

// === MANEJO DE ERRORES === //
adapter.onTurnError = async (context, error) => {
    console.error("❌ Error en el bot:", error);
    await context.sendActivity("⚠️ Ocurrió un error interno en el bot.");
};

// === DEFINICIÓN DEL BOT === //
class TaxiLaserBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            const text = context.activity.text.trim().toLowerCase();

            if (text === "/crearreporte") {
                await context.sendActivity("⏳ Procesando tu solicitud de reporte...");

                try {
                    const respuesta = await fetch(process.env.PA_FLOW_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: context.activity.from.id,
                            userName: context.activity.from.name,
                            conversationId: context.activity.conversation.id,
                            serviceUrl: context.activity.serviceUrl
                        })
                    });

                    const card = await respuesta.json();

                    await context.sendActivity({
                        attachments: [card.attachments[0]]
                    });

                } catch (err) {
                    console.error(err);
                    await context.sendActivity("⚠️ Error al comunicarse con Power Automate.");
                }
            } else {
                await context.sendActivity("Comando no reconocido. Usá **/crearreporte**.");
            }

            await next();
        });
    }
}

const bot = new TaxiLaserBot();

const app = express();
app.use(express.json());

app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚕 TaxiLaser Bot escuchando en puerto ${PORT}`);
});
