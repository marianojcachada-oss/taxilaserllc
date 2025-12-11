
// src/bot.js
import { ActivityTypes, TurnContext } from 'botbuilder';

export class TeamsBot {
  async run(context) {
    if (context.activity.type === ActivityTypes.Message) {
      // Texto limpio (en Teams puede venir con @menciones)
      const rawText = context.activity.text || '';
      const text = rawText.trim().toLowerCase();

      // Coincidencia simple de comando
      if (text.startsWith('/crear-reporte')) {
        // Datos útiles que puedes enviar al Flow:
        const from = context.activity.from || {};
        const conversation = context.activity.conversation || {};
        const payload = {
          command: 'crear-reporte',
          userAadObjectId: from.aadObjectId,
          userName: from.name,
          teamId: conversation?.tenantId,
          channelId: conversation?.id,
          rawText
        };

        // Llamada HTTP al Flow (trigger HTTP)
        const flowUrl = process.env.PA_FLOW_URL; "https://defaultc8aebb6cc6aa405da76b057a64fbdc.17.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/dfddeee54d7e4ec7b070b66cbb27e3c8/triggers/manual/paths/invoke?api-version=1"
        const flowKey = process.env.PA_FLOW_KEY || '';  // Si proteges con una key propia

        try {
          const resp = await fetch(flowUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(flowKey ? { 'x-api-key': flowKey } : {})
            },
            body: JSON.stringify(payload)
          });

          if (resp.ok) {
            await context.sendActivity('✅ Solicitud enviada. Revisa el Adaptive Card en Teams.');
          } else {
            const body = await resp.text();
            await context.sendActivity(`⚠️ El Flow devolvió error (${resp.status}). Detalle: ${body}`);
          }
        } catch (err) {
          await context.sendActivity(`❌ Error llamando a Power Automate: ${err.message}`);
        }
      } else {
        await context.sendActivity('Escribe **/crear-reporte** para iniciar el flujo.');
      }
    }
  }
}
