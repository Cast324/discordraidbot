const Agenda = require("agenda");
const connect = require('./connect.js');
require('dotenv').config();
const raids = require('./raids.js');


const url = `mongodb+srv://mablades:${process.env.NODE_PASSWORD}@cluster0.0cfoc.mongodb.net/test?retryWrites=true&w=majority`;
const agenda = new Agenda({ db: { address: url } });

const SCHEDULE_REMINDER_EVENT = "SCHEDULE_REMINDER_EVENT"
const DELETE_VOICE_CHANNEL_EVENT = "DELETE_VOICE_CHANNEL_EVENT"

agenda.define(DELETE_VOICE_CHANNEL_EVENT, async (job) => {
  console.log("Attempting to delete voice channel: " + job.attrs.data.channelId);
  raids.deleteChannel(job.attrs.data.channelId);
});

agenda.define(SCHEDULE_REMINDER_EVENT, async (job) => {
    console.log("Scheduled Reminder: " + job.attrs.data.messageId);
    const raid = await connect.getRaid(job.attrs.data.messageId);
    const feildValues = await raids.getFieldValues(job.attrs.data.messageId);
    var message = {
      "tts": false,
      "embeds": [
        {
          "type": "rich",
          "title": `Time for ${raid.raid} raid.`,
          "description": `Voice Channel is now Open! <#${raid.voiceChannelId}>\nFireteam:`,
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
    raids.sendMessageToChannel(message, raid);
    scheduleInitialChannelDelete(raid.voiceChannelId);
  });

  async function start() {
    await agenda.start();
  }

  async function scheduleReminder(messageId, datetime) {
    await agenda.schedule(datetime, SCHEDULE_REMINDER_EVENT, { messageId: messageId });
  }

  function scheduleInitialChannelDelete(channelId) {
    agenda.schedule("in 3 hours", DELETE_VOICE_CHANNEL_EVENT, { channelId: channelId });
  }

  function scheduleFollowUpChannelDelete(channelId) {
    console.log("Scheduled followup delete voice channel: " + channelId);
    agenda.schedule("in 1 hour", DELETE_VOICE_CHANNEL_EVENT, { channelId: channelId });
  }

  exports.scheduleReminder = scheduleReminder;
  exports.start = start;
  exports.scheduleFollowUpChannelDelete = scheduleFollowUpChannelDelete;