class Raid {

    constructor(date, raid, partySize, createdBy, messageId, channelId) {
        this.partySize = partySize;
        this.raid = raid;
        this.date = date;
        this.createdBy = createdBy;
        this.messageId = messageId;
        this.channelId = channelId;

        this.slotsFilled = 0;
        this.hunters = [];
        this.titans = [];
        this.warlocks = [];
    }
}

module.exports = {
    Raid
};