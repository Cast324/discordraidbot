const { MessageEmbed } = require('discord.js');

const { MENTION_LIST_FILE_PATH, readInFile, writeFile } = require('./file_reader.js');

var mentionsList = [];
var thoseThatAreIn = [];
var thoseThatAreOut = [];
var hunters = [];
var titans = [];
var warlocks = [];
var players = 0;

var savedMessage = null;

function createRaid(client, raid, partySize, date) {
  readInFile(MENTION_LIST_FILE_PATH, data => {
    const settings = JSON.parse(data);
    var channel = null;

    for (const [guildKey, guild] of client.guilds.cache) {
      for (const [channelKey, cachedChannel] of guild.channels.cache) {
        if (channelKey == settings.channelToSendTo) {
          channel = cachedChannel;
        }
      }
    }
    if (channel !== null) {
      const raidName = getRaidName(raid);
      channel.send({
        "tts": false,
        "embeds": [
          {
            "type": "rich",
            "title": `${raidName} on ${date}`,
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
                "name": `__🧙Warlock:__`,
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
        .then(embededMessage => {
          embededMessage.react('🏹');
          embededMessage.react('🔨');
          embededMessage.react('🧙');

          const filter = (reaction, user) => {
            return ['🏹', '🔨', '🧙'].includes(reaction.emoji.name) && user.id !== embededMessage.author.id;
          };

          const collector = embededMessage.createReactionCollector({ filter, time: 86400000, dispose: true });

          collector.on('collect', async (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            players += 1;
            const editedEmbed = embededMessage.embeds[0];
            editedEmbed.description = `Slots filled ${players}/${partySize}`;
            if (reaction.emoji.name == '🏹') {
              await addUserToList(user.id, '🏹');
              editedEmbed.fields[0] = { name: editedEmbed.fields[0].name, value: await getFieldValue('🏹'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            } else if (reaction.emoji.name == '🔨') {
              await addUserToList(user.id, '🔨');
              editedEmbed.fields[1] = { name: editedEmbed.fields[1].name, value: await getFieldValue('🔨'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            } else if (reaction.emoji.name == '🧙') {
              await addUserToList(user.id, '🧙');
              editedEmbed.fields[2] = { name: editedEmbed.fields[2].name, value: await getFieldValue('🧙'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            }
            embededMessage.edit({ description: [`Slots filled ${players}/${partySize}`] });
          });

          collector.on('remove', async (reaction, user) => {
            console.log(`Removed ${user.tag}`);
            players -= 1;
            const editedEmbed = embededMessage.embeds[0];
            editedEmbed.description = `Slots filled ${players}/${partySize}`;
            if (reaction.emoji.name == '🏹') {
              await removeUserFromList(user.id, '🏹');
              editedEmbed.fields[0] = { name: editedEmbed.fields[0].name, value: await getFieldValue('🏹'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            } else if (reaction.emoji.name == '🔨') {
              await removeUserFromList(user.id, '🔨');
              editedEmbed.fields[1] = { name: editedEmbed.fields[1].name, value: await getFieldValue('🔨'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            } else if (reaction.emoji.name == '🧙') {
              await removeUserFromList(user.id, '🧙');
              editedEmbed.fields[2] = { name: editedEmbed.fields[2].name, value: await getFieldValue('🧙'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            }
          });

          collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
          });
        });

    }
  })
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

function addUserToList(user, type) {
  if (type == '🏹') {
    hunters.push(`${user}`);
  } else if (type == '🔨') {
    titans.push(`${user}`);
  } else {
    warlocks.push(`${user}`);
  }
};

function removeUserFromList(user, type) {
  if (type == '🏹') {
    hunters = hunters.filter((value) => {
      return value !== user;
    });
  } else if (type == '🔨') {
    titans = titans.filter((value) => {
      return value !== user;
    });
  } else {
    warlocks = warlocks.filter((value) => {
      return value !== user;
    });
  }
};

function getFieldValue(type) {
  var fieldValue = "";
  if (type == '🏹') {
    hunters.forEach(user => {
      fieldValue += `<@${user}>\n`;
    });
  } else if (type == '🔨') {
    titans.forEach(user => {
      fieldValue += `<@${user}>\n`;
    });
  } else {
    warlocks.forEach(user => {
      fieldValue += `<@${user}>\n`;
    });
  }

  if (fieldValue === '') {
    fieldValue = 'No Players 😢'
  }
  return fieldValue;
};

exports.createRaid = createRaid;

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