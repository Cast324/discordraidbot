const { MongoClient, FindCursor } = require("mongodb");
const Raid = require('./raid');
require('dotenv').config();

// Replace the following with your Atlas connection string                                                                                                                                        
const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.NODE_PASSWORD}@cluster0.0cfoc.mongodb.net/${process.env.DB_NAME}stg?retryWrites=true&w=majority`;
const client = new MongoClient(url);

// The database to use
const dbName = process.env.DB_NAME;

async function createRaid(raid) {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        const col = db.collection("raids");
        // Insert a single document, wait for promise so we can read it back
        const p = await col.insertOne(raid.databaseDocument());
    } catch (err) {
        console.log(err.stack);
    }

    finally {
        await client.close();
    }
}

async function updateRaid(messageId, raid) {
    try {
        if (!isConnected()) {
            await client.connect();
        }
        const db = client.db(dbName);

        const col = db.collection("raids");

        await col.updateOne({ messageId: messageId }, { $set: raid });
    } catch (error) {
        console.log(error);
    }
}

async function getRaid(messageId) {
    try {
        if (!isConnected()) {
            await client.connect();
        }
        const db = client.db(dbName);

        const col = db.collection("raids");

        const raid = await col.findOne({ messageId: messageId });
        return raid;
    } catch (error) {
        console.log(error);
    }
}

function isConnected() {
    return !!client && !!client.topology && client.topology.isConnected()
}


exports.createRaid = createRaid;
exports.updateRaid = updateRaid;
exports.getRaid = getRaid;