const { Client, Intents } = require('discord.js');
var auth = {};
if (!process.env.AUTH_TOKEN && !process.env.CLIENT_ID && !process.env.GUILD_ID) {
	auth = require('./auth.json');
}
const commands = require('./commands.js');
const { setupRaids } = require('./raids.js');
const scheduler = require('./scheduler.js');

const client = new Client({ intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
]});

if (process.env.AUTH_TOKEN != null && process.env.CLIENT_ID != null && process.env.GUILD_ID != null) {
	auth.token = process.env.AUTH_TOKEN;
	auth.clientId = process.env.CLIENT_ID;
}

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	commands.registerCommands(client, auth.token, auth.clientId);
	setupRaids(client);
	await scheduler.start();
});

client.on('interactionCreate', async interaction => {
	await commands.attemptInteractionEvaluation(interaction);
});

client.login(auth.token);
