class Raid {
    constructor(date, raid, partySize, createdBy, messageId, channelId, guildId, voiceChannelId, eventId) {
        this.partySize = partySize;
        this.raid = raid;
        this.date = date;
        this.createdBy = createdBy;
        this.messageId = messageId;
        this.channelId = channelId;
        this.guildId = guildId;
        this.voiceChannelId = voiceChannelId;
        this.eventId = eventId;

        this.slotsFilled = 0;
        this.hunters = [];
        this.titans = [];
        this.warlocks = [];
        this.fills = [];
    }

    databaseDocument() {
        return {
            "partySize": this.partySize,
            "raid": this.raid,
            "date": this.date,
            "createdBy": this.createdBy,
            "messageId": this.messageId,
            "channelId": this.channelId,
            "guildId": this.guildId,
            "slotsFilled": this.slotsFilled,
            "hunters": this.hunters,
            "titans": this.titans,
            "warlocks": this.warlocks,
            "fills": this.fills,
            "voiceChannelId": this.voiceChannelId,
            "eventId": this.eventId,
        }
    }
}

module.exports = {
    Raid
};