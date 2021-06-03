const DiscordJS = require('discord.js');
const Compute = require('@google-cloud/compute');
const compute = new Compute();
const zone = compute.zone('europe-north1-a');
const vm = zone.vm('mc-server');
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
                startInstance();
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
 
async function get_server_ip() {
 return new Promise(function(resolve, reject) {
   vm.getMetadata().then((data) => {
     resolve(data[0].networkInterfaces[0].accessConfigs[0].natIP);
   });
 });
}
 
async function check_if_server_is_ready() {
 const server_ip = await get_server_ip();
 const ready = !!server_ip;
 return ready
}
 
async function sleep(milliseconds) {
 return new Promise(function(resolve, reject) {
   setTimeout(resolve, milliseconds);
 });
}
 
async function startInstance() {
 // Start the VM
 console.log('about to start a VM');
 vm.start(function(err, operation, apiResponse) {
   console.log('instance start successfully');
 });
 console.log('the server is starting');
 while(!(await check_if_server_is_ready())) {
   console.log('Server is not ready, waiting 1 second...');
   await sleep(1000);
   console.log('Checking server readiness again...');
 }
 console.log('the server is ready');
};

client.login(process.env.TOKEN);