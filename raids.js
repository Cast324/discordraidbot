const { MessageEmbed } = require('discord.js');

const { MENTION_LIST_FILE_PATH, readInFile, writeFile } = require('./file_reader.js');

var mentionsList = [];
var thoseThatAreIn = [];
var thoseThatAreOut = [];

var savedMessage = null;

function createRaid(client) {
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

              channel.send({
                "tts": false,
                "embeds": [
                  {
                    "type": "rich",
                    "title": `Destiny Raid`,
                    "description": `Sign up for Raid on 1/9/2022`,
                    "color": 0x00FFFF,
                    "fields": [
                      {
                        "name": `__🏹Hunters:__`,
                        "value": `🏹Testing Hunter`,
                        "inline": true
                      },
                      {
                        "name": `__🔨Titans:__`,
                        "value": `🔨Testing Titan`,
                        "inline": true
                      },
                      {
                        "name": `__🧙Warlock:__`,
                        "value": `🧙Testing Warlock`,
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
                    
                    const collector = embededMessage.createReactionCollector({ filter, time: 86400000 });
                    
                    collector.on('collect', (reaction, user) => {
                        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
                    });
                    
                    collector.on('end', collected => {
                        console.log(`Collected ${collected.size} items`);
                    });
                });

        }
    })
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