const Agenda = require("agenda");
const connect = require('./connect.js');
require('dotenv').config();
const raids = require('./raids.js');


const url = `mongodb+srv://arob:${process.env.NODE_PASSWORD}@cluster0.0cfoc.mongodb.net/test?retryWrites=true&w=majority`;
const agenda = new Agenda({ db: { address: url } });

agenda.define("Delete VoiceChannel", async (job) => {
  console.log("Deleted Channel: " + job.attrs.data.channelId)
  raids.deleteChannel(job.attrs.data.channelId);
})

agenda.define("Schedule Reminder", async (job) => {
    console.log("Scheduled Reminder: " + job.attrs.data.messageId);
    const raid = await connect.getRaid(job.attrs.data.messageId);
    const feildValues = await raids.getFieldValues(job.attrs.data.messageId);
    var message = {
      "tts": false,
      "embeds": [
        {
          "type": "rich",
          "title": `Time for ${raid.raid} raid.`,
          "description": `Voice Channel is now Open!\nFireteam:`,
          "color": 0x00FFFF,
          "fields": [
            {
              "name": `__🏹Hunters:__`,
              "value": feildValues.hunters,
              "inline": true
            },
            {
              "name": `__🔨Titans:__`,
              "value": feildValues.titans,
              "inline": true
            },
            {
              "name": `__🧙Warlocks:__`,
              "value": feildValues.warlocks,
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
    };
    raids.sendMessageToChannel(message);
  });

  async function start() {
    await agenda.start();
  }

  async function scheduleReminder(messageId, datetime) {

    await agenda.schedule(datetime, "Schedule Reminder", { messageId: messageId });
  }

  function scheduleChannelDelete(channelId) {
    agenda.schedule("in 5 min", "Delete VoiceChannel", { channelId: channelId});
  }

  exports.scheduleReminder = scheduleReminder;
  exports.start = start;
  exports.scheduleChannelDelete = scheduleChannelDelete;