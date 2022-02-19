const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./auth.json');

const commands = [
	new SlashCommandBuilder().setName('createraid').setDescription('Create Raid!')
	.addIntegerOption(option => option.setName('partysize').setDescription('Enter a party size needed for raid. (1-6)'))
	.addStringOption(option => option.setName('datetime').setDescription('Enter a date and time for raid. Ex (2/17/2022 5pm)'))
	.addStringOption(option => option.setName('raid').setDescription('Select a Raid').setChoices([
	["Leviathan", "leviathan"],
	["Last Wish","lastWish"],
	["Scourge of the Past","scourgeOfThePast"],
	["Crown of Sorrow","crownOfSorrow"],
	["Garden of Salvation","gardenOfSalvation"],
	["Deep Stone Crypt","deepStoneCrypt"],
	["Vault of Glass","vaultOfGlass"]]))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);