const DiscordJS = require('discord.js');
require('dotenv').config();

const guildId = '850018302650875905';
const client = new DiscordJS.Client();

function getApp(guildId) {
    const app = client.api.applications(client.user.id);
    if(guildId){
        app.guilds(guildId);
    }
    return app
}

client.on('ready', async () => {
    console.log('The bot is ready');

    const commands = await getApp(guildId).commands.get();
    console.log(commands);

    await getApp(guildId).commands.post({
        data: {
            name: 'mcstart',
            description: 'Starta Minecraft-servern'
        }
    });

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const command = interaction.data.name.toLowerCase();

        console.log(command);

        switch (command) {
            case 'mcstart':
                reply(interaction, 'Startar servern... Detta kan ta någon minut');
                break;
        
            default:
                break;
        }
    });
});

function reply(interaction, response){
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: response
            }
        }
    })
}

client.login(process.env.TOKEN);