const { Client, Intents } = require('discord.js');
var auth = {};
if (!process.env.AUTH_TOKEN && !process.env.CLIENT_ID && !process.env.GUILD_ID) {
	auth = require('./auth.json');
}
const commands = require('./commands.js');
const { createRaid, setupRaids } = require('./raids.js');
const scheduler = require('./scheduler.js');

const client = new Client({ intents: [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
]});

if (process.env.AUTH_TOKEN != null && process.env.CLIENT_ID != null && process.env.GUILD_ID != null) {
	auth.token = process.env.AUTH_TOKEN;
  }

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	setupRaids(client);
	await scheduler.start();
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'createraid') {
		await interaction.reply({ content: 'Created!', ephemeral: true });
		const raid = interaction.options.getString('raid');
		const partySize = interaction.options.getInteger('partysize');
		const datetime = interaction.options.getString("datetime");
		createRaid(client, raid, partySize, datetime);
	} else if (commandName === 'addmention') {
		await interaction.reply('Server info.');
	} else if (commandName === 'removemention') {
		await interaction.reply('User info.');
	}
});

client.login(auth.token);
