const express = require('express');
const fetch = require('node-fetch');

const {
    CloudAdapter,
    ActivityHandler,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration
} = require('botbuilder');

// === CONFIGURACIÓN DE CREDENCIALES === //
const credentialsFactory = new ConfigurationServiceClientCredentialFactory(
    process.env.MICROSOFT_APP_ID,
    process.env.MICROSOFT_APP_PASSWORD
);

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(
    null,
    credentialsFactory
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

// === MANEJO DE ERRORES === //
adapter.onTurnError = async (context, error) => {
    console.error("❌ Error en el bot:", error);
    await context.sendActivity("Ocurrió un error interno en el bot.");
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
                    // Llamar a Power Automate
                    const respuesta = await fetch(process.env.PA_FLOW_URL, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: context.activity.from.id,
                            userName: context.activity.from.name,
                            conversationId: context.activity.conversation.id,
                            serviceUrl: context.activity.serviceUrl,
                            comando: text
                        })
                    });

                    const card = await respuesta.json();

                    // Enviar Adaptive Card devuelta por Power Automate
                    await context.sendActivity({
                        attachments: [card.attachments[0]]
                    });

                } catch (err) {
                    console.error(err);
                    await context.sendActivity("⚠️ Error al llamar a Power Automate.");
                }
            } else {
                await context.sendActivity("Comando no reconocido. Usá **/crearreporte**.");
            }

            await next();
        });
    }
}

const bot = new TaxiLaserBot();

// === SERVIDOR EXPRESS === //
const app = express();
app.use(express.json());

// ENDPOINT REQUERIDO POR TEAMS
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// Puerto Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚕 TaxiLaser Bot escuchando en puerto ${PORT}`);
});
