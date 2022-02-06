const { MessageEmbed } = require('discord.js');
const { ConnectionCheckedInEvent } = require('mongodb');
const connect = require('./connect.js');
const {Raid} = require('./raid');

const { MENTION_LIST_FILE_PATH, readInFile, writeFile } = require('./file_reader.js');


var players = 0;

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

          const raid = new Raid(date, raidName, partySize, "testUser", embededMessage.id, embededMessage.channelId);
          await connect.createRaid(raid);

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
              await addUserToList(embededMessage.id, user.id, '🏹');
              editedEmbed.fields[0] = { name: editedEmbed.fields[0].name, value: await getFieldValue(embededMessage.id, '🏹'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            } else if (reaction.emoji.name == '🔨') {
              await addUserToList(embededMessage.id, user.id, '🔨');
              editedEmbed.fields[1] = { name: editedEmbed.fields[1].name, value: await getFieldValue(embededMessage.id, '🔨'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            } else if (reaction.emoji.name == '🧙') {
              await addUserToList(embededMessage.id, user.id, '🧙');
              editedEmbed.fields[2] = { name: editedEmbed.fields[2].name, value: await getFieldValue(embededMessage.id, '🧙'), inline: true };
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
              await removeUserFromList(embededMessage.id, user.id, '🏹');
              editedEmbed.fields[0] = { name: editedEmbed.fields[0].name, value: await getFieldValue(embededMessage.id, '🏹'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            } else if (reaction.emoji.name == '🔨') {
              await removeUserFromList(embededMessage.id, user.id, '🔨');
              editedEmbed.fields[1] = { name: editedEmbed.fields[1].name, value: await getFieldValue(embededMessage.id, '🔨'), inline: true };
              embededMessage.edit({ embeds: [editedEmbed] });
            } else if (reaction.emoji.name == '🧙') {
              await removeUserFromList(embededMessage.id, user.id, '🧙');
              editedEmbed.fields[2] = { name: editedEmbed.fields[2].name, value: await getFieldValue(embededMessage.id, '🧙'), inline: true };
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

async function getFieldValue(messageId, type) {
  const raid = await connect.getRaid(messageId);
  if (raid == null) {
    console.log("No Raid Found!");
    return;
  }
  var fieldValue = "";
  if (type == '🏹') {
    raid.hunters.forEach(user => {
      fieldValue += `<@${user}>\n`;
    });
  } else if (type == '🔨') {
    raid.titans.forEach(user => {
      fieldValue += `<@${user}>\n`;
    });
  } else {
    raid.warlocks.forEach(user => {
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