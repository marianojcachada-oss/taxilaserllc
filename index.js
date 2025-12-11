const express = require('express');
const { BotFrameworkAdapter } = require('botbuilder');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// Credenciales del bot de Azure
const adapter = new BotFrameworkAdapter({
    appId: process.env.a2096582-bf9e-4520-ab9d-9d51d1ea1be1,
    appPassword: process.env.53e694f5-9c69-49cd-b644-9c06bfb22463
});

// Bot logic
adapter.onTurn(async (context) => {
    if (context.activity.type === 'message') {
        const text = context.activity.text.trim().toLowerCase();

        if (text === '/crearreporte') {
            try {
                // Llamada al flujo Power Automate
                const respuesta = await fetch(process.env."https://defaultc8aebb6cc6aa405da76b057a64fbdc.17.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/dfddeee54d7e4ec7b070b66cbb27e3c8/triggers/manual/paths/invoke?api-version=1", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario: context.activity.from.name,
                        texto: text,
                        fecha: new Date().toISOString()
                    })
                });

                const card = await respuesta.json();

                await context.sendActivity({
                    attachments: [card.attachments[0]]
                });

            } catch (err) {
                console.error(err);
                await context.sendActivity("Error al comunicarse con Power Automate.");
            }
        }
    }
});

// Endpoint para Teams
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async () => {});
});

// Start server
app.listen(3000, () => console.log('Bot escuchando en puerto 3000'));
