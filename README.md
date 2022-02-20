<p align="center">
  <img src="Rounded Logo.png" alt="icon" width="300" height="300">
</p>

# 📝 Discord Raid Bot
* Friends always forgetting raid times? Stuggling to keep your raid voice channels organized? 
* Introducing Discord Raid Bot! 📝 A one-stop-shop for organizing all of your Destinty 2 raids.

# How to run
### Requirement
* Node
* MongoDB

### Setup process
1. Run `npm install`.
2. Create a bot with Discord [here](https://discordapp.com/developers/applications/me).
3. Invite the newly created bot to a server with this link, replacing CLIENT with your bot's client ID: https://discord.com/api/oauth2/authorize?client_id=CLIENT&permissions=8&scope=bot%20applications.commands
4. Create a MongoDB Database.
5. Copy the bot's OAuth token from the Discord dashboard at the link in step 2.
6. Set the following enviorment variables:
   - `DB_USERNAME` - MongoDB database username 
   - `NODE_PASSWORD` - MongoDB database password
   - `DB_NAME` - Name of collection to be created in MonogoDB
   - `AUTH_TOKEN` - Discord OAuth token
   - `CLIENT_ID` - Discord Bot Client ID
7. Run `node bot.js`.

### Usage
1. Once added to your server from the steps in [Setup process](https://github.com/Cast324/discordraidbot#setup-process), run `/setchannel` to tell the bot which channel to send the scheduled message.
2. Run `/createraid partysize:(partySize) datetime:(dateTime) raid:(raidName) ` to see what happens!
3. Peruse the [Commands](https://github.com/Cast324/discordraidbot#commands) section to apply any other customizations!

### Commands
* `/createraid partysize:(partySize) datetime:(dateTime) raid:(raidName) ` - Creates a raid that players can react to and join the group. 
* `/ping` - Bot will respond to let you know its working!
* `/setchannel` - Set the channel the bot will post messages in.


# Thanks!
* This project was made to help organize raids for freinds with busy schedules!
* Thanks for checking it out!

<p align="center">
  Made with ❤️ by <a href="https://github.com/Cast324">Cast324</a> with help from <a href="https://github.com/SirArkimedes">SirArkimedes</a>.
</p>
