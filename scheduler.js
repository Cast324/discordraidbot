const Agenda = require("agenda");
const connect = require('./connect.js');
require('dotenv').config();
const raids = require('./raids.js');


const url = `mongodb+srv://mablades:${process.env.NODE_PASSWORD}@cluster0.0cfoc.mongodb.net/test?retryWrites=true&w=majority`;
const agenda = new Agenda({ db: { address: url } });


agenda.define("Schedule Reminder", async (job) => {
    console.log("Scheduled Reminder: " + job.attrs.data.messageId);
    const raid = await connect.getRaid(job.attrs.data.messageId);
    var message = `Time for ${raid.raid} raid!!`;
    raids.sendMessageToChannel(message);
  });

  async function start() {
    await agenda.start();
  }

  async function scheduleReminder(messageId, datetime) {

    await agenda.schedule(datetime, "Schedule Reminder", { messageId: messageId});
  }

  exports.scheduleReminder = scheduleReminder;
  exports.start = start;