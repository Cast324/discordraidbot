const { ConnectionCheckedInEvent } = require('mongodb');
const connect = require('./connect.js');
const { Raid } = require('./raid');
const scheduler = require('./scheduler.js');
const { Client, Intents, Permissions, PrivacyLevel, MessageEmbed } = require('discord.js');
const chrono = require('chrono-node');

var clientServer;

function setupRaids(client) {
  clientServer = client;
}

function createRaid(client, raid, partySize, datetime, channelId) {
  clientServer = client;
    var channel = null;
    var destinyRoll = null;

    for (const [guildKey, guild] of client.guilds.cache) {
      for (const [channelKey, cachedChannel] of guild.channels.cache) {
        if (channelKey == channelId) {
          channel = cachedChannel;
        }
      }

      for (const [roleKey, role] of guild.roles.cache) {
        if (role.name == 'destiny2' || role.name == 'destiny') {
          destinyRoll = role.id;
        }
      }
    }

    if (channel !== null) {
      const date = chrono.parseDate(datetime)
      const raidName = getRaidName(raid);
      channel.send({
        "tts": false,
        "content": `Squad up, <@&${destinyRoll}>! A new raid just dropped.`,
        "embeds": [
          {
            "type": "rich",
            "title": `${raidName} on ${datetime}`,
            "description": `Slots filled 0/${partySize}`,
            "color": 0x00FFFF,
            "fields": [
              {
                "name": `__🏹Hunters:__`,
                "value": `No Players 😢`,
                "inline": true
              },
              {
                "name": `__🔨Titans:__`,
                "value": `No Players 😢`,
                "inline": true
              },
              {
                "name": `__🧙Warlocks:__`,
                "value": `No Players 😢`,
                "inline": true
              }
            ],
            "thumbnail": {
              "url": `https://yt3.ggpht.com/9jGpeBrg6BvsqBroU6rbXg_DHB8HY-Ewgn_Io4L8Iqlsag2LGyz212D9_QUBLaRP2rkgQ-rlbA=s900-c-k-c0x00ffffff-no-rj`,
              "height": 0,
              "width": 0
            }
          }
        ]
      })
        .then(async embededMessage => {
          embededMessage.react('🏹');
          embededMessage.react('🔨');
          embededMessage.react('🧙');

          const everyoneRole = channel.guild.roles.cache.find(r => r.name === '@everyone');
          var raidCategory = channel.guild.channels.cache.find(c => c.name === 'Raid Channels');
          if (raidCategory == null) {
            await channel.guild.channels.create('Raid Channels', {
              type: 'GUILD_CATEGORY',
              permissionOverwrites: [
                {
                  id: everyoneRole.id,
                  deny: [Permissions.FLAGS.VIEW_CHANNEL]
                }
              ]
            }).then(channelCategory => raidCategory = channelCategory)
          };

          var eventId = null;
          var voiceChannelId = null;
          await channel.guild.channels.create(`${raidName}`, {
            type: 'GUILD_VOICE',
            parent: raidCategory.id
          }).then(async voiceChannel => {
            voiceChannelId = voiceChannel.id;
            await voiceChannel.guild.scheduledEvents.create({
              name: `📆 ${raidName} — ${partySize} participants`,
              scheduledStartTime: date,
              privacyLevel: 'GUILD_ONLY',
              entityType: 'VOICE',
              channel: voiceChannel,
            }).then(event => {
              eventId = event.id;
            });

            voiceChannel.permissionOverwrites.edit(everyoneRole, {
              VIEW_CHANNEL: true
            });
          });

          const raid = new Raid(date, raidName, partySize, "testUser", embededMessage.id, embededMessage.channelId, embededMessage.guild.id, voiceChannelId, eventId);
          await connect.createRaid(raid);

          await scheduler.scheduleReminder(embededMessage.id, datetime);

          const filter = (reaction, user) => {
            return ['🏹', '🔨', '🧙'].includes(reaction.emoji.name) && user.id !== embededMessage.author.id;
          };

          const collector = embededMessage.createReactionCollector({ filter, time: 86400000, dispose: true });

          collector.on('collect', async (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);

            const editedEmbed = embededMessage.embeds[0];
            const raid = await connect.getRaid(embededMessage.id);
            if (raid.hunters.includes(user.id) || raid.titans.includes(user.id) || raid.warlocks.includes(user.id)) {
              user.send("You are already in the raid! No need to join again! 😀");
              embededMessage.reactions.resolve(reaction.emoji.name).users.remove(user.id);
              return;
            }
            raid.slotsFilled += 1;
            await connect.updateRaid(embededMessage.id, raid);
            editedEmbed.description = `Slots filled ${raid.slotsFilled}/${raid.partySize}`;
            if (reaction.emoji.name == '🏹') {
              await addUserToList(embededMessage.id, user.id, '🏹');
            } else if (reaction.emoji.name == '🔨') {
              await addUserToList(embededMessage.id, user.id, '🔨');
            } else if (reaction.emoji.name == '🧙') {
              await addUserToList(embededMessage.id, user.id, '🧙');
            }

            const fieldValues = await getFieldValues(embededMessage.id);
            editedEmbed.fields[0] = { name: editedEmbed.fields[0].name, value: fieldValues.hunters, inline: true };
            editedEmbed.fields[1] = { name: editedEmbed.fields[1].name, value: fieldValues.titans, inline: true };
            editedEmbed.fields[2] = { name: editedEmbed.fields[2].name, value: fieldValues.warlocks, inline: true };
            embededMessage.edit({ embeds: [editedEmbed] });
          });

          collector.on('remove', async (reaction, user) => {
            console.log(`Removed ${user.tag}`);
            const editedEmbed = embededMessage.embeds[0];
            if (reaction.emoji.name == '🏹') {
              await removeUserFromList(embededMessage.id, user.id, '🏹');
            } else if (reaction.emoji.name == '🔨') {
              await removeUserFromList(embededMessage.id, user.id, '🔨');
            } else if (reaction.emoji.name == '🧙') {
              await removeUserFromList(embededMessage.id, user.id, '🧙');
            }
            const raid = await connect.getRaid(embededMessage.id);
            if (raid.hunters.includes(user.id) || raid.titans.includes(user.id) || raid.warlocks.includes(user.id)) {
              return;
            }
            raid.slotsFilled -= 1;
            await connect.updateRaid(embededMessage.id, raid);
            editedEmbed.description = `Slots filled ${raid.slotsFilled}/${raid.partySize}`;


            const fieldValues = await getFieldValues(embededMessage.id);
            editedEmbed.fields[0] = { name: editedEmbed.fields[0].name, value: fieldValues.hunters, inline: true };
            editedEmbed.fields[1] = { name: editedEmbed.fields[1].name, value: fieldValues.titans, inline: true };
            editedEmbed.fields[2] = { name: editedEmbed.fields[2].name, value: fieldValues.warlocks, inline: true };
            embededMessage.edit({ embeds: [editedEmbed] });
          });

          collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
          });
        });

    }
};

