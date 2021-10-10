import fs from 'fs';
import discordjs from 'discord.js';

import BotInformation from '../base/model/bot-information.js';
import DiscordBotInteraction from '../interaction/discord-bot-interaction.js';

export default class DiscordBotInformation extends BotInformation {
    getBotTokenPath() {
        const platform = this.getPlatform();
        
        return super.getSecretPath().replace(platform, `${platform}-bot`);
    }

    constructor(redirectUri, id, scope) {
        super('discord', 'https://discord.com/api', redirectUri, id, scope, async function(token, tokenType) {
            const FLAGS = discordjs.Intents.FLAGS;
            const discord = new discordjs.Client({
                intents: [
                    FLAGS.GUILDS, 
                    FLAGS.GUILD_MESSAGES,
                    FLAGS.DIRECT_MESSAGES
                ],
                http: {
                    headers: {
                        'Authorization': `${tokenType} ${token}`
                    }
                }
            });

            const botTokenPath = this.getInformation().getBotTokenPath();
            const botToken = fs.readFileSync(botTokenPath, 'utf-8');

            await discord.login(`${botToken}`);
            return discord;
        }, function(discord) {
            const interaction = new DiscordBotInteraction(this);
            discord.on('messageCreate', message => {
                if (message.author.id === discord.user.id) return;

                const reaction = interaction.onMessage(message.content, message.author.id);
                if (typeof reaction === 'string' && reaction.length > 0) {
                    message.channel.send(reaction);
                }
            });
        }, function(discord) { discord.destroy() });

        this.addScope('bot&permission=8');
    }
}