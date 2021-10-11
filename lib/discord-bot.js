import fs from 'fs';
import discordjs from 'discord.js';

import BotHelper from './base/bot-helper.js';
import BotInformation from './base/model/bot-information.js';
import BotInteraction from './base/bot-interaction.js';

export default class DiscordBot extends BotHelper {
    static add(parameters) {
        const botInformation = new DiscordBotInformation(
            parameters.redirectUri,
            parameters.id,
            parameters.scope
        );
        
        const botHelper = new DiscordBot(botInformation);
        botHelper.reconnect().catch(console.error);
    }

    async connectBot(token, tokenType) {
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
    }

    initializeBot(discord) {
        const interaction = new DiscordBotInteraction(this);
        discord.on('messageCreate', message => {
            if (message.author.id === discord.user.id) return;

            const reaction = interaction.onMessage(message.content, message.author.id);
            if (typeof reaction === 'string' && reaction.length > 0) {
                message.channel.send(reaction);
            }
        });
    }

    destroyBot(discord) {
        discord.destroy();
    }
}

class DiscordBotInformation extends BotInformation {
    constructor(redirectUri, id, scope) {
        super('discord', 'https://discord.com/api', redirectUri, id, scope);

        this.addScope('bot&permission=8');
    }

    getBotTokenPath() {
        const platform = this.getPlatform();
        
        return super.getSecretPath().replace(platform, `${platform}-bot`);
    }
}

class DiscordBotInteraction extends BotInteraction {
    emote(text) {
        if (text.match('^(?:Wink|Jookchang|Jeoleon|AwesomeFace)$')) text = `local${text}`;

        const emoji = this.getBotHelper().getBot().emojis.cache.find(emoji => emoji.name === `${text}`);
        if (emoji !== undefined) {
            return emoji.toString();
        } else {
            return null;
        }
    }
}