function getRaidName(raid) {
  var raidName;
  switch (raid) {
    case 'leviathan':
      raidName = 'Leviathan';
      break;
    case 'lastWish':
      raidName = 'Last Wish';
      break;
    case 'scourgeOfThePast':
      raidName = 'Scourge of the Past';
      break;
    case 'crownOfSorrow':
      raidName = 'Crown of Sorrow';
      break;
    case 'gardenOfSalvation':
      raidName = 'Garden of Salvation';
      break;
    case 'deepStoneCrypt':
      raidName = 'Deep Stone Crypt';
      break;
    case 'vaultOfGlass':
      raidName = 'Vault of Glass';
      break;
    default:
      raidName = raid;
  }

  return raidName;
};

async function addUserToList(messageId, user, type) {
  const raid = await connect.getRaid(messageId);
  if (raid == null) {
    console.log("No Raid Found!");
    return;
  }

  if (type == '🏹') {
    raid.hunters.push(`${user}`);
  } else if (type == '🔨') {
    raid.titans.push(`${user}`);
  } else {
    raid.warlocks.push(`${user}`);
  }
  await connect.updateRaid(messageId, raid);
};

async function removeUserFromList(messageId, user, type) {
  const raid = await connect.getRaid(messageId);
  if (raid == null) {
    console.log("No Raid Found!");
    return;
  }
  if (type == '🏹') {
    raid.hunters = raid.hunters.filter((value) => {
      return value !== user;
    });
  } else if (type == '🔨') {
    raid.titans = raid.titans.filter((value) => {
      return value !== user;
    });
  } else {
    raid.warlocks = raid.warlocks.filter((value) => {
      return value !== user;
    });
  }
  await connect.updateRaid(messageId, raid);
};

