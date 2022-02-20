class Raid {
    constructor(date, raid, partySize, createdBy, messageId, channelId, voiceChannelId, eventId) {
        this.partySize = partySize;
        this.raid = raid;
        this.date = date;
        this.createdBy = createdBy;
        this.messageId = messageId;
        this.channelId = channelId;
        this.voiceChannelId = voiceChannelId;
        this.eventId = eventId;

        this.slotsFilled = 0;
        this.hunters = [];
        this.titans = [];
        this.warlocks = [];
    }

    databaseDocument() {
        return {
            "partySize": this.partySize,
            "raid": this.raid,
            "date": this.date,
            "createdBy": this.createdBy,
            "messageId": this.messageId,
            "channelId": this.channelId,
            "slotsFilled": this.slotsFilled,
            "hunters": this.hunters,
            "titans": this.titans,
            "warlocks": this.warlocks,
            "voiceChannelId": this.voiceChannelId,
            "eventId": this.eventId,
        }
    }
}

module.exports = {
    Raid
};