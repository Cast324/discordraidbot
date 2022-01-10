const { Client, Intents } = require('discord.js');

const auth = require('./auth.json');
const commands = require('./commands.js');
const { createRaid } = require('./raids.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'createraid') {
		createRaid(client);
		await interaction.reply({content: 'Created!', ephemeral: true});
	} else if (commandName === 'addmention') {
		await interaction.reply('Server info.');
	} else if (commandName === 'removemention') {
		await interaction.reply('User info.');
	}
});

client.login(auth.token);
