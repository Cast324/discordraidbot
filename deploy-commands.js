const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
if (!process.env.AUTH_TOKEN && !process.env.CLIENT_ID && !process.env.GUILD_ID) {
	auth = require('./auth.json');
}

if (process.env.AUTH_TOKEN != null && process.env.CLIENT_ID != null && process.env.GUILD_ID != null) {
	auth.token = process.env.AUTH_TOKEN;
	auth.clientId = process.env.CLIENT_ID;
	auth.guildId = process.env.GUILD_ID;
  }

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

const rest = new REST({ version: '9' }).setToken(auth.token);

rest.put(Routes.applicationGuildCommands(auth.clientId, auth.guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);