async function getFieldValues(messageId) {
  const raid = await connect.getRaid(messageId);
  if (raid == null) {
    console.log("No Raid Found!");
    return;
  }
  var fieldValues = {
    hunters: '',
    titans: '',
    warlocks: ''
  };


  raid.hunters.forEach(user => {
    fieldValues.hunters += `<@${user}>\n`;
  });
  if (fieldValues.hunters === '') {
    fieldValues.hunters = 'No Players 😢';
  }
  raid.titans.forEach(user => {
    fieldValues.titans += `<@${user}>\n`;
  });
  if (fieldValues.titans === '') {
    fieldValues.titans = 'No Players 😢';
  }
  raid.warlocks.forEach(user => {
    fieldValues.warlocks += `<@${user}>\n`;
  });
  if (fieldValues.warlocks === '') {
    fieldValues.warlocks = 'No Players 😢';
  }

  return fieldValues;
};

function getHumanReadableMentionsList(mentionsList) {
  var thoseToMention = '';
  if (mentionsList.length < 0 ) {
    thoseToMention = 'No one joined! 😭';
  }
  for (i = 0; i < mentionsList.length; i++) {
      if (mentionsList.length != 1 && i == mentionsList.length - 1) {
          thoseToMention += ' and '
      }

      thoseToMention += `<@${mentionsList[i]}>`

      if (mentionsList.length != 1 && i != mentionsList.length - 1 && mentionsList.length != 2) {
          thoseToMention += ', '
      }
  }
  return thoseToMention;
};

function sendMessageToChannel(message, raid) {
    var channel = null;

    for (const [guildKey, guild] of clientServer.guilds.cache) {
      for (const [channelKey, cachedChannel] of guild.channels.cache) {
        if (channelKey == raid.channelId) {
          channel = cachedChannel;
        }
      }
    }
    if (channel !== null) {
      const event = channel.guild.scheduledEvents.cache.find(event => event.id === raid.eventId);
      event.setStatus('ACTIVE');

      message['content'] = getHumanReadableMentionsList([].concat(raid.hunters, raid.titans, raid.warlocks));
      channel.send(message);
    }
}

function deleteChannel(channelId, guildId) {
    for (const [guildKey, guild] of clientServer.guilds.cache) {
        if (guild.id == guildId) {
          const voiceChannel = guild.channels.cache.find(c => c.id === channelId);
          if (voiceChannel.members.size > 0) {
            scheduler.scheduleFollowUpChannelDelete(channelId, guildId);
          } else {
            console.log(`Deleting voicechannel ${voiceChannel.id}`);
            voiceChannel.delete('Raid is Over!');
          }
        }
    }
}

exports.createRaid = createRaid;
exports.sendMessageToChannel = sendMessageToChannel;
exports.getFieldValues = getFieldValues;
exports.setupRaids = setupRaids;
exports.deleteChannel = deleteChannel;

// await lib.discord.channels['@0.2.0'].messages.create({
//   "channel_id": `${context.params.event.channel_id}`,
//   "content": `Destiny Raid `,
//   "tts": false,
//   "embeds": [
//     {
//       "type": "rich",
//       "title": `Destiny Raid`,
//       "description": `Sign up for Raid on 1/9/2022`,
//       "color": 0x00FFFF,
//       "fields": [
//         {
//           "name": `🏹Hunters:`,
//           "value": `🏹Testing Hunter`,
//           "inline": true
//         },
//         {
//           "name": `🔨Titans:`,
//           "value": `🔨Testing Titan`,
//           "inline": true
//         },
//         {
//           "name": `🧙Warlock:`,
//           "value": `🧙Testing Warlock`,
//           "inline": true
//         }
//       ],
//       "thumbnail": {
//         "url": `https://yt3.ggpht.com/9jGpeBrg6BvsqBroU6rbXg_DHB8HY-Ewgn_Io4L8Iqlsag2LGyz212D9_QUBLaRP2rkgQ-rlbA=s900-c-k-c0x00ffffff-no-rj`,
//         "height": 0,
//         "width": 0
//       }
//     }
//   ]
// });