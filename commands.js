const { MessageEmbed } = require('discord.js');

const { createRaid } = require('./raids.js');

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

async function attemptInteractionEvaluation(interaction, client) {
    if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	if (commandName === 'createraid') {
		await interaction.reply({ content: 'Created!', ephemeral: true });
		const raid = interaction.options.getString('raid');
		const partySize = interaction.options.getInteger('partysize');
		const datetime = interaction.options.getString("datetime");
		createRaid(client, raid, partySize, datetime, interaction.channel.id);
	} else if (commandName == 'setchannel') {
        setChannel(interaction);
        succeeded = true;
    } else if (commandName == 'ping') {
        await interaction.reply({ content: 'PONG!' });
    }
};

function registerCommands(client, authToken, clientId) {
    for (const [guildKey, guild] of client.guilds.cache) {
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
                ["Vault of Glass","vaultOfGlass"]])),
            new SlashCommandBuilder().setName('ping').setDescription('Wanna play a game?'),
            new SlashCommandBuilder().setName('setchannel').setDescription('Set the current channel for the reminder to send a message in.'),
        ].map(command => command.toJSON());

        const rest = new REST({ version: '9' }).setToken(authToken);

        rest.put(Routes.applicationGuildCommands(clientId, guildKey), { body: commands })
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error);
    }
};

exports.attemptInteractionEvaluation = attemptInteractionEvaluation;
exports.registerCommands = registerCommands;