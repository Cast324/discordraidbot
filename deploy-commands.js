const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./auth.json');

const commands = [
	new SlashCommandBuilder().setName('rollcall').setDescription('Replies with a test rollcall'),
	new SlashCommandBuilder().setName('addmention').setDescription('Add a user to the mention list'),
	new SlashCommandBuilder().setName('removemention').setDescription('Removes a user from the mention list'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);