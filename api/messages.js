import { CloudAdapter, ConfigurationServiceClientCredentialFactory, BotFrameworkHttpAdapter } from 'botbuilder';
import { TeamsBot } from '../src/bot.js';

// Variables de entorno (añádelas en Vercel > Settings > Environment Variables)
const appId = process.env.MicrosoftAppId;
const appPassword = process.env.MicrosoftAppPassword;
const appTenantId = process.env.MicrosoftAppTenantId; // opcional si es single-tenant

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: appId,
  MicrosoftAppPassword: appPassword,
  MicrosoftAppType: process.env.MicrosoftAppType || 'MultiTenant',
  MicrosoftAppTenantId: appTenantId
});

const adapter = new CloudAdapter(credentialsFactory);
const bot = new TeamsBot();

// Vercel: exportar handler
export default async function handler(req, res) {
  // Solo aceptar POST desde Bot Framework
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  await adapter.process(req, res, async (context) => {
    await bot.run(context);
  });
